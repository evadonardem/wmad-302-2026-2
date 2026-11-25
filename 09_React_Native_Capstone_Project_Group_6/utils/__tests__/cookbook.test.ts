/* eslint-env jest */
import {
  addWeeks,
  buildShoppingMessage,
  formatDayShort,
  formatWeekRange,
  getUpcomingDays,
  getWeekDays,
  mergeIngredients,
  normalizeIngredient,
  recipeIdsForDates,
  startOfWeek,
  toDateKey,
} from '@/utils/cookbook';
import type { PlannedMeal, ShoppingItem } from '@/types/cookbook';

describe('date helpers', () => {
  it('toDateKey uses the local date with zero padding', () => {
    expect(toDateKey(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
  });

  it('startOfWeek returns Monday for a Wednesday', () => {
    expect(toDateKey(startOfWeek(new Date(2026, 10, 11)))).toBe('2026-11-09');
  });

  it('startOfWeek returns the previous Monday for a Sunday', () => {
    expect(toDateKey(startOfWeek(new Date(2026, 10, 15)))).toBe('2026-11-09');
  });

  it('getWeekDays gives 7 consecutive days Mon-Sun', () => {
    const keys = getWeekDays(new Date(2026, 10, 11)).map(toDateKey);
    expect(keys).toHaveLength(7);
    expect(keys[0]).toBe('2026-11-09');
    expect(keys[6]).toBe('2026-11-15');
  });

  it('getWeekDays crosses a month boundary', () => {
    const keys = getWeekDays(new Date(2026, 10, 30)).map(toDateKey);
    expect(keys[0]).toBe('2026-11-30');
    expect(keys[1]).toBe('2026-12-01');
  });

  it('addWeeks moves forward and back', () => {
    const d = new Date(2026, 10, 11);
    expect(toDateKey(addWeeks(d, 1))).toBe('2026-11-18');
    expect(toDateKey(addWeeks(d, -1))).toBe('2026-11-04');
  });
});

describe('normalizeIngredient', () => {
  it('trims and collapses spaces', () => {
    expect(normalizeIngredient('  Olive   oil ')).toBe('Olive oil');
  });
});

describe('recipeIdsForDates', () => {
  const plan: PlannedMeal[] = [
    { id: 'a', date: '2026-11-09', slot: 'Dinner', recipeId: 1 },
    { id: 'b', date: '2026-11-10', slot: 'Lunch', recipeId: 2 },
    { id: 'c', date: '2026-11-10', slot: 'Dinner', recipeId: 1 },
    { id: 'd', date: '2026-11-20', slot: 'Dinner', recipeId: 3 },
  ];

  it('returns unique ids for the given days only', () => {
    expect(recipeIdsForDates(plan, ['2026-11-09', '2026-11-10'])).toEqual([1, 2]);
  });

  it('returns an empty list when nothing is planned', () => {
    expect(recipeIdsForDates(plan, ['2030-01-01'])).toEqual([]);
  });
});

describe('mergeIngredients', () => {
  it('creates one item per ingredient', () => {
    const items = mergeIngredients([], [{ id: 1, ingredients: ['Flour', 'Eggs'] }]);
    expect(items.map((i) => i.name)).toEqual(['Flour', 'Eggs']);
    expect(items[0]).toMatchObject({ checked: false, recipeIds: [1] });
  });

  it('merges the same ingredient from two recipes (case-insensitive)', () => {
    const items = mergeIngredients(
      [],
      [
        { id: 1, ingredients: ['Olive oil'] },
        { id: 2, ingredients: ['olive  OIL', 'Salt'] },
      ]
    );
    expect(items).toHaveLength(2);
    expect(items[0].recipeIds).toEqual([1, 2]);
  });

  it('keeps the checked state of items already on the list', () => {
    const existing: ShoppingItem[] = [
      { id: 'x', name: 'Salt', checked: true, recipeIds: [] },
    ];
    const items = mergeIngredients(existing, [{ id: 5, ingredients: ['salt', 'Pepper'] }]);
    expect(items[0]).toMatchObject({ name: 'Salt', checked: true, recipeIds: [5] });
    expect(items[1].name).toBe('Pepper');
  });

  it('does not mutate the original list', () => {
    const existing: ShoppingItem[] = [{ id: 'x', name: 'Salt', checked: false, recipeIds: [] }];
    mergeIngredients(existing, [{ id: 5, ingredients: ['Salt'] }]);
    expect(existing[0].recipeIds).toEqual([]);
  });

  it('skips blank ingredients', () => {
    expect(mergeIngredients([], [{ id: 1, ingredients: ['  ', ''] }])).toEqual([]);
  });
});

describe('display helpers', () => {
  it('formatDayShort shows weekday and day number', () => {
    expect(formatDayShort(new Date(2026, 10, 9))).toBe('Mon 9');
  });

  it('formatWeekRange shows first and last day', () => {
    expect(formatWeekRange(getWeekDays(new Date(2026, 10, 11)))).toBe('Nov 9 - Nov 15');
    expect(formatWeekRange([])).toBe('');
  });

  it('getUpcomingDays starts today and gives the requested count', () => {
    const days = getUpcomingDays(new Date(2026, 10, 30, 15, 0), 3).map(toDateKey);
    expect(days).toEqual(['2026-11-30', '2026-12-01', '2026-12-02']);
  });

  it('buildShoppingMessage marks checked items', () => {
    const msg = buildShoppingMessage([
      { id: 'a', name: 'Flour', checked: false, recipeIds: [] },
      { id: 'b', name: 'Eggs', checked: true, recipeIds: [] },
    ]);
    expect(msg).toBe('Shopping list\n\n[ ] Flour\n[x] Eggs');
  });

  it('buildShoppingMessage handles an empty list', () => {
    expect(buildShoppingMessage([])).toBe('My shopping list is empty.');
  });
});
