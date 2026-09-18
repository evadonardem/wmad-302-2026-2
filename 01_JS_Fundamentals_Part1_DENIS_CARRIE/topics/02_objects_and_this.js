import console from 'node:console';

// Task 1: GCashAccount
export function GCashAccount(accountName, initialBalance = 0) {
  this.accountName = accountName;
  this.balance = initialBalance;

  // Cash in money
  this.cashIn = function(amount) {
    if (typeof amount !== 'number' || amount <= 0) {
      throw new Error('Invalid cash in amount');
    }
    this.balance += amount;
    return this; // allow chaining
  };

  // Send money with ₱15 fee
  this.sendMoney = function(amount, recipient) {
    const fee = 15;
    if (typeof amount !== 'number' || amount <= 0) {
      throw new Error('Invalid send amount');
    }
    if (this.balance < amount + fee) {
      throw new Error('Insufficient GCash Balance');
    }
    this.balance -= (amount + fee);
    return this; // allow chaining
  };

  // Get balance formatted
  this.getBalance = function() {
    return `₱${this.balance.toFixed(2)}`;
  };
}

// Task 2: Barangay Name Reader
export function getBarangayName(resident) {
  return resident?.address?.barangay?.name ?? 'Unregistered Barangay';
}

// Task 3: Run Tests
export function runObjectsTests() {
  const wallet = new GCashAccount('Juan', 500);
  wallet.cashIn(200).sendMoney(100, 'Maria');
  console.assert(wallet.getBalance() === '₱585.00', 'Balance should be 500 + 200 - 100 - 15 fee = 585');

  try {
    wallet.sendMoney(1000, 'Pedro');
    console.assert(false, 'Should have thrown error for insufficient balance');
  } catch (e) {
    console.assert(e.message === 'Insufficient GCash Balance', 'Error message matches');
  }

  console.assert(getBarangayName({ address: { barangay: { name: 'Bakakeng Central' } } }) === 'Bakakeng Central', 'Reads valid barangay');
  console.assert(getBarangayName({}) === 'Unregistered Barangay', 'Handles missing property gracefully');
  console.log('  └─ Module 02 assertions passed.');
}
