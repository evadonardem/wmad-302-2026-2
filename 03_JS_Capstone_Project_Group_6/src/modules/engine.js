/**
 * [ROLE A] Core Engine Module - Student Starter Template
 */

export function evaluateAyudaEligibility(citizen) {
  // TODO: Implement scoring logic
  // Rules:
  // - Senior Citizen (+35 pts)
  // - PWD (+35 pts)
  // - Monthly Income < 10,000 (+20 pts)
  // - Dependents (+5 pts per dependent, capped at max 20 pts)
  // Priority: score >= 70 -> 'CRITICAL' (approved: true), score >= 40 -> 'HIGH' (approved: true), else -> 'LOW' (approved: false)
  let score = 0;

  if (citizen.isSenior === true) score += 35;
  if (citizen.isPWD === true) score += 35;
  if (citizen.monthlyIncome < 10000) score += 20;

  const dependentCount = citizen.dependentCount ?? 0;
  score += Math.min(dependentCount * 5, 20);

  let priority;
  let approved;
  if (score >= 70) {
    priority = 'CRITICAL';
    approved = true;
  } else if (score >= 40) {
    priority = 'HIGH';
    approved = true;
  } else {
    priority = 'LOW';
    approved = false;
  }

  return { priority, score, approved };
}

export function createReliefPacker(budgetCap = 1000) {
  // TODO: Implement closure/factory function returning an object with methods:
  // - addItem(name, price): checks budget cap, adds item if valid
  // - removeItem(index): removes item by index and adjusts total
  // - getTotal(): returns current total price
  // - getItems(): returns array of items (copy)
  // - getBudgetCap(): returns budget cap

    const items = [];

  function getTotal() {
    return items.reduce((sum, item) => sum + item.price, 0);
  }

  return {
    addItem(name, price) {
      if (typeof price !== 'number' || isNaN(price) || price <= 0) {
        return { success: false, reason: 'Invalid price.' };
      }
      if (getTotal() + price > budgetCap) {
        return { success: false, reason: `Adding "${name}" would exceed the ₱${budgetCap} budget cap.` };
      }
      items.push({ name, price });
      return { success: true };
    },
    removeItem(index) {
      if (index < 0 || index >= items.length) return;
      items.splice(index, 1);
    },
    getTotal,
    getItems() {
      return [...items];
    },
    getBudgetCap() {
      return budgetCap;
    }
  };
}