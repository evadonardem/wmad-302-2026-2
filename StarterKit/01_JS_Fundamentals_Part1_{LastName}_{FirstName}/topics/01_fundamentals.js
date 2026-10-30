import console from 'node:console';

export function evaluateAyudaEligibility(citizen) {
   const dependentCount = citizen.dependentCount ?? 0;

  return citizen.isSeniorPWD === true ||
    (citizen.isLowIncome === true && dependentCount >= 3);
}

export function computeJollibeeBill(rawPrice, isSeniorOrPWD) {
   if (
    typeof rawPrice !== 'number' ||
    !Number.isFinite(rawPrice) ||
    rawPrice <= 0
  ) {
    return 0;
  }

  let total;

  if (isSeniorOrPWD === true) {
    // Apply 20% discount; VAT exempt.
    total = rawPrice * 0.80;
  } else if (isSeniorOrPWD === false) {
    // Apply 12% VAT.
    total = rawPrice * 1.12;
  } else {
    return 0;
  }

  return Number(total.toFixed(2));
}

export function runFundamentalsTests() {
  // Task 1 Assertions
  console.assert(
    evaluateAyudaEligibility({
      isSeniorPWD: true,
      isLowIncome: false,
      dependentCount: 0
    }) === true,
    'Senior should qualify'
  );

  console.assert(
    evaluateAyudaEligibility({
      isSeniorPWD: false,
      isLowIncome: true,
      dependentCount: 3
    }) === true,
    'Low income w/ 3 dependents qualifies'
  );

  console.assert(
    evaluateAyudaEligibility({
      isSeniorPWD: false,
      isLowIncome: true,
      dependentCount: null
    }) === false,
    'Null dependents should default to 0'
  );

  console.assert(
    computeJollibeeBill(100, true) === 80.00,
    'Senior gets 20% off'
  );

  console.assert(
    computeJollibeeBill(100, false) === 112.00,
    'Regular gets 12% VAT'
  );

  console.assert(
    computeJollibeeBill('invalid', false) === 0,
    'Invalid price returns 0'
  );

  console.log('  └─ Module 01 assertions passed.');
}
