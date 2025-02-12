import { CpuProfilerBindings, ProfileFormat } from '@sentry-internal/node-cpu-profiler';

CpuProfilerBindings.startProfiling('test');

setTimeout(() => {
  const report = CpuProfilerBindings.stopProfiling('test', ProfileFormat.THREAD);
  console.assert(report);
  process.exit(0);
}, 5000);
