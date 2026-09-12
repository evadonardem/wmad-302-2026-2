/**
 * [ROLE A] Core Engine Module - Student Starter Template
 */

export function evaluateAyudaEligibility(citizen) {
  let score = 0;
  if(citizen.isSenior === true){
    score +=35;
  }
  if(citizen.isPWD === true){
    score +=35;
  }
  if(citizen.monthlyIncome < 10000){
    score += 20
  }
  const dependents = citizen.dependentCount ?? 0;
  score += Math.min(dependents * 5, 20);

  let priority;
  let approved;

  if (score >= 70){
    priority = "CRITICAL";
    approved= true;
  } else if (score >= 40) {
    priority = "HIGH";
    approved = true;
  } else {
    priority = "LOW";
    approved = false;
  }

  return {
    priority: priority,
    score: score,
    approved: approved
  };
}

export function createReliefPacker(budgetCap = 1000) {
  let items = [];
  let total = 0;

  function addItem(name, price) {
    price = Number(price);

    if (!name || price <= 0) {
      return {
        success: false,
        reason: "Invalid item"
      };
    }

    if (total + price > budgetCap) {
      return {
        success: false,
        reason: "Budget limit exceeded"
      };
    }

    items.push({
      name: name,
      price: price
    });

    total += price;

    return {
      success: true
    };
  }

  function removeItem(index) {
    if (index < 0 || index >= items.length) {
      return false;
    }

    total -= items[index].price;
    items.splice(index, 1);

    return true;
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
    getBudgetCap
  };
}