import console from 'node:console';

// Task 1: Summarize Sari-Sari Sales
export function summarizeSariSariSales(transactions) {
  return transactions
    // filter out voided/refunded
    .filter(tx => tx.status !== 'voided' && tx.status !== 'refunded')
    // reduce by category
    .reduce((summary, tx) => {
      summary[tx.category] = (summary[tx.category] ?? 0) + tx.amount;
      return summary;
    }, {});
}

// Task 2: Extract Unique Barangays
export function extractUniqueBarangays(riders) {
  // flatten all barangays
  const allBarangays = riders.flatMap(r => r.coveredBarangays);
  // deduplicate with Set
  const unique = [...new Set(allBarangays)];
  // sort alphabetically
  return unique.sort();
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
