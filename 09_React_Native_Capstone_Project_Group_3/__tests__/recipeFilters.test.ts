import {
  averageRating,
  filterAndSortRecipes,
  filterRecipes,
  hasActiveFilters,
  EMPTY_FILTERS,
  sortRecipes,
  summariseCategories,
  uniqueCuisines,
} from '@/utils/recipeFilters';
import { makeRecipe } from '@/test-utils/fixtures';

const pizza = makeRecipe({ id: 1, name: 'Pizza', rating: 4.5, prepTimeMinutes: 20, cookTimeMinutes: 15, caloriesPerServing: 300 });
const salad = makeRecipe({
  id: 2,
  name: 'Salad',
  cuisine: 'Greek',
  difficulty: 'Medium',
  tags: ['Salad', 'Healthy'],
  mealType: ['Lunch'],
  rating: 4.9,
  prepTimeMinutes: 10,
  cookTimeMinutes: 0,
  caloriesPerServing: 120,
});
const stew = makeRecipe({
  id: 3,
  name: 'Stew',
  cuisine: 'Irish',
  difficulty: 'Hard',
  tags: ['Healthy'],
  mealType: ['Dinner'],
  rating: 4.1,
  prepTimeMinutes: 30,
  cookTimeMinutes: 120,
  caloriesPerServing: 520,
});
const all = [pizza, salad, stew];

describe('filterRecipes', () => {
  it('returns everything without filters', () => {
    expect(filterRecipes(all, EMPTY_FILTERS)).toHaveLength(3);
  });

  it('filters by category (tag or meal type, case-insensitive)', () => {
    expect(filterRecipes(all, { ...EMPTY_FILTERS, category: 'healthy' }).map((r) => r.id)).toEqual([2, 3]);
    expect(filterRecipes(all, { ...EMPTY_FILTERS, category: 'Lunch' }).map((r) => r.id)).toEqual([2]);
  });

  it('filters by cuisine and difficulty and combines filters', () => {
    expect(filterRecipes(all, { ...EMPTY_FILTERS, cuisine: 'Greek' }).map((r) => r.id)).toEqual([2]);
    expect(filterRecipes(all, { ...EMPTY_FILTERS, difficulty: 'Hard' }).map((r) => r.id)).toEqual([3]);
    expect(filterRecipes(all, { category: 'Healthy', cuisine: 'Greek', difficulty: 'Hard' })).toEqual([]);
  });

  it('detects active filters', () => {
    expect(hasActiveFilters(EMPTY_FILTERS)).toBe(false);
    expect(hasActiveFilters({ ...EMPTY_FILTERS, cuisine: 'Greek' })).toBe(true);
  });
});

describe('sortRecipes', () => {
  it('keeps the original order for relevance and never mutates the input', () => {
    const copy = [...all];
    expect(sortRecipes(all, 'relevance').map((r) => r.id)).toEqual([1, 2, 3]);
    expect(all).toEqual(copy);
  });

  it('sorts by rating (desc), time (asc) and calories (asc)', () => {
    expect(sortRecipes(all, 'rating').map((r) => r.id)).toEqual([2, 1, 3]);
    expect(sortRecipes(all, 'time').map((r) => r.id)).toEqual([2, 1, 3]);
    expect(sortRecipes(all, 'calories').map((r) => r.id)).toEqual([2, 1, 3]);
  });

  it('filterAndSortRecipes applies both', () => {
    const result = filterAndSortRecipes(all, { ...EMPTY_FILTERS, category: 'Healthy' }, 'rating');
    expect(result.map((r) => r.id)).toEqual([2, 3]);
  });
});

describe('summaries', () => {
  it('counts tags per category, most popular first', () => {
    const summary = summariseCategories(all);
    expect(summary[0]).toEqual({ name: 'Healthy', count: 2 });
    expect(summary.find((c) => c.name === 'Pizza')?.count).toBe(1);
  });

  it('lists unique cuisines alphabetically', () => {
    expect(uniqueCuisines(all)).toEqual(['Greek', 'Irish', 'Italian']);
  });

  it('averages API and local ratings', () => {
    expect(averageRating(4, 10, [])).toBe(4);
    expect(averageRating(4, 1, [2])).toBe(3);
    expect(averageRating(0, 0, [])).toBe(0);
  });
});
