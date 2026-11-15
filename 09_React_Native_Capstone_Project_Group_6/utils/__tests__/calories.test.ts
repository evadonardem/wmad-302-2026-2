/* eslint-env jest */
import {
  formatKcal,
  goalForPeriod,
  goalProgress,
  monthDateKeys,
  monthLabel,
  parseCalorieGoal,
  totalCalories,
} from '@/utils/calories';
import type { PlannedMeal } from '@/types/cookbook';

const plan: PlannedMeal[] = [
  { id: 'a', date: '2026-11-09', slot: 'Breakfast', recipeId: 1 },
  { id: 'b', date: '2026-11-09', slot: 'Dinner', recipeId: 2 },
  { id: 'c', date: '2026-11-10', slot: 'Dinner', recipeId: 2 },
  { id: 'd', date: '2026-12-01', slot: 'Lunch', recipeId: 1 },
  { id: 'e', date: '2026-11-11', slot: 'Snack', recipeId: 99 }, // recipe not loaded
];
const calories = new Map([
  [1, 300],
  [2, 450],
]);

describe('totalCalories', () => {
  it('adds the calories of meals on the given days', () => {
    expect(totalCalories(plan, ['2026-11-09'], calories)).toBe(750);
    expect(totalCalories(plan, ['2026-11-09', '2026-11-10'], calories)).toBe(1200);
  });

  it('counts a repeated recipe once per planned meal', () => {
    expect(totalCalories(plan, ['2026-11-09', '2026-11-10'], calories)).toBe(300 + 450 + 450);
  });

  it('ignores days that were not asked for', () => {
    expect(totalCalories(plan, ['2026-12-01'], calories)).toBe(300);
  });

  it('counts a missing recipe as 0 kcal', () => {
    expect(totalCalories(plan, ['2026-11-11'], calories)).toBe(0);
  });

  it('is 0 for an empty plan', () => {
    expect(totalCalories([], ['2026-11-09'], calories)).toBe(0);
  });
});

describe('month helpers', () => {
  it('monthDateKeys lists every day of the month', () => {
    const keys = monthDateKeys(new Date(2026, 10, 15));
    expect(keys).toHaveLength(30);
    expect(keys[0]).toBe('2026-11-01');
    expect(keys[29]).toBe('2026-11-30');
  });

  it('monthDateKeys handles February in a leap year', () => {
    expect(monthDateKeys(new Date(2028, 1, 10))).toHaveLength(29);
  });

  it('monthLabel shows the full month and year', () => {
    expect(monthLabel(new Date(2026, 10, 15))).toBe('November 2026');
  });
});

describe('goals', () => {
  it('goalForPeriod multiplies the daily goal by the days', () => {
    expect(goalForPeriod(2000, 7)).toBe(14000);
    expect(goalForPeriod(null, 7)).toBeNull();
  });

  it('goalProgress under the goal', () => {
    expect(goalProgress(1500, 2000)).toEqual({
      fraction: 0.75,
      percent: 75,
      remaining: 500,
      over: false,
    });
  });

  it('goalProgress over the goal caps the bar but not the percent', () => {
    const result = goalProgress(2500, 2000);
    expect(result.fraction).toBe(1);
    expect(result.percent).toBe(125);
    expect(result.remaining).toBe(-500);
    expect(result.over).toBe(true);
  });

  it('goalProgress exactly on the goal is not over', () => {
    expect(goalProgress(2000, 2000).over).toBe(false);
  });

  it('goalProgress is safe when the goal is 0', () => {
    expect(goalProgress(100, 0)).toMatchObject({ fraction: 0, percent: 0 });
  });
});

describe('formatKcal', () => {
  it('adds thousands separators', () => {
    expect(formatKcal(0)).toBe('0');
    expect(formatKcal(950)).toBe('950');
    expect(formatKcal(1250)).toBe('1,250');
    expect(formatKcal(14000)).toBe('14,000');
    expect(formatKcal(1234567)).toBe('1,234,567');
  });

  it('rounds decimals', () => {
    expect(formatKcal(1249.6)).toBe('1,250');
  });
});

describe('parseCalorieGoal', () => {
  it('accepts a valid number', () => {
    expect(parseCalorieGoal(' 2000 ')).toEqual({ value: 2000, error: null });
  });

  it('empty text removes the goal', () => {
    expect(parseCalorieGoal('   ')).toEqual({ value: null, error: null });
  });

  it('rejects text and decimals', () => {
    expect(parseCalorieGoal('abc').error).toBe('Enter a whole number');
    expect(parseCalorieGoal('1500.5').error).toBe('Enter a whole number');
    expect(parseCalorieGoal('-200').error).toBe('Enter a whole number');
  });

  it('rejects numbers outside the allowed range', () => {
    expect(parseCalorieGoal('100').error).toMatch(/between 500 and 10,000/);
    expect(parseCalorieGoal('50000').error).toMatch(/between 500 and 10,000/);
  });
});
