import console from 'node:console';

export function summarizeSariSariSales(transactions) {
  // TODO: Filter out 'voided'/'refunded' and reduce by category
  return (transactions ?? [])
    .filter((tx) => tx.status !== 'voided' && tx.status !== 'refunded')
    .reduce(
      (totals, tx) => {
        if (tx.category in totals) {
          totals[tx.category] += tx.amount;
        }
        return totals;
      },
      { snacks: 0, drinks: 0, canned: 0 }
    );
}

export function extractUniqueBarangays(riders) {
  // TODO: Extract all barangays, deduplicate via Set, and sort alphabetically
  const all = (riders ?? []).flatMap((rider) => rider.coveredBarangays ?? []);
  return [...new Set(all)].sort((a, b) => a.localeCompare(b));
}

export function runDataStructuresTests() {
  const txs = [
    { category: 'snacks', amount: 50, status: 'completed' },
    { category: 'drinks', amount: 30, status: 'completed' },
    { category: 'snacks', amount: 20, status: 'voided' },
    { category: 'canned', amount: 40, status: 'completed' }
  ];
  const summary = summarizeSariSariSales(txs);
  console.assert(summary.snacks === 50 && summary.drinks === 30 && summary.canned === 40, 'Sales summarized correctly');

  const riders = [
    { id: 1, coveredBarangays: ['Irisan', 'Loakan'] },
    { id: 2, coveredBarangays: ['Loakan', 'Bakakeng'] }
  ];
  const unique = extractUniqueBarangays(riders);
  console.assert(JSON.stringify(unique) === JSON.stringify(['Bakakeng', 'Irisan', 'Loakan']), 'Sorted unique barangays extracted');
  console.log('  └─ Module 03 assertions passed.');
}