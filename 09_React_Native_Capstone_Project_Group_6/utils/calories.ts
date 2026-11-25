/**
 * Calorie helpers for the Meal plan (no React, easy to unit-test).
 * Each planned meal counts as ONE serving of its recipe
 * (the recipe's caloriesPerServing from the API).
 */
import type { PlannedMeal } from '@/types/cookbook';
import { toDateKey } from '@/utils/cookbook';

export type CaloriePeriod = 'day' | 'week' | 'month';

export const MIN_GOAL = 500;
export const MAX_GOAL = 10000;

const MONTH_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** Total kcal of the planned meals that fall on any of the given days. */
export function totalCalories(
  plan: PlannedMeal[],
  dateKeys: string[],
  caloriesById: Map<number, number>
): number {
  const wanted = new Set(dateKeys);
  return plan.reduce(
    (sum, meal) => (wanted.has(meal.date) ? sum + (caloriesById.get(meal.recipeId) ?? 0) : sum),
    0
  );
}

/** "YYYY-MM-DD" keys for every day of the month that contains `date`. */
export function monthDateKeys(date: Date): string[] {
  const year = date.getFullYear();
  const month = date.getMonth();
  const days = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: days }, (_, i) => toDateKey(new Date(year, month, i + 1)));
}

/** "November 2026" */
export function monthLabel(date: Date): string {
  return `${MONTH_FULL[date.getMonth()]} ${date.getFullYear()}`;
}

/** Goal for a period = daily goal x number of days (null when no goal). */
export function goalForPeriod(dailyGoal: number | null, dayCount: number): number | null {
  return dailyGoal === null ? null : dailyGoal * dayCount;
}

export interface GoalProgress {
  fraction: number; // 0..1 for the progress bar (capped)
  percent: number; // rounded, can be above 100
  remaining: number; // negative when over the goal
  over: boolean;
}

export function goalProgress(total: number, goal: number): GoalProgress {
  const fraction = goal > 0 ? Math.min(total / goal, 1) : 0;
  return {
    fraction,
    percent: goal > 0 ? Math.round((total / goal) * 100) : 0,
    remaining: goal - total,
    over: total > goal,
  };
}

/** 1250 -> "1,250" (done by hand so it behaves the same on every device). */
export function formatKcal(value: number): string {
  return String(Math.round(value)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Read the text typed in the goal box.
 * Empty text means "remove the goal" (value null, no error).
 */
export function parseCalorieGoal(text: string): { value: number | null; error: string | null } {
  const trimmed = text.trim();
  if (trimmed === '') return { value: null, error: null };
  if (!/^\d+$/.test(trimmed)) return { value: null, error: 'Enter a whole number' };
  const value = Number(trimmed);
  if (value < MIN_GOAL || value > MAX_GOAL) {
    return { value: null, error: `Enter a goal between ${MIN_GOAL} and ${formatKcal(MAX_GOAL)} kcal` };
  }
  return { value, error: null };
}
