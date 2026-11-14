/**
 * Cookbook Types - collections, weekly meal plan and shopping list.
 * Only recipe IDs are saved; recipe details come from the API / offline cache.
 */

export const MEAL_SLOTS = ['Breakfast', 'Lunch', 'Dinner', 'Snack'] as const;
export type MealSlot = (typeof MEAL_SLOTS)[number];

/** A custom folder of recipes, e.g. "Weeknight dinners" */
export interface Collection {
  id: string;
  name: string;
  recipeIds: number[];
}

/** One recipe planned for one meal on one day */
export interface PlannedMeal {
  id: string;
  date: string; // local date "YYYY-MM-DD"
  slot: MealSlot;
  recipeId: number;
}

export interface ShoppingItem {
  id: string;
  name: string;
  checked: boolean;
  recipeIds: number[]; // recipes that need it (empty = added by hand)
}

export interface CookbookData {
  collections: Collection[];
  mealPlan: PlannedMeal[];
  shopping: ShoppingItem[];
  notes: RecipeNotes;
}

/** Personal note per recipe id, e.g. { 12: "Add less salt next time" } */
export type RecipeNotes = Record<number, string>;
