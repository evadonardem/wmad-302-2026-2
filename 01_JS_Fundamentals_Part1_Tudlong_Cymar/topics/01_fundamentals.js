import console from 'node:console';

const MIN_DEPENDENTS = 1; // assumption: adjust if your spec sets a different threshold

export function evaluateAyudaEligibility(citizen) {
  const { isSeniorPWD, isLowIncome, dependentCount } = citizen ?? {};
  const dependents = dependentCount ?? 0; // null/undefined -> 0
  return Boolean(isSeniorPWD || (isLowIncome && dependents >= MIN_DEPENDENTS));
}

export function computeJollibeeBill(rawPrice, isSeniorOrPWD) {
  const price = Number(rawPrice);
  if (!Number.isFinite(price) || price < 0) return 0;

  // Senior/PWD: 20% discount (and VAT-exempt, per the test: 100 -> 80)
  // Regular: add 12% VAT
  const total = isSeniorOrPWD ? price * 0.8 : price * 1.12;
  return Number(total.toFixed(2));
}

// runFundamentalsTests() stays unchanged