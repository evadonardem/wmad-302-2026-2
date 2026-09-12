/**
 * [ROLE A] Core Engine Module
 */

export function evaluateAyudaEligibility(citizen) {
  let score = 0;

  // Senior Citizen
  if (citizen.isSenior === true) {
    score += 35;
  }

  // PWD
  if (citizen.isPWD === true) {
    score += 35;
  }

  // Low Income
  if (citizen.monthlyIncome < 10000) {
    score += 20;
  }

  // Dependents: +5 each, maximum of 20
  const dependents = citizen.dependentCount ?? 0;
  score += Math.min(dependents * 5, 20);

  // Determine priority
  let priority;
  let approved;

  if (score >= 70) {
    priority = "CRITICAL";
    approved = true;
  } else if (score >= 40) {
    priority = "HIGH";
    approved = true;
  } else {
    priority = "LOW";
    approved = false;
  }

  return {
    priority,
    score,
    approved,
  };
}

export function createReliefPacker(budgetCap = 1000) {
  // Private state
  let items = [];
  let total = 0;

  function addItem(name, price) {
    price = Number(price);

    if (!name || price <= 0) {
      return {
        success: false,
        reason: "Invalid item or price",
      };
    }

    if (total + price > budgetCap) {
      return {
        success: false,
        reason: "Budget exceeded",
      };
    }

    items.push({
      name,
      price,
    });

    total += price;

    return {
      success: true,
    };
  }

  function removeItem(index) {
    if (index < 0 || index >= items.length) {
      return {
        success: false,
        reason: "Invalid item index",
      };
    }

    const removedItem = items.splice(index, 1)[0];
    total -= removedItem.price;

    return {
      success: true,
    };
  }

  function getTotal() {
    return total;
  }

  function getItems() {
    return [...items];
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