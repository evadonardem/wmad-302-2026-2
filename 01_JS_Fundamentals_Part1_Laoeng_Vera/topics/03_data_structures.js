import console from 'node:console';

export function summarizeSariSariSales(transactions) {
  // TODO: Filter out 'voided'/'refunded' and reduce by category
  return transactions
    .filter((t) => !(t.status === 'voided' || t.status === 'refunded'))
    .reduce((total, t) => {
      total[t.category] += t.amount;
      return total;
    }, {snacks: 0, drinks: 0, canned: 0});

}

export function extractUniqueBarangays(riders) {
  // TODO: Extract all barangays, deduplicate via Set, and sort alphabetically
  const places = new Set();

  for (let i = 0; i < riders.length; i++) {
    const coveredBarangays = riders[i].coveredBarangays;
    for (let j = 0; j < coveredBarangays.length; j++) {
      places.add(coveredBarangays[j]);
    }
  }

  const result = Array.from(places);
  result.sort();
  return result; sort();
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