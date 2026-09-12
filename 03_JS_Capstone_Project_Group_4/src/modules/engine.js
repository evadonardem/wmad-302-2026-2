//role A

export function evaluateAyudaEligibility(citizen) {
  const {
    isSenior = false,
    isPWD = false,
    monthlyIncome = Infinity,
    dependentCount,
  } = citizen ?? {};

  let score = 0;

  if (isSenior === true) {
    score += 35;
  }

  if (isPWD === true) {
    score += 35;
  }

  if (monthlyIncome < 10000) {
    score += 20;
  }

  const dependents = dependentCount ?? 0;
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

  function getTotal() {
    return items.reduce((sum, item) => sum + item.price, 0);
  }

  function addItem(name, price) {
    if (typeof name !== 'string' || typeof price !== 'number' || price < 0) {
      return { success: false, reason: "Invalid name or price" };
    }

    if (getTotal() + price > budgetCap) {
      return { success: false, reason: "Exceeds budget cap" };
    }

    items.push({ name, price });
    return { success: true };
  }

  function removeItem(index) {
    if (index < 0 || index >= items.length) {
      return { success: false, reason: "Invalid index" };
    }
    items.splice(index, 1);
    return { success: true };
  }

  function getItems() {
    return items.map((item) => ({ ...item }));
  }

  function getBudgetCap() {
    return budgetCap;
  }

  return {
    addItem,
    removeItem,
    getTotal,
    getItems,
    getBudgetCap,
  };
}