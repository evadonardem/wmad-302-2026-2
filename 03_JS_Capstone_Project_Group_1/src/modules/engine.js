/**
 * [ROLE A] Core Engine Module - Student Starter Template
 */

export function evaluateAyudaEligibility(citizen) {
  const {
    isSenior = false,
    isPWD = false,
    monthlyIncome = Infinity,
    dependents = 0
  } = citizen;

  let score = 0;

  if (isSenior) score += 35;
  if (isPWD) score += 35;
  if (monthlyIncome < 10000) score += 20;

  const dependentPoints = Math.min(dependents * 5, 20);
  score += dependentPoints;

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
  const items = [];
  let total = 0;

  return {
    addItem: (name, price) => {
      if (total + price > budgetCap) {
        return { success: false, reason: 'Exceeds budget cap' };
      }

      items.push({ name, price });
      total += price;

      return { success: true };
    },

    removeItem: (index) => {
      if (index < 0 || index >= items.length) return;

      total -= items[index].price;
      items.splice(index, 1);
    },

    getTotal: () => total,

    getItems: () => [...items],

    getBudgetCap: () => budgetCap
  };
}