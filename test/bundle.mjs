import { inspect } from 'node:util';

import { CpuProfilerBindings, ProfileFormat } from '@sentry-internal/node-cpu-profiler';

CpuProfilerBindings.startProfiling('test');

setTimeout(() => {
  const report = CpuProfilerBindings.stopProfiling('test', ProfileFormat.THREAD);
  console.log(inspect(report, false, null, true));
}, 5000);
