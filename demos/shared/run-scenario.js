/* eslint-disable no-console */
// Runs a demo scenario end to end: for v1 and v2 of the handler, starts the
// instrumented server pointing at the locally built profiler binary, warms it
// with normal traffic so TurboFan optimizes the hot path, then sends mixed
// traffic (~15% poisoned requests), and finally reports every deopt_reason
// that reached the captured Sentry profiles.
//
// Usage: node shared/run-scenario.js <scenario-dir> [--trace-deopt]
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const autocannon = require('autocannon');

const WEBHOOK_TYPES = [
  'order.created',
  'order.updated',
  'order.deleted',
  'user.created',
  'user.deleted',
  'invoice.paid',
  'invoice.voided',
  'ping',
];

function webhookBatch(mixed) {
  return JSON.stringify({
    events: Array.from({ length: 500 }, (_, i) => ({
      type: mixed ? WEBHOOK_TYPES[i % WEBHOOK_TYPES.length] : 'ping',
      seq: i,
    })),
  });
}

const SCENARIOS = {
  'scenario-1-events': {
    normal: { method: 'GET', path: '/api/events?batch=recent' },
    poison: { method: 'GET', path: '/api/events?batch=incidents' },
    functions: ['toDto', 'mapEvents', 'summarizeDtos', 'eventsHandler'],
  },
  'scenario-2-stats': {
    normal: { method: 'GET', path: '/api/stats?source=legacy' },
    poison: { method: 'GET', path: '/api/stats?source=partner' },
    functions: ['sumStats', 'statsHandler'],
  },
  'scenario-3-series': {
    normal: { method: 'GET', path: '/api/series?window=recent' },
    poison: { method: 'GET', path: '/api/series?window=annotated' },
    functions: ['buildSeries', 'aggregateSeries', 'seriesHandler'],
  },
  'scenario-4-webhook': {
    normal: {
      method: 'POST',
      path: '/webhook',
      headers: { 'content-type': 'application/json' },
      body: webhookBatch(false),
    },
    poison: {
      method: 'POST',
      path: '/webhook',
      headers: { 'content-type': 'application/json' },
      body: webhookBatch(true),
    },
    functions: ['dispatchEvent', 'webhookHandler'],
  },
  // Scenario 5 is a time bomb, not an input-shape poison: identical sustained
  // traffic until the v2 accumulator overflows the SMI range.
  'scenario-5-metrics': {
    normal: { method: 'GET', path: '/api/metrics' },
    poison: { method: 'GET', path: '/api/metrics' },
    functions: ['record', 'processSample', 'metricsHandler'],
  },
};

const scenarioName = process.argv[2];
const traceDeopt = process.argv.includes('--trace-deopt');
const scenario = SCENARIOS[scenarioName];

if (!scenario) {
  console.error(`Usage: node shared/run-scenario.js <${Object.keys(SCENARIOS).join('|')}> [--trace-deopt]`);
  process.exit(1);
}

const demosRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(demosRoot, '..');
const scenarioDir = path.join(demosRoot, scenarioName);
const capturesDir = path.join(demosRoot, 'captures');

const PORT = Number(process.env.PORT || 4319);
const WARM_SECONDS = Number(process.env.WARM_SECONDS || 8);
const MIX_SECONDS = Number(process.env.MIX_SECONDS || 8);

function profilerBinaryPath() {
  const abi = process.versions.modules;
  const identifier = [process.platform, process.arch, abi].join('-');
  const binary = path.join(repoRoot, 'lib', `sentry_cpu_profiler-${identifier}.node`);
  if (!fs.existsSync(binary)) {
    console.error(`Profiler binary not found: ${binary}`);
    console.error(`Build it first: yarn build (in the repo root, with node ${os.release()} / ABI ${abi})`);
    process.exit(1);
  }
  return binary;
}

function startServer(version, sinkFile) {
  const nodeArgs = traceDeopt ? ['--trace-deopt'] : [];
  const child = spawn(process.execPath, [...nodeArgs, path.join(scenarioDir, 'server.js')], {
    env: {
      ...process.env,
      APP_VERSION: version,
      PORT: String(PORT),
      SINK_FILE: sinkFile,
      SENTRY_PROFILER_BINARY_PATH: profilerBinaryPath(),
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let stdout = '';
  child.stdout.on('data', d => {
    stdout += d;
  });
  child.stderr.on('data', d => {
    stdout += d;
  });
  child.getOutput = () => stdout;

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('server did not start within 15s')), 15000);
    const check = setInterval(() => {
      if (stdout.includes(`listening on ${PORT}`)) {
        clearTimeout(timer);
        clearInterval(check);
        resolve(child);
      }
    }, 100);
    child.on('exit', code => {
      clearTimeout(timer);
      clearInterval(check);
      reject(new Error(`server exited early with code ${code}:\n${stdout}`));
    });
  });
}

function stopServer(child) {
  return new Promise(resolve => {
    child.on('exit', () => resolve());
    child.kill('SIGTERM');
    setTimeout(() => child.kill('SIGKILL'), 5000).unref();
  });
}

