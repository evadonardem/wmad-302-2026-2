/**
 * [ROLE A] Core Engine Module - Student Starter Template
 */

export function evaluateAyudaEligibility(citizen = {}) {
  const isSenior = Boolean(citizen.isSenior);
  const isPWD = Boolean(citizen.isPWD);
  const monthlyIncome = Number(citizen.monthlyIncome ?? 0);
  const dependentCount = Number(citizen.dependentCount ?? 0);

  let score = 0;

  if (isSenior) score += 35;
  if (isPWD) score += 35;
  if (monthlyIncome < 10000) score += 20;

  const dependentPoints = Math.min((dependentCount ?? 0) * 5, 20);
  score += dependentPoints;

  let priority = 'LOW';
  if (score >= 70) {
    priority = 'CRITICAL';
  } else if (score >= 40) {
    priority = 'HIGH';
  }

  return {
    priority,
    score,
    approved: priority !== 'LOW'
  };
}

export function createReliefPacker(budgetCap = 1000) {
  let items = [];

  const getTotalPrice = () => items.reduce((total, item) => total + Number(item.price || 0), 0);

  return {
    addItem(name, price) {
      const itemName = String(name ?? '').trim();
      const itemPrice = Number(price);

      if (!itemName) {
        return { success: false, reason: 'Item name is required.' };
      }

      if (!Number.isFinite(itemPrice) || itemPrice <= 0) {
        return { success: false, reason: 'Item price must be a positive number.' };
      }

      if (getTotalPrice() + itemPrice > budgetCap) {
        return { success: false, reason: 'Item exceeds the remaining budget cap.' };
      }

      items.push({ name: itemName, price: itemPrice });
      return { success: true, total: getTotalPrice() };
    },

    removeItem(index) {
      const itemIndex = Number(index);

      if (!Number.isInteger(itemIndex) || itemIndex < 0 || itemIndex >= items.length) {
        return false;
      }

      items.splice(itemIndex, 1);
      return true;
    },

    getTotal() {
      return getTotalPrice();
    },

    getItems() {
      return items.map((item) => ({ ...item }));
    },

    getBudgetCap() {
      return budgetCap;
    }
  };
}