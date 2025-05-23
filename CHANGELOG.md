## 2.2.0

- feat: Support Node 24 (#12)
- ci: Bump Ubuntu build version (#13)

## 2.1.0

- feat: Support Electron (#9)
- fix: Fix and test bundling (#8)

## 2.0.0

The profiling-node binaries were moved out of the JavaScript monorepo and into their own repository.

## Repository Change.

The profiling-node package was migrated to sentry-javascript monorepo.

## 1.3.3

### Various fixes & improvements

- ci: make clang-format error when formatting errors are raised. (#230) by @JonasBa
- fix: cleanup timer and reuse exports (#229) by @JonasBa

## 1.3.2

### Various fixes & improvements

- deps(detect-libc): detect-libc is required for install scripts (#226) by @JonasBa

## 1.3.1

### Various fixes & improvements

- fix(profiling): add node-abi (d3b3ea9c) by @JonasBa

## 1.3.0

### Various fixes & improvements

- fix(profiling): node-gyp missing python (#223) by @JonasBa
- fix: change package.json keys (#222) by @anonrig
- test: move tests to dedicated test folder (#221) by @JonasBa
- chore: remove prettier (#220) by @anonrig
- format: add clang format (#214) by @JonasBa
- ref(deps) move all deps to dev deps (#218) by @JonasBa
- docs: add rollup external config section (#216) by @JonasBa
- deps: update to 7.85 (#215) by @JonasBa
- perf: avoid deep string copy (#213) by @anonrig
- chore: Add vite external to profiling node instructions (#209) by @AbhiPrasad

## 1.2.6

### Various fixes & improvements

- fix: check inf and remove rounding (#208) by @JonasBa
- fix(isnan): set rate to 0 if its nan (#207) by @JonasBa

## 1.2.5

### Various fixes & improvements

- fix(profiling): cap double precision (#206) by @JonasBa

## 1.2.4

### Various fixes & improvements

- fix(measurements): guard from negative cpu usage (c7ebac41) by @JonasBa

## 1.2.3

### Various fixes & improvements

- fix(profiling): if count is 0 dont serialize measurements (#205) by @JonasBa

## 1.2.2

### Various fixes & improvements

- deps(sentry): bump sentry deps (#203) by @sanjaytwisk
- build(deps-dev): bump @babel/traverse from 7.22.20 to 7.23.2 (#202) by @dependabot
- feat(preprocessEvent): emit preprocessEvent for profiles (#198) by @JonasBa
- Update README.md to include Next.js 13+ bundling (#200) by @Negan1911

## 1.2.1

### Various fixes & improvements

- fix: dont throw if profiler returns nulptr (#197) by @JonasBa

## 1.2.0

### Various fixes & improvements

- fix(build): catch spawn err (#193) by @JonasBa
- fix(build): cross compile from x64 to arm (#194) by @JonasBa
- feat(measurements): collect heap usage (#187) by @JonasBa

## 1.1.3

### Various fixes & improvements

- deps(sentry): bump sentry deps (#191) by @JonasBa
- ci: test app build and run before publish (#183) by @JonasBa
- build(deps-dev): bump word-wrap from 1.2.3 to 1.2.4 (#185) by @dependabot
- fix(types): correct frame type (cc74b6e1) by @JonasBa

## 1.1.2

### Various fixes & improvements

- fix: revert output of types to single file (#182) by @JonasBa

## 1.1.1

### Various fixes & improvements

- fix: setup musl (34874a63) by @JonasBa
- fix: attempt to recompile on all errors (#180) by @JonasBa
- fix:rebuild binary on any error (#179) by @JonasBa

## 1.1.0

### Various fixes & improvements

- bindings: prebuild more binaries for node 20 (#177) by @JonasBa
- build(deps): bump semver from 6.3.0 to 6.3.1 (#175) by @dependabot
- ref(profiling): change import so contextReplacementPlugin can ignore warning and attempt to provide darwin binaries
  (#176) by @JonasBa

## 1.0.9

### Various fixes & improvements

- fix(require): require is no longer async (#174) by @JonasBa

## 1.0.8

### Various fixes & improvements

- fix: use gnu aarch compiler for arm64 binary (#172) by @bohdanw2
- fix: Issue fixed for building binary with recompileFromSource (#173) by @whaagmans

## 1.0.7

### Various fixes & improvements

- fix(build): overwrited dest target (b741891d) by @JonasBa
- fix(build): run as single spawn cmd and fail if target already exists (#169) by @JonasBa
- build: stop error handling and just propagate all errors (#167) by @JonasBa
- build: fix typo (9dbc32fb) by @JonasBa
- build: just dont handle errors (ee0f9b95) by @JonasBa
- build: improve recompile error handling (07f2fd4d) by @JonasBa

## 1.0.6

### Various fixes & improvements

- build: drop exports entirely (28db74c6) by @JonasBa

## 1.0.5

### Various fixes & improvements

- build: drop esm support (#166) by @JonasBa

## 1.0.4

### Various fixes & improvements

- fix: check compile on install instead of postinstall (#163) by @JonasBa

## 1.0.3

### Various fixes & improvements

- Revert "fix: require instead of import in esm (#162)" (3b2f77fb) by @JonasBa

## 1.0.2

### Various fixes & improvements

- fix: require instead of import in esm (#162) by @JonasBa

## 1.0.1

### Various fixes & improvements

- fix: polyfill to level createRequire for esm (#161) by @JonasBa

## 1.0.0

- No documented changes.

## 1.0.0-beta.2

### Various fixes & improvements

- fix: remove esm polyfills (#159) by @JonasBa

## 1.0.0-beta.1

### Various fixes & improvements

- build: run update before installing tooling to fix stale index (e4c0916e) by @JonasBa
- fix broken reference to copy-target script (#156) by @alekitto
- fix(profiling): remove app_root relative dir detection (#155) by @JonasBa
- fix(profiling): fix build banner typo (47da6797) by @JonasBa
- readme: add prune docs (9e4a0f3f) by @JonasBa

## 1.0.0-alpha.7

### Various fixes & improvements

- ref(tracing): drop @sentry/tracing (#153) by @JonasBa
- fix(esm): fix esm compile error (1c4a3cc6) by @JonasBa
- deps(tracing): remove tracing dependency (#152) by @JonasBa
- feat(scripts): introduce a cleanup script (#151) by @JonasBa
- feat(profiling): debug_id support (#144) by @JonasBa

## 1.0.0-alpha.6

### Various fixes & improvements

- readme: drop beta mentions (c3c66a72) by @JonasBa
- ci: test on node20 (d33110de) by @JonasBa
- ref: remove options options type (41b8544f) by @JonasBa
- ref: use options type (154255d3) by @JonasBa
- fix: segfault in node18 (95545180) by @JonasBa
- fix identifier (21425e4f) by @JonasBa
- rename to mjs (a4d50996) by @JonasBa
- fallthrough in switch (e9f6a872) by @JonasBa
- fix: add back return type (d7560395) by @JonasBa
- fix: profiling binary fallthrough (beaf0c0a) by @JonasBa
- fix: build needs require (bc39eaab) by @JonasBa
- fix(build): enumerate precompiled binaries (#146) by @JonasBa
- feat(profiling): bundle lib code (#145) by @JonasBa
- fix(profiling): add exports to package.json (#142) by @JonasBa
- perf: optimize string ops + remove nan (#140) by @JonasBa
- ref: remove profile context before sending (#138) by @JonasBa

## 1.0.0-alpha.5

### Various fixes & improvements

- fix: use format version (0850fa0c) by @JonasBa

## 1.0.0-alpha.4

### Various fixes & improvements

- fix(sdk): bump sdk version and read it (#137) by @JonasBa

## 1.0.0-alpha.3

### Various fixes & improvements

- fix(frames): fix frame attributes (afc1c7b0) by @JonasBa

## 1.0.0-alpha.2

### Various fixes & improvements

- feat(esm): build esm properly (#135) by @JonasBa

## 1.0.0-alpha.1

### Various fixes & improvements

- fix(ci): unpack binaries to lib/binaries (5bbf957f) by @JonasBa
- gh: fix label for install issue (d0602b40) by @JonasBa
- gh: fix label for install issue (ca82e73f) by @JonasBa
- gh: add installation issue template (d1f0a304) by @JonasBa
- ci: downgrade to ubuntu 20.04 (8364deba) by @JonasBa
- fix(status): inline status assertions (#133) by @JonasBa
- perf: use a module cache (#131) by @JonasBa
- ci: bump and pin node images (#130) by @JonasBa
- feat(module): parse module (#129) by @JonasBa
- fix(precompile): fix dir sync (#128) by @JonasBa
- ref: remove test log (c7529b14) by @JonasBa
- ref(profiling): drop nan for node abi (#127) by @JonasBa
- feat(build): output esm and cjs modules (#126) by @JonasBa
- Check if module exists before loading. Compile if missing (#122) by @vidhu
- Add @sentry/core as dep (#125) by @vidhu

## 0.3.0

### Various fixes & improvements

- fix(profiling): avoid unnecessary copy operations (#117) by @JonasBa
- feat(profiling): expose timeout experiment and handle timeout in hooks (#118) by @JonasBa
- ref(profiling): add SDK hooks support (#110) by @JonasBa
- build(deps-dev): bump sqlite3 from 5.1.2 to 5.1.5 (#111) by @dependabot
- docs: update install link for sentry profiling (#116) by @emilsivervik
- feat(profiling): only mark in_app: false for system code (#114) by @JonasBa
- ref(format): remove format macros (cee68c53) by @JonasBa
- ref(prebuilds): remove binary (6ff35ecb) by @JonasBa
- feat(profiling): add profilesSampler (#109) by @JonasBa
- ref(format): remove transactions array in favor of transaction property (#108) by @JonasBa
- chore: improve documentation around prebuild binaries (dc37cbfb) by @JonasBa

## 0.2.2

### Various fixes & improvements

- deps(sentry): bump sentry packages (22610c47) by @JonasBa

## 0.2.1

### Various fixes & improvements

- Update README.md (a1e128c2) by @JonasBa
- Update README.md (d0ad2379) by @JonasBa
- Update README.md (d97aad6a) by @JonasBa
- fix(env): read env from sdk (#103) by @JonasBa

## 0.2.0

### Various fixes & improvements

- feat(profiling): switch to eager logging by default (#102) by @JonasBa
- Update README.md (2d8fd065) by @JonasBa
- build(deps): bump http-cache-semantics from 4.1.0 to 4.1.1 (#100) by @dependabot

## 0.1.0

- No documented changes.

## 0.1.0-alpha.2

### Various fixes & improvements

- fix(bin): downgrade ubuntu to 20.04 (#99) by @JonasBa

## 0.1.0-alpha.1

### Various fixes & improvements

- fix(linux): if dlopen fails, build from source (63632046) by @JonasBa
- fix(build): avoid from compiling the build script (#98) by @JonasBa
- fix(test): remove only (6cd37259) by @JonasBa
- feat(ci): run jest with --silent (#96) by @JonasBa
- feat(profiling): add profile context (#95) by @JonasBa
- feat(profiling): discard profiles with <= 1 sample (#94) by @JonasBa
- build(binaries): prebuild binaries for more arch (#92) by @JonasBa

## 0.0.13

### Various fixes & improvements

- fix(segfault): fix return value order (#89) by @JonasBa
- fix(uuid): uuid is 32hex in sentry (#91) by @JonasBa
- test(build): add node 19 to build matrix (#87) by @JonasBa
- build(deps): bump json5 from 2.2.1 to 2.2.3 (#86) by @dependabot
- feat(profiling): add debug logs (#82) by @JonasBa
- fix(sampleRate): profilesSampleRate and tracesSampleRate are multiplied (#77) by @JonasBa
- fix(sdk): use release instead of sdk release (#76) by @JonasBa
- feat(filename): generate filename from abs path (#75) by @JonasBa
- fix: path -> absPath (#72) by @JonasBa

## 0.0.12

### Various fixes & improvements

- fix(timestamps): int64_t (#69) by @JonasBa

## 0.0.11

### Various fixes & improvements

- fix(stack): use unique pointer not i (#68) by @JonasBa

## 0.0.10

### Various fixes & improvements

- fix(profile): wrong stack indexing insertion (#67) by @JonasBa
- docs: readme semicolon (#66) by @scttcper
- Update README.md (595ebb99) by @JonasBa

## 0.0.9

### Various fixes & improvements

- fix(envelope): missmatch in type guard (#65) by @JonasBa
- feat(binaries): precompile binaries (#64) by @JonasBa

## 0.0.8

### Various fixes & improvements

- fix(profiling): remove build script (c5cf7353) by @JonasBa

## 0.0.7

### Various fixes & improvements

- ref(sdk): remove spans (#62) by @JonasBa
- feat(profiling): use env variable instead of compile time (#61) by @JonasBa

## 0.0.6

### Various fixes & improvements

- ref(sdk): add temporary spans (#60) by @JonasBa
- ref(sdk): remove sdk tag (#59) by @JonasBa
- fix: fix javascript repo reference (af046f28) by @JonasBa

## 0.0.5

### Various fixes & improvements

- feat(profiling): index stacks (#58) by @JonasBa
- test(config): skip benchmarks (ee8e4d90) by @JonasBa
- chore(pkg): add github (#57) by @JonasBa
- test(samples): bump min samples (123928a2) by @JonasBa

## 0.0.4

### Various fixes & improvements

- chore(license): switch to MIT (#56) by @JonasBa
- fix(release): js not sh (27482070) by @JonasBa

## 0.0.3

### Various fixes & improvements

- fix(test): fix setTag test (096619d9) by @JonasBa
- chore(deps): bump (331e8450) by @JonasBa
- fix(profiler): fix typo (f1cb8823) by @JonasBa
- feat(profiler): set logging mode as tag (f2517f69) by @JonasBa

## 0.0.2

### Various fixes & improvements

- ref(benchmark): add jest benchmark (#54) by @JonasBa
- build(gyp): add compile time flag for profiler logging strategy (#55) by @JonasBa

## 0.0.1

### Various fixes & improvements

- feat(profile): log call site info (#53) by @JonasBa
- fix(benchmark): recompute json (eddcad28) by @JonasBa
- fix(benchmark): pass both options (b9911726) by @JonasBa
- fix(benchmark): pass option to compare (ce805797) by @JonasBa
- fix(benchmark): run node benchmark instead of compare (0a4d9abb) by @JonasBa
- fix(benchmark): run node benchmark (595a4f96) by @JonasBa
- fix(scripts): stash and apply script results (3d4c92df) by @JonasBa
- fix(scripts): stash and apply script results (a9e7f360) by @JonasBa
- fix(benchmark): allow running between two commits (#52) by @JonasBa
- test(threshold) increase max sample threshold (847f42ac) by @JonasBa
- test(threshold) increase max sample threshold (6d10b885) by @JonasBa
- feat(profiling): adjust sampling frequency (#50) by @JonasBa
- chore(github): add issue bug template (d5b488ad) by @JonasBa
- chore(github): add feature template (f137585b) by @JonasBa
- chore(github): add pull request template (759237f0) by @JonasBa

## 0.0.0-alpha.6

### Various fixes & improvements

- feat(sdk): use uuid to avoid ignored transactions (#47) by @JonasBa
- fix(profiling): correct ts (b46547f6) by @JonasBa
- feat(sdk): add max duration timeout (#46) by @JonasBa
- fix(units): report ns to backend (#45) by @JonasBa
- feat(timestamps): more accurate timestamps (#44) by @JonasBa
- ref(hubextension): explain finish reference (05924fe7) by @JonasBa
- fix(sampling): remove unnecessary negate (1b6fdab5) by @JonasBa
- fix(profile): rename fields and eval device info only once (#43) by @JonasBa
- feat(skd): add better messaging when we cannot patch the lib (#42) by @JonasBa
- chore(github): add contributing (#41) by @JonasBa

## 0.0.0-alpha.5

### Various fixes & improvements

- fix(c++): make sure we use unique_id (#40) by @JonasBa
- chore(readme): improve wording (5f439bba) by @JonasBa
- chore(workers): remove disclaimer as we do not support node 10 (ac15d4f7) by @JonasBa

## 0.0.0-alpha.4

### Various fixes & improvements

- chore(readme): overhead explanation (c159e6bd) by @JonasBa
- chore(readme): overhead explanation (58d865c5) by @JonasBa
- feat(playground): add express node test (#39) by @JonasBa
- feat(c++): cleanup addon data (#38) by @JonasBa
- feat(playground): add express integration (#37) by @JonasBa
- chore(readme): remove todo (505888e7) by @JonasBa

## 0.0.0-alpha.3

### Various fixes & improvements

- deps(nan): move to dependencies (#36) by @JonasBa

## 0.0.0-alpha.2

### Various fixes & improvements

- feat(build): move node-gyp to dep (#33) by @JonasBa

## 0.0.0-alpha.1

### Various fixes & improvements

- ci: use npm pack (#32) by @JonasBa
- fix(ci): remove dependant job (#31) by @JonasBa
- ci(craft): setup build (#30) by @JonasBa
- fix(ci): run ci for release (#28) by @JonasBa
- chore(craft): add bump version script (#26) by @JonasBa
- chore(changelog): add changelog (#25) by @JonasBa