async function runLoad(requests, seconds) {
  return autocannon({
    url: `http://127.0.0.1:${PORT}`,
    connections: 4,
    duration: seconds,
    requests,
  });
}

function analyzeSink(sinkFile, version) {
  const handlerFile = path.join(scenarioDir, `handlers-${version}.js`);
  const handlerSource = fs.readFileSync(handlerFile, 'utf-8');

  const lines = fs.existsSync(sinkFile) ? fs.readFileSync(sinkFile, 'utf-8').trim().split('\n').filter(Boolean) : [];
  const found = new Map();
  let profileCount = 0;

  for (const line of lines) {
    const payload = JSON.parse(line);
    const frames = payload.profile?.frames ?? [];
    profileCount++;
    for (const frame of frames) {
      if (!frame.deopt_reason) continue;
      const key = `${frame.function}::${frame.deopt_reason}`;
      if (!found.has(key)) {
        found.set(key, { frame, count: 0 });
      }
      found.get(key).count++;
    }
  }

  const deopts = [...found.values()].map(({ frame, count }) => {
    const site =
      frame.abs_path === handlerFile && frame.lineno > 0
        ? { line: frame.lineno, text: handlerSource.split('\n')[frame.lineno - 1]?.trim() ?? '' }
        : null;
    return { frame, count, site };
  });

  return { profileCount, deopts };
}

function extractTraceDeoptLines(output) {
  return output
    .split('\n')
    .filter(l => l.includes('bailout') && scenario.functions.some(fn => l.includes(`<JSFunction ${fn} `)))
    .map(l => {
      const reason = l.match(/reason: ([^)]+)\)/)?.[1] ?? '?';
      const fn = l.match(/<JSFunction ([^ ]+) /)?.[1] ?? '?';
      return `${fn}: ${reason}`;
    });
}

async function runVersion(version) {
  const sinkFile = path.join(capturesDir, `${scenarioName}-${version}.jsonl`);
  fs.mkdirSync(capturesDir, { recursive: true });
  fs.rmSync(sinkFile, { force: true });

  console.log(`\n━━━ ${scenarioName} ${version} ━━━`);
  const server = await startServer(version, sinkFile);

  console.log(`  warm phase: ${WARM_SECONDS}s of normal traffic (TurboFan optimizes the handler)`);
  const warm = await runLoad([scenario.normal], WARM_SECONDS);

  console.log('  mixed phase: ~15% of requests hit the new code path');
  const mixed = await runLoad(
    [...Array.from({ length: 6 }, () => scenario.normal), scenario.poison],
    MIX_SECONDS,
  );

  await new Promise(r => setTimeout(r, 1500));
  await stopServer(server);

  const analysis = analyzeSink(sinkFile, version);
  const traceLines = traceDeopt ? extractTraceDeoptLines(server.getOutput()) : null;

  return {
    version,
    warmRps: warm.requests.average,
    mixedRps: mixed.requests.average,
    mixedP99: mixed.latency.p99,
    analysis,
    traceLines,
  };
}

function report(results) {
  console.log(`\n━━━ Results: ${scenarioName} ━━━\n`);
  console.log('  version | req/s (warm) | req/s (mixed) | p99 ms | profiles | frames with deopt_reason');
  for (const r of results) {
    console.log(
      `  ${r.version}      | ${String(Math.round(r.warmRps)).padStart(12)} | ${String(Math.round(r.mixedRps)).padStart(13)} | ${String(r.mixedP99).padStart(6)} | ${String(r.analysis.profileCount).padStart(8)} | ${r.analysis.deopts.length}`,
    );
  }

  for (const r of results) {
    if (r.analysis.deopts.length === 0) continue;
    console.log(`\n  ${r.version} deopt reasons captured in Sentry profiles:`);
    for (const { frame, count, site } of r.analysis.deopts) {
      console.log(`   • ${frame.function} — "${frame.deopt_reason}" (${count} profile frame${count > 1 ? 's' : ''})`);
      if (site) {
        console.log(`     └ handlers-${r.version}.js:${site.line}  ${site.text}`);
      }
    }
    if (r.traceLines) {
      console.log(`\n  ${r.version} --trace-deopt cross-check (ground truth from V8):`);
      for (const l of [...new Set(r.traceLines)]) console.log(`   • ${l}`);
    }
  }

  const v1 = results.find(r => r.version === 'v1');
  const v2 = results.find(r => r.version === 'v2');
  const v1Clean = v1.analysis.deopts.filter(d => scenario.functions.includes(d.frame.function)).length === 0;
  const v2Caught = v2.analysis.deopts.filter(d => scenario.functions.includes(d.frame.function)).length > 0;

  console.log(`\n  v1 handler frames clean: ${v1Clean ? 'yes ✓' : 'NO ✗'}`);
  console.log(`  v2 deopt captured with reason + source line: ${v2Caught ? 'yes ✓' : 'NO ✗'}`);
  process.exitCode = v1Clean && v2Caught ? 0 : 1;
}

(async () => {
  const results = [];
  for (const version of ['v1', 'v2']) {
    results.push(await runVersion(version));
  }
  report(results);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
