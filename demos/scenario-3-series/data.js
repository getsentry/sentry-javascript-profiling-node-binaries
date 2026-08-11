// In-memory metric points. Every point has the same shape: `label` is always
// present, a string for annotated spikes in annotated windows and null
// otherwise.
function makePoints(count, withLabels) {
  const points = [];
  for (let i = 0; i < count; i++) {
    points.push({
      ts: 1700000000 + i * 10,
      value: Math.sin(i / 10) * 100 + (i % 7) * 0.25 + 0.5,
      label: withLabels && i % 20 === 0 ? 'deploy-spike' : null,
    });
  }
  return points;
}

const NORMAL_WINDOW = makePoints(2000, false);
const ANNOTATED_WINDOW = makePoints(2000, true);

function getPoints(window) {
  return window === 'annotated' ? ANNOTATED_WINDOW : NORMAL_WINDOW;
}

module.exports = { getPoints };
