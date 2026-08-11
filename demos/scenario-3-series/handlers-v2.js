// GET /api/series handler, v2: the "customer PR" surfaces spike annotations
// in the series so the dashboard can render markers.
//
// The diff vs v1 is the one line in buildSeries. Pushing an occasional string
// into an otherwise all-double array changes the array's element kind, which
// deoptimizes the numeric aggregation over it.
const { getPoints } = require('./data');

function buildSeries(points) {
  const series = [];
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    series.push(p.label ?? p.value);
  }
  return series;
}

function aggregateSeries(series) {
  let sum = 0;
  let min = Infinity;
  let max = -Infinity;
  for (let i = 0; i < series.length; i++) {
    const v = series[i];
    sum += v;
    if (v < min) min = v;
    if (v > max) max = v;
  }
  return { avg: sum / series.length, min, max };
}

function seriesHandler(req) {
  const points = getPoints(req.query.window);
  const series = buildSeries(points);
  return {
    total: series.length,
    stats: aggregateSeries(series),
    series: series.slice(0, 50),
  };
}

module.exports = { seriesHandler };
