process.on('unhandledRejection', (err) => {
  console.error(err);
  process.exit(1);
});
process.on('uncaughtException', (err) => {
  console.error(err);
  process.exit(1);
});

const { CpuProfilerBindings, ProfileFormat } = await import('@sentry-internal/node-cpu-profiler');

CpuProfilerBindings.startProfiling('test');

setTimeout(() => {
  const report = CpuProfilerBindings.stopProfiling('test', ProfileFormat.THREAD);
  console.assert(report);
  process.exit(0);
}, 5000);
