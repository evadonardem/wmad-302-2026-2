
function assert(condition, message) {
  console.assert(condition, message);
  if (!condition) {
    throw new Error('Assertion failed: ' + message);
  }
}
// Task 1: Barangay Ayuda Eligibility Evaluator
function evaluateAyudaEligibility(citizen) {
  let dependentCount;

  if (citizen.dependentCount === null || citizen.dependentCount === undefined) {
    dependentCount = 0;
  } else {
    dependentCount = citizen.dependentCount;
  }

  if (citizen.isSeniorPWD === true) {
    return true;
  }

  if (citizen.isLowIncome === true && dependentCount >= 3) {
    return true;
  }

  return false;
}

// Task 2: Jollibee Receipt Bill Calculator
function computeJollibeeBill(rawPrice, isSeniorOrPWD) {
  if (typeof rawPrice !== 'number' || Number.isNaN(rawPrice) || rawPrice <= 0) {
    return 0;
  }

  let total;
  if (isSeniorOrPWD === true) {
    total = rawPrice * 0.8;
  } else {
    total = rawPrice * 1.12;
  }

  return Number(total.toFixed(2));
}

function runFundamentalsTests() {
  // --- Task 1 ---
  assert(
    evaluateAyudaEligibility({ isSeniorPWD: true, isLowIncome: false, dependentCount: 0 }) === true,
    'Senior/PWD should always be eligible'
  );
  assert(
    evaluateAyudaEligibility({ isSeniorPWD: false, isLowIncome: true, dependentCount: 3 }) === true,
    'Low income with 3+ dependents should be eligible'
  );
  assert(
    evaluateAyudaEligibility({ isSeniorPWD: false, isLowIncome: true, dependentCount: 2 }) === false,
    'Low income with fewer than 3 dependents should NOT be eligible'
  );
  assert(
    evaluateAyudaEligibility({ isSeniorPWD: false, isLowIncome: true, dependentCount: null }) === false,
    'Null dependentCount should default to 0'
  );
  assert(
    evaluateAyudaEligibility({ isSeniorPWD: false, isLowIncome: false, dependentCount: undefined }) === false,
    'Undefined dependentCount should default to 0 and fail both conditions'
  );

  // --- Task 2 ---
  assert(computeJollibeeBill(100, true) === 80, 'Senior/PWD should get 20% discount, VAT exempt');
  assert(computeJollibeeBill(100, false) === 112, 'Regular customer should pay 12% VAT');
  assert(computeJollibeeBill(-50, false) === 0, 'Negative price should return 0');
  assert(computeJollibeeBill(NaN, false) === 0, 'NaN price should return 0');
  assert(computeJollibeeBill('150', false) === 0, 'Non-numeric price should return 0');
  assert(
    computeJollibeeBill(99.995, true) === Number((99.995 * 0.8).toFixed(2)),
    'Result should be rounded to 2 decimal places'
  );

  console.log('✔ Module 01 (Fundamentals) — all assertions passed');
}

// ------------------------------------------------------------
// MODULE 02: Objects & Context
// ------------------------------------------------------------

// Task 1: GCash Wallet Engine
function GCashAccount(accountName, initialBalance) {
  this.accountName = accountName;
  this.balance = initialBalance;

  this.cashIn = function (amount) {
    this.balance = this.balance + amount;
    return this;
  };

  this.sendMoney = function (amount, recipient) {
    let totalDeduction = amount + 15; // ₱15 transfer fee

    if (this.balance < totalDeduction) {
      throw new Error('Insufficient GCash Balance');
    }

    this.balance = this.balance - totalDeduction;
    return this;
  };

  this.getBalance = function () {
    return '₱' + this.balance.toFixed(2);
  };
}

// Task 2: Safe Address Extractor (no optional chaining, manual checks)
function getBarangayName(resident) {
  if (!resident) {
    return 'Unregistered Barangay';
  }

  if (!resident.address) {
    return 'Unregistered Barangay';
  }

  if (!resident.address.barangay) {
    return 'Unregistered Barangay';
  }

  if (!resident.address.barangay.name) {
    return 'Unregistered Barangay';
  }

  return resident.address.barangay.name;
}

