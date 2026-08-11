// GET /api/stats handler, v2: the "customer PR" onboards the new partner
// payment source, whose rows report fractional amounts and omit amount for
// pending transactions — hence the `?? 0` guard.
//
// The diff vs v1: the handler routes ?source=partner to the new rows, and the
// summing line becomes `total += r.amount ?? 0`. The first partner request
// materializes rows whose hidden class differs from the legacy rows the hot
// loop was optimized against.
const { getRows } = require('./data');

function sumStats(rows) {
  let total = 0;
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    total += r.amount ?? 0;
  }
  return total;
}

function statsHandler(req) {
  const source = req.query.source === 'partner' ? 'partner' : 'legacy';
  const rows = getRows(source);
  return {
    source,
    count: rows.length,
    total: sumStats(rows),
  };
}

module.exports = { statsHandler };
