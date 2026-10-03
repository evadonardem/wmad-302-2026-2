import console from 'node:console';

export function summarizeSariSariSales(transactions) {

  const validTransactions = transactions.filter(function(transactions){
    return transactions.status !== 'voided' && transactions.status !== 'refunded';
  });

  const summary = validTransactions.reduce(function(total,transactions){
    if (transactions.category === 'snacks'){
      total.snacks = total.snacks + transactions.amount;
    }
    if(transactions.category === 'drinks'){
      total.drinks = total.drinks + transactions.amount;
    }
    if(transactions.category === 'canned'){
      total.canned = total.canned + transactions.amount;
    }
    return total;
  },{
    snacks: 0,
    drinks: 0,
    canned: 0
  });

  return summary;
  // TODO: Filter out 'voided'/'refunded' and reduce by category
}

export function extractUniqueBarangays(riders) {
  const barangays = [];

  riders.forEach(function(rider){
    rider.coveredBarangays.forEach(function(barangays){
      barangays.push(barangays);
    });
  });

  const uniqueBarangays = new Set(barangays);
  const result = Array.from(uniqueBarangays);
  result.sort();
  return result;
  // TODO: Extract all barangays, deduplicate via Set, and sort alphabetically
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