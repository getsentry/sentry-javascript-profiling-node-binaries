// GET /api/metrics handler, v2: the "customer PR" switches the accumulator to
// nanosecond precision.
//
// The diff vs v1 is the record method. Integer nanoseconds keep the counter in
// V8's small-integer range only until ~2.1 seconds of accumulated time; under
// sustained load the addition overflows the SMI range and the optimized hot
// path deoptimizes.
const { getWork } = require('./data');

class RequestMetrics {
  constructor() {
    this.samples = 0;
    this.elapsedNs = 0;
  }

  record(durMs) {
    this.samples += 1;
    this.elapsedNs += Math.round(durMs * 1_000_000);
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
  return { checksum, samples: metrics.samples, elapsed: metrics.elapsedNs };
}

module.exports = { metricsHandler };
