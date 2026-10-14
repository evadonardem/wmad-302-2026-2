import console from 'node:console';

// Task 1: Memoize
export function memoize(fn) {
  const cache = {}; // closure cache
  return function(...args) {
    const key = JSON.stringify(args); // serialize arguments
    if (cache[key] !== undefined) {
      return cache[key];
    }
    const result = fn(...args);
    cache[key] = result;
    return result;
  };
}

// Task 2: Jeepney Fare Calculator
export function createJeepneyFareCalculator(baseFare = 13, discountRate = 0.20) {
  return function(distanceKm, isStudentOrSenior) {
    let fare = baseFare;

    // Extra charge: after 4 km, every 2 km adds ₱1.75
    if (distanceKm > 4) {
      const extraKm = distanceKm - 4;
      const increments = Math.ceil(extraKm / 2); // round up every 2 km
      fare += increments * 1.75;
    }

    // Apply discount if student/senior
    if (isStudentOrSenior) {
      fare = fare * (1 - discountRate);
    }

    return Number(fare.toFixed(2));
  };
}

// Task 3: Run Tests
export function runAdvancedFunctionsTests() {
  let execCount = 0;
  const calc = memoize((a, b) => { execCount++; return a + b; });
  calc(2, 3);
  calc(2, 3);
  console.assert(execCount === 1, 'Memoized function executed only once for same arguments');

  const fareCalc = createJeepneyFareCalculator(13, 0.20);
  console.assert(fareCalc(2, false) === 13.00, '2km trip regular fare is base fare 13');
  console.assert(fareCalc(6, false) === 16.50, '6km trip regular fare is 13 + (2 * 1.75) = 16.50');
  console.assert(fareCalc(6, true) === 13.20, '6km trip senior fare is 16.50 * 0.8 = 13.20');
  console.log('  └─ Module 04 assertions passed.');
}
