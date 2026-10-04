/**
 * [ROLE A] Core Engine Module - Student Starter Template
 */

export const RELIEF_GOODS_CATALOG = [
  { id: 'rice5',    name: 'Rice 5kg',               price: 250 },
  { id: 'canned',   name: 'Canned Goods (6pcs)',    price: 180 },
  { id: 'noodles',  name: 'Instant Noodles (10pcs)', price: 100 },
  { id: 'water',    name: 'Bottled Water (6L)',     price: 90 },
  { id: 'sardines', name: 'Sardines (4 cans)',      price: 120 },
  { id: 'sugar',    name: 'Sugar 1kg',              price: 70 },
  { id: 'coffee',   name: 'Coffee Sachets (20pcs)', price: 60 },
  { id: 'hygiene',  name: 'Hygiene Kit',            price: 150 },
  { id: 'blanket',  name: 'Blanket',                price: 200 },
  { id: 'medkit',   name: 'First Aid Kit',          price: 220 },
];

export function evaluateAyudaEligibility({ isSeniorPWD, isLowIncome, dependentCount }) {
  // Null/undefined dependentCount defaults to 0
  const dependents = dependentCount ?? 0;

  if (isSeniorPWD) return true;
  if (isLowIncome && dependents > 0) return true;

  return false;
}

export function createReliefPacker(budgetCap = 1000) {
  let items = [];
  let total = 0;

  return {
    addItem: (name, price) => {
      if (typeof price !== 'number' || price <= 0) {
        return { success: false, reason: 'Invalid price' };
      }
      if (total + price > budgetCap) {
        return { success: false, reason: 'Exceeds budget cap' };
      }
      items.push({ id: crypto.randomUUID(), name, price });
      total += price;
      return { success: true };
    },

    removeItem: (index) => {
      if (index < 0 || index >= items.length) {
        return { success: false, reason: 'Invalid index' };
      }
      const [removed] = items.splice(index, 1);
      total -= removed.price;
      return { success: true };
    },

    getTotal: () => total,

    getItems: () => [...items],

    getBudgetCap: () => budgetCap
  };
}