# V8 deopt-reason capture demos

Demo apps proving that capturing V8's per-frame **deopt reason** in the Sentry
Node profiler catches real, regression-shaped performance problems — the kind a
customer ships in an innocent-looking PR to an HTTP handler.

Sentry already detects *"this endpoint regressed at this release"*. The deopt
reason adds the **why** (the mechanism), pointing back at the offending
function.

## What the profiler change does

The native binding (`bindings/cpu_profiler.cc` in this repo) now reads
`v8::CpuProfileNode::GetDeoptInfos()` when building profile frames. Frames for
functions that were TurboFan-optimized and then **deoptimized during the
profiling window** carry one new field:

```ts
deopt_reason?: string;   // e.g. "wrong map", "overflow", "wrong name"
```

Attribution is **deterministic, not sampling luck**: when a deopt fires, V8
synchronously injects a synthetic sample at the deopt site
(`ProfilerEventsProcessor::AddDeoptStack`), so the reason lands on the frame
even at the default 99Hz sampling rate.

> **Node version note:** verified working on Node 20.19, 22.20, and 24.8+.
> Node **24.0.0** ships an early V8 13.6 with a regression that drops the
> attribution (fixed upstream by 24.8.0); this repo's volta pin was bumped
> accordingly.

## The scenarios

Each scenario is a realistic Express endpoint instrumented with `@sentry/node`
+ `@sentry/profiling-node`, shipped as a **before/after pair**: `handlers-v1.js`
stays optimized; `handlers-v2.js` differs by a small, plausible "customer PR"
diff that introduces a deopt on the hot request path.

| scenario | endpoint | the v1 → v2 diff | observed deopt_reason |
|---|---|---|---|
| `scenario-1-events` | `GET /api/events` — maps rows to response DTOs | `if (e.stack) dto.stack = e.stack` — attach stack traces to error DTOs | `wrong map` (DTO consumer), `Insufficient type feedback for generic named access` (mapper) |
| `scenario-2-stats` | `GET /api/stats` — sums amounts over ledger rows | onboard a new payment source whose rows are shaped differently and carry fractional/missing amounts (`total += r.amount ?? 0`) | `wrong map` (summing loop) |
| `scenario-3-series` | `GET /api/series` — builds numeric time-series | `series.push(p.label ?? p.value)` — surface spike annotations | `wrong map` (series builder and numeric aggregator) |
| `scenario-4-webhook` | `POST /webhook` — dispatches events by type | `(handlers[evt.type] \|\| handlers.default)(evt)` — enable type routing | `wrong name` (megamorphic keyed dispatch) |
| `scenario-5-metrics` | `GET /api/metrics` — per-sample accumulator | `this.elapsedNs += Math.round(durMs * 1e6)` — switch metrics to ns precision | `overflow` (SMI-range overflow), follow-on `wrong map` |

The load pattern is the point: the handler first gets **optimized** under
normal traffic, then sees the poisoning input **organically** (~15% of mixed
traffic; scenario 5 is a time bomb under identical sustained load) — exactly
how a customer would trip it. No `--allow-natives-syntax`, no forced
optimization.

## Running

```sh
# once, in the repo root: build the native binding for your Node version
yarn build

cd demos
npm install
npm run scenario-1        # ... scenario-2 through scenario-5

# cross-check captured reasons against V8's ground truth
node shared/run-scenario.js scenario-1-events --trace-deopt
```

The runner, for each of v1 and v2:

1. starts the scenario server with `SENTRY_PROFILER_BINARY_PATH` pointing at
   the locally built binding (stock npm `@sentry/profiling-node` on top),
2. captures every profile envelope item to `captures/*.jsonl` via a
   `beforeEnvelope` hook + discarding transport (ingestion pipeline bypassed),
3. warms the endpoint with autocannon (TurboFan optimizes the handler),
4. sends mixed traffic where ~1 in 7 requests hits the new code path,
5. reports every `deopt_reason` found in the captured profiles, with the
   deopting frame's own line in the handler source.

## What success looks like

```
  version | req/s (warm) | req/s (mixed) | p99 ms | profiles | frames with deopt_reason
  v1      |          152 |           169 |    236 |       61 | 0
  v2      |          150 |           153 |    242 |       79 | 3

  v2 deopt reasons captured in Sentry profiles:
   • summarizeDtos — "wrong map" (1 profile frame)
   • toDto — "Insufficient type feedback for generic named access"
   ...

  v2 --trace-deopt cross-check (ground truth from V8):
   • summarizeDtos: wrong map
   ...

  v1 handler frames clean: yes ✓
  v2 deopt captured with reason + source line: yes ✓
```

A normal flamegraph would only say "this handler got slower"; the deopt reason
names the mechanism on the exact frame — including the honest subtlety that the
*deopting* frame is often the downstream **consumer** of the polymorphic
objects (`summarizeDtos`), while the *cause* is the construction site
(`toDto`).

## Deopt-shape gotchas (learned building these)

Two findings worth knowing when reproducing deopts in modern V8:

- **Poison data must be born after optimization.** If objects with the new
  shape/representation exist anywhere before the hot function tiers up, V8
  generalizes its type feedback at object-creation time and the optimized code
  handles the "poison" natively — no deopt ever happens.
- **Representation changes on a shared transition chain invalidate silently.**
  If the new rows differ only by field representation (int → float on the same
  property order), creating them deprecates the old hidden class and V8 drops
  the optimized code via a dependency *without a deopt event* when the
  function isn't on-stack. An observable eager `wrong map` deopt needs the new
  shape on a separate transition branch (different property set/order) so the
  optimized map check fails at read time.