function runObjectsTests() {
  // --- Task 1 ---
  let wallet = new GCashAccount('Juan Dela Cruz', 100);

  assert(wallet.cashIn(50) === wallet, 'cashIn should return "this" for chaining');
  assert(wallet.balance === 150, 'Balance should be 150 after cashing in 50');

  wallet.sendMoney(50, 'Maria');
  assert(wallet.balance === 85, 'Balance should be 85 after sending 50 + ₱15 fee');
  assert(wallet.getBalance() === '₱85.00', 'getBalance should format as "₱85.00"');

  let threwInsufficientError = false;
  try {
    wallet.sendMoney(1000, 'Pedro');
  } catch (err) {
    if (err.message === 'Insufficient GCash Balance') {
      threwInsufficientError = true;
    }
  }
  assert(threwInsufficientError, 'sendMoney should throw when balance is insufficient');

  let chainedWallet = new GCashAccount('Ana', 0);
  let result = chainedWallet.cashIn(200).sendMoney(50, 'Store');
  assert(result === chainedWallet, 'Method chaining should preserve "this" across calls');
  assert(chainedWallet.balance === 135, 'Chained cashIn(200).sendMoney(50) should leave balance at 135');

  // --- Task 2 ---
  let validResident = { address: { barangay: { name: 'Barangay San Isidro' } } };
  assert(
    getBarangayName(validResident) === 'Barangay San Isidro',
    'Should extract nested barangay name'
  );
  assert(
    getBarangayName({ address: { barangay: null } }) === 'Unregistered Barangay',
    'Should return fallback when barangay is null'
  );
  assert(
    getBarangayName({ address: null }) === 'Unregistered Barangay',
    'Should return fallback when address is null'
  );
  assert(getBarangayName({}) === 'Unregistered Barangay', 'Should return fallback when address is missing entirely');
  assert(getBarangayName(null) === 'Unregistered Barangay', 'Should return fallback when resident itself is null');
  assert(
    getBarangayName(undefined) === 'Unregistered Barangay',
    'Should return fallback when resident is undefined'
  );

  console.log('✔ Module 02 (Objects & Context) — all assertions passed');
}

// Task 1: Sari-Sari Store Sales Aggregator
function summarizeSariSariSales(transactions) {
  let totals = { snacks: 0, drinks: 0, canned: 0 };

  for (let i = 0; i < transactions.length; i++) {
    let tx = transactions[i];

    if (tx.status === 'voided' || tx.status === 'refunded') {
      continue;
    }

    if (tx.category === 'snacks') {
      totals.snacks = totals.snacks + tx.amount;
    } else if (tx.category === 'drinks') {
      totals.drinks = totals.drinks + tx.amount;
    } else if (tx.category === 'canned') {
      totals.canned = totals.canned + tx.amount;
    }
  }

  return totals;
}

// Task 2: Delivery Coverage Extractor (no Set, manual duplicate check)
function extractUniqueBarangays(riders) {
  let uniqueList = [];

  for (let i = 0; i < riders.length; i++) {
    let coveredBarangays = riders[i].coveredBarangays;

    for (let j = 0; j < coveredBarangays.length; j++) {
      let barangayName = coveredBarangays[j];
      let alreadyInList = false;

      for (let k = 0; k < uniqueList.length; k++) {
        if (uniqueList[k] === barangayName) {
          alreadyInList = true;
          break;
        }
      }

      if (!alreadyInList) {
        uniqueList.push(barangayName);
      }
    }
  }

  uniqueList.sort();
  return uniqueList;
}

function runDataStructuresTests() {
  // --- Task 1 ---
  let transactions = [
    { category: 'snacks', amount: 50, status: 'completed' },
    { category: 'drinks', amount: 30, status: 'completed' },
    { category: 'snacks', amount: 25, status: 'voided' },
    { category: 'canned', amount: 80, status: 'completed' },
    { category: 'drinks', amount: 40, status: 'refunded' },
    { category: 'canned', amount: 20, status: 'completed' },
  ];
  let summary = summarizeSariSariSales(transactions);

  assert(summary.snacks === 50, 'Voided snacks transaction should be excluded from total');
  assert(summary.drinks === 30, 'Refunded drinks transaction should be excluded from total');
  assert(summary.canned === 100, 'Canned goods total should sum completed transactions only');

  let emptySummary = summarizeSariSariSales([]);
  assert(
    emptySummary.snacks === 0 && emptySummary.drinks === 0 && emptySummary.canned === 0,
    'Empty transaction list should return all-zero totals'
  );

  // --- Task 2 ---
  let riders = [
    { name: 'Rider A', coveredBarangays: ['San Isidro', 'Poblacion'] },
    { name: 'Rider B', coveredBarangays: ['Poblacion', 'Malinta'] },
    { name: 'Rider C', coveredBarangays: ['Bagbaguin', 'San Isidro'] },
  ];
  let unique = extractUniqueBarangays(riders);

  assert(
    JSON.stringify(unique) === JSON.stringify(['Bagbaguin', 'Malinta', 'Poblacion', 'San Isidro']),
    'Should return alphabetically sorted, deduplicated barangay list'
  );
  assert(
    JSON.stringify(extractUniqueBarangays([])) === JSON.stringify([]),
    'Empty riders array should return an empty array'
  );

  console.log('✔ Module 03 (Data Structures) — all assertions passed');
}

// Task 1: Pure Function Memoizer
function memoize(fn) {
  let cache = {};

  return function (...args) {
    let key = JSON.stringify(args);

    if (cache[key] !== undefined) {
      return cache[key];
    }

    let result = fn.apply(this, args);
    cache[key] = result;
    return result;
  };
}

// Task 2: Jeepney Fare Matrix Calculator
function createJeepneyFareCalculator(baseFare, discountRate) {
  return function (distanceKm, isStudentOrSenior) {
    let extraKm = distanceKm - 4;
    if (extraKm < 0) {
      extraKm = 0;
    }

    let total = baseFare + extraKm * 1.75;

    let finalFare;
    if (isStudentOrSenior === true) {
      finalFare = total * (1 - discountRate);
    } else {
      finalFare = total;
    }

    return Number(finalFare.toFixed(2));
  };
}

