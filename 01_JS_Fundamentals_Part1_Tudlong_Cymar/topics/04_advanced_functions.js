import console from 'node:console';

const BASE_COVERED_KM = 4;   // assumption: base fare covers the first 4 km (fits your 2km and 6km tests)
const ADDITIONAL_KM_RATE = 1.75;

export function memoize(fn) {
  const cache = Object.create(null);
  return function (...args) {
    const key = JSON.stringify(args);
    if (!(key in cache)) {
      cache[key] = fn.apply(this, args);
    }
    return cache[key];
  };
}

export function createJeepneyFareCalculator(baseFare = 13, discountRate = 0.20) {
  return (distanceKm, isStudentOrSenior) => {
    const km = Number(distanceKm);
    if (!Number.isFinite(km) || km < 0) return 0;

    const extraKm = Math.ceil(Math.max(0, km - BASE_COVERED_KM));
    const fare = baseFare + extraKm * ADDITIONAL_KM_RATE;
    const total = isStudentOrSenior ? fare * (1 - discountRate) : fare;
    return Number(total.toFixed(2));
  };
}

// runAdvancedFunctionsTests() stays unchanged