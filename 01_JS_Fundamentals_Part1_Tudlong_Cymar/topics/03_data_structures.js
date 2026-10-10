import console from 'node:console';

const EXCLUDED_STATUSES = new Set(['voided', 'refunded']);

export function summarizeSariSariSales(transactions) {
  return (transactions ?? [])
    .filter((tx) => !EXCLUDED_STATUSES.has(tx?.status))
    .reduce((summary, { category, amount }) => {
      summary[category] = (summary[category] ?? 0) + amount;
      return summary;
    }, {});
}

export function extractUniqueBarangays(riders) {
  const barangays = (riders ?? []).flatMap((rider) => rider?.coveredBarangays ?? []);
  return [...new Set(barangays)].sort((a, b) => a.localeCompare(b));
}

// runDataStructuresTests() stays unchanged