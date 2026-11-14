/**
 * Pure helpers for the cookbook features (no React, easy to unit-test).
 */
import type { PlannedMeal, ShoppingItem } from '@/types/cookbook';

/** Local date as "YYYY-MM-DD" (toISOString would shift the day by timezone). */
export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Monday of the week that contains `date` (at local midnight). */
export function startOfWeek(date: Date): Date {
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const daysSinceMonday = (result.getDay() + 6) % 7; // Sunday(0) -> 6
  result.setDate(result.getDate() - daysSinceMonday);
  return result;
}

/** The 7 days (Mon-Sun) of the week that contains `date`. */
export function getWeekDays(date: Date): Date[] {
  const monday = startOfWeek(date);
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    return day;
  });
}

/** Move a date by whole weeks (negative = back). */
export function addWeeks(date: Date, weeks: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + weeks * 7);
  return result;
}

/** Trim and collapse repeated spaces: "  Olive   oil " -> "Olive oil" */
export function normalizeIngredient(text: string): string {
  return text.trim().replace(/\s+/g, ' ');
}

/** Unique recipe ids planned on any of the given days (keeps first-seen order). */
export function recipeIdsForDates(plan: PlannedMeal[], dateKeys: string[]): number[] {
  const wanted = new Set(dateKeys);
  const seen = new Set<number>();
  const ids: number[] = [];
  for (const meal of plan) {
    if (wanted.has(meal.date) && !seen.has(meal.recipeId)) {
      seen.add(meal.recipeId);
      ids.push(meal.recipeId);
    }
  }
  return ids;
}

/**
 * Add the ingredients of some recipes to a shopping list.
 * - the same ingredient (ignoring upper/lower case) appears only once
 * - if two recipes need it, both recipe ids are remembered
 * - items that are already on the list keep their checked state
 */
export function mergeIngredients(
  existing: ShoppingItem[],
  recipes: { id: number; ingredients: string[] }[]
): ShoppingItem[] {
  const items = existing.map((item) => ({ ...item, recipeIds: [...item.recipeIds] }));
  const byKey = new Map(items.map((item) => [item.name.toLowerCase(), item]));

  for (const recipe of recipes) {
    for (const raw of recipe.ingredients) {
      const name = normalizeIngredient(raw);
      if (!name) continue;
      const key = name.toLowerCase();
      const found = byKey.get(key);
      if (found) {
        if (!found.recipeIds.includes(recipe.id)) found.recipeIds.push(recipe.id);
      } else {
        const item: ShoppingItem = {
          id: `ing-${key}`,
          name,
          checked: false,
          recipeIds: [recipe.id],
        };
        byKey.set(key, item);
        items.push(item);
      }
    }
  }
  return items;
}
