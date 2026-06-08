import { CpuProfilerBindings, ProfileFormat } from '@sentry/node-cpu-profiler';

CpuProfilerBindings.startProfiling('test');

setTimeout(() => {
  const report = CpuProfilerBindings.stopProfiling('test', ProfileFormat.THREAD);
  console.assert(report);
  process.exit(0);
}, 5000);
