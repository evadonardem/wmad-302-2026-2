export function GCashAccount(accountName, initialBalance = 0) {
  this.accountName = accountName;
  this.balance = initialBalance;

  function GCashWallet(balance = 0) {
    this.balance = balance;

    this.cashIn = function (amount) {
      this.balance += amount;
      return this;
    };

    this.sendMoney = function (amount, recipient) {
      if (this.balance < amount + 15) {
        throw new Error("Insufficient GCash Balance");
      }
      this.balance -= amount + 15;
      return this;
    };
  }

  // Actually create the wallet and copy its methods onto this account
  const wallet = new GCashWallet(initialBalance);
  this.cashIn = wallet.cashIn.bind(this);
  this.sendMoney = wallet.sendMoney.bind(this);

  this.getBalance = function () {
    return `₱${this.balance.toFixed(2)}`;
  };
}

export function getBarangayName(resident) {
  function innerGetBarangayName(resident) {
    return resident?.address?.barangay?.name ?? "Unregistered Barangay";
  }
  return innerGetBarangayName(resident);
}

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