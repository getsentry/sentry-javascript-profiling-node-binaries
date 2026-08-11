// Row store per payment source. Legacy rows (integer cents) exist from
// process start; partner rows are materialized lazily on first access — the
// partner source only ships with the v2 PR, so its rows (fractional amounts,
// occasionally missing) first appear after the hot path was optimized.
const rowCache = new Map();

function generateRows(source) {
  const rows = [];
  for (let i = 0; i < 20000; i++) {
    if (source === 'partner') {
      // The new provider's rows are shaped differently (their API leads with
      // its own transaction id), report fractional amounts, and omit amount
      // for pending transactions.
      rows.push({
        providerTxId: `ptx-${i}`,
        id: i,
        amount: i % 10 === 0 ? undefined : ((i % 900) + 100) / 100,
        currency: 'EUR',
      });
    } else {
      // Amounts in integer cents; sums stay far below the SMI limit.
      rows.push({ id: i, amount: ((i % 900) + 100) | 0, currency: 'EUR' });
    }
  }
  return rows;
}

function getRows(source) {
  if (!rowCache.has(source)) {
    rowCache.set(source, generateRows(source));
  }
  return rowCache.get(source);
}

module.exports = { getRows };
