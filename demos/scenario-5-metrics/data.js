// Work batch for the metrics endpoint: each request processes a batch of
// samples and records per-sample processing time into a process-wide
// accumulator.
const WORK = Array.from({ length: 5000 }, (_, i) => (i % 100) + 1);

function getWork() {
  return WORK;
}

module.exports = { getWork };
