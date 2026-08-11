// GET /api/stats handler, v1: sums integer-cent amounts over the ledger rows.
// Only the legacy source exists in v1.
const { getRows } = require('./data');

function sumStats(rows) {
  let total = 0;
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    total += r.amount;
  }
  return total;
}

function statsHandler(req) {
  const rows = getRows('legacy');
  return {
    source: 'legacy',
    count: rows.length,
    total: sumStats(rows),
  };
}

module.exports = { statsHandler };
