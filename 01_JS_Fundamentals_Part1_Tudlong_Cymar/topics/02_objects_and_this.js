import console from 'node:console';

const SEND_MONEY_FEE = 15; // assumption: flat ₱15 fee per transfer, per your test comment

export function GCashAccount(accountName, initialBalance = 0) {
  this.accountName = accountName;
  this.balance = initialBalance;

  this.cashIn = (amount) => {
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error('Invalid amount');
    }
    this.balance += amount;
    return this; // enables chaining
  };

  this.sendMoney = (amount, recipient) => {
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error('Invalid amount');
    }
    const totalDeduction = amount + SEND_MONEY_FEE;
    if (totalDeduction > this.balance) {
      throw new Error('Insufficient GCash Balance');
    }
    this.balance -= totalDeduction;
    return this; // enables chaining
  };

  this.getBalance = () => `₱${this.balance.toFixed(2)}`;
}

export function getBarangayName(resident) {
  return resident?.address?.barangay?.name ?? 'Unregistered Barangay';
}

// runObjectsTests() stays unchanged