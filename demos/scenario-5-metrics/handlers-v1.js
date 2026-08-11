// GET /api/metrics handler, v1: processes a batch of samples and records
// per-sample processing time (milliseconds) into a process-wide accumulator.
const { getWork } = require('./data');

class RequestMetrics {
  constructor() {
    this.samples = 0;
    this.elapsedMs = 0;
  }

  record(durMs) {
    this.samples += 1;
    this.elapsedMs += durMs;
  }
}

const metrics = new RequestMetrics();

function processSample(v) {
  let acc = 0;
  for (let j = 0; j < 120; j++) {
    acc += (v * j) % 7;
  }
  return acc;
}

function metricsHandler(req) {
  const work = getWork();
  let checksum = 0;
  for (let i = 0; i < work.length; i++) {
    const t0 = performance.now();
    checksum += processSample(work[i]);
    metrics.record(performance.now() - t0);
  }
  return { checksum, samples: metrics.samples, elapsed: metrics.elapsedMs };
}

module.exports = { metricsHandler };
