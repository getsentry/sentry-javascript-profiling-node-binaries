import { CpuProfilerBindings, ProfileFormat } from '@sentry-internal/node-cpu-profiler';

process.on('uncaughtException', (err) => {
  console.error(err);
  process.exit(1);
});
process.on('unhandledRejection', (err) => {
  console.error(err);
  process.exit(1);
 });

CpuProfilerBindings.startProfiling('test');

setTimeout(() => {
  const report = CpuProfilerBindings.stopProfiling('test', ProfileFormat.THREAD);
  console.assert(report);
  process.exit(0);
}, 5000);