function runAdvancedFunctionsTests() {
  // --- Task 1 ---
  let callCount = 0;
  function slowSquare(n) {
    callCount = callCount + 1;
    return n * n;
  }
  let memoizedSquare = memoize(slowSquare);

  assert(memoizedSquare(5) === 25, 'Memoized function should compute correct result on first call');
  assert(callCount === 1, 'Underlying function should be called once for a new argument');

  memoizedSquare(5);
  assert(callCount === 1, 'Underlying function should NOT be called again for a cached argument');

  memoizedSquare(6);
  assert(callCount === 2, 'Underlying function should be called for a new, different argument');

  // --- Task 2 ---
  let calculateFare = createJeepneyFareCalculator(13, 0.2);

  assert(calculateFare(3, false) === 13, 'Distance within base fare coverage should equal base fare');
  assert(
    calculateFare(6, false) === Number((13 + 2 * 1.75).toFixed(2)),
    'Distance beyond 4km should add ₱1.75 per extra km'
  );
  assert(
    calculateFare(6, true) === Number(((13 + 2 * 1.75) * 0.8).toFixed(2)),
    'Student/senior fare should apply the discount rate to the total'
  );
  assert(
    calculateFare(4, true) === Number((13 * 0.8).toFixed(2)),
    'Exactly 4km should incur no extra distance charge, discount still applies'
  );

  let noDiscountCalculator = createJeepneyFareCalculator(15, 0.5);
  assert(
    noDiscountCalculator(4, false) === 15,
    'Different closure instance should retain its own baseFare independently'
  );

  console.log('✔ Module 04 (Advanced Functions) — all assertions passed');
}

// ------------------------------------------------------------
// MODULE 05: Async Mechanics
// ------------------------------------------------------------

// Task 1: Resilient GCash Payment Gateway
function retryGcashPayment(paymentFn, retries, delayMs) {
  return new Promise(function (resolve, reject) {
    let attemptsLeft = retries;

    function attempt() {
      paymentFn()
        .then(function (value) {
          resolve(value);
        })
        .catch(function (error) {
          if (attemptsLeft > 0) {
            attemptsLeft = attemptsLeft - 1;
            setTimeout(attempt, delayMs);
          } else {
            reject(error);
          }
        });
    }

    attempt();
  });
}

async function runAsyncTests() {
  // --- Task 1a: succeeds on the first attempt ---
  function alwaysSucceeds() {
    return Promise.resolve('Payment Successful');
  }
  let result1 = await retryGcashPayment(alwaysSucceeds, 3, 10);
  assert(result1 === 'Payment Successful', 'Should resolve immediately when paymentFn succeeds on first try');

  // --- Task 1b: fails twice, then succeeds on the third attempt ---
  let attemptCount = 0;
  function succeedsOnThirdTry() {
    attemptCount = attemptCount + 1;
    if (attemptCount < 3) {
      return Promise.reject(new Error('Network timeout'));
    } else {
      return Promise.resolve('Payment Successful After Retries');
    }
  }
  let result2 = await retryGcashPayment(succeedsOnThirdTry, 3, 10);
  assert(
    result2 === 'Payment Successful After Retries',
    'Should retry and eventually resolve on the third attempt'
  );
  assert(attemptCount === 3, 'Should have attempted exactly 3 times before succeeding');

  // --- Task 1c: exhausts all retries and rejects with the final error ---
  function alwaysFails() {
    return Promise.reject(new Error('Insufficient Funds'));
  }
  let finalErrorMessage = null;
  try {
    await retryGcashPayment(alwaysFails, 2, 10);
  } catch (err) {
    finalErrorMessage = err.message;
  }
  assert(
    finalErrorMessage === 'Insufficient Funds',
    'Should reject with the final error after all retries are exhausted'
  );

  console.log('✔ Module 05 (Async & Promises) — all assertions passed');
}

console.log('==================================================');
console.log('🚀 RUNNING EPISODE 1 MASTER TEST RUNNER');
console.log('==================================================\n');

async function executeTestSuite() {
  try {
    console.log('--- 1. Testing Fundamentals ---');
    runFundamentalsTests();

    console.log('--- 2. Testing Objects & Context ---');
    runObjectsTests();

    console.log('--- 3. Testing Data Structures ---');
    runDataStructuresTests();

    console.log('--- 4. Testing Advanced Functions ---');
    runAdvancedFunctionsTests();

    console.log('--- 5. Testing Async & Promises ---');
    await runAsyncTests();

    console.log('\n==================================================');
    console.log('✅ ALL EPISODE 1 TEST SUITES PASSED LOCALLY!');
    console.log('==================================================');
  } catch (error) {
    console.error('\n❌ TEST SUITE FAILED AT ASSERTION:');
    console.error(error.message);
    process.exit(1);
  }
}

executeTestSuite();