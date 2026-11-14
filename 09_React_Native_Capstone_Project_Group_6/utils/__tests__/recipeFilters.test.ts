/* eslint-env jest */
import {
  EMPTY_FILTERS,
  countBy,
  filterRecipes,
  hasActiveFilters,
  sortRecipes,
  totalTime,
  uniqueSorted,
  DEFAULT_SORT,
  SORT_OPTIONS,
} from '@/utils/recipeFilters';
import { SAMPLE_RECIPES } from '../../test-utils/fixtures';

const ids = (list: { id: number }[]) => list.map((r) => r.id);

describe('recipeFilters', () => {
  it('totalTime adds prep and cook time', () => {
    expect(totalTime(SAMPLE_RECIPES[0])).toBe(35);
  });

  it('hasActiveFilters is false for empty filters and true when one is set', () => {
    expect(hasActiveFilters(EMPTY_FILTERS)).toBe(false);
    expect(hasActiveFilters({ ...EMPTY_FILTERS, tag: 'Pizza' })).toBe(true);
  });

  describe('filterRecipes', () => {
    it('returns everything with no filters', () => {
      expect(filterRecipes(SAMPLE_RECIPES, EMPTY_FILTERS)).toHaveLength(3);
    });

    it('filters by cuisine, ignoring letter case', () => {
      const result = filterRecipes(SAMPLE_RECIPES, { ...EMPTY_FILTERS, cuisine: 'indian' });
      expect(ids(result)).toEqual([2]);
    });

    it('filters by difficulty', () => {
      const result = filterRecipes(SAMPLE_RECIPES, { ...EMPTY_FILTERS, difficulty: 'Medium' });
      expect(ids(result)).toEqual([3]);
    });

    it('filters by meal type and tag', () => {
      expect(ids(filterRecipes(SAMPLE_RECIPES, { ...EMPTY_FILTERS, mealType: 'lunch' }))).toEqual([
        2,
      ]);
      expect(ids(filterRecipes(SAMPLE_RECIPES, { ...EMPTY_FILTERS, tag: 'pizza' }))).toEqual([
        1, 3,
      ]);
    });

    it('combines filters (all must match)', () => {
      const result = filterRecipes(SAMPLE_RECIPES, {
        ...EMPTY_FILTERS,
        tag: 'Pizza',
        difficulty: 'Easy',
      });
      expect(ids(result)).toEqual([1]);
    });

    it('returns an empty list when nothing matches', () => {
      expect(filterRecipes(SAMPLE_RECIPES, { ...EMPTY_FILTERS, cuisine: 'Thai' })).toEqual([]);
    });
  });

  describe('sortRecipes', () => {
    it('keeps the original order for "default"', () => {
      expect(ids(sortRecipes(SAMPLE_RECIPES, 'default'))).toEqual([1, 2, 3]);
    });

    it('sorts by rating (highest first)', () => {
      expect(ids(sortRecipes(SAMPLE_RECIPES, 'rating'))).toEqual([2, 1, 3]);
    });

    it('sorts by total time (quickest first)', () => {
      expect(ids(sortRecipes(SAMPLE_RECIPES, 'time'))).toEqual([3, 1, 2]);
    });

    it('sorts by calories (lowest first)', () => {
      expect(ids(sortRecipes(SAMPLE_RECIPES, 'calories'))).toEqual([3, 1, 2]);
    });

    it('sorts by name A-Z', () => {
      expect(ids(sortRecipes(SAMPLE_RECIPES, 'name'))).toEqual([3, 2, 1]);
    });

    it('does not change the original array', () => {
      const before = ids(SAMPLE_RECIPES);
      sortRecipes(SAMPLE_RECIPES, 'rating');
      expect(ids(SAMPLE_RECIPES)).toEqual(before);
    });
  });

  describe('countBy / uniqueSorted', () => {
    it('counts values, most common first, then by name', () => {
      const counts = countBy(SAMPLE_RECIPES, (r) => r.tags);
      expect(counts[0]).toEqual({ name: 'Pizza', count: 2 });
      expect(counts.map((c) => c.name)).toEqual([
        'Pizza',
        'Chicken',
        'Curry',
        'Italian',
        'Vegetarian',
      ]);
    });

    it('uniqueSorted returns distinct values alphabetically', () => {
      expect(uniqueSorted(SAMPLE_RECIPES, (r) => r.mealType)).toEqual([
        'Breakfast',
        'Dinner',
        'Lunch',
      ]);
    });

    it('handles an empty list', () => {
      expect(countBy([], (r) => r.tags)).toEqual([]);
    });
  });
});

describe('sort menu options', () => {
  it('A–Z is the default sort', () => {
    expect(DEFAULT_SORT).toBe('name');
    expect(ids(sortRecipes(SAMPLE_RECIPES, DEFAULT_SORT))).toEqual([3, 2, 1]);
  });

  it('lists every sort once, with A–Z first', () => {
    const values = SORT_OPTIONS.map((option) => option.value);
    expect(values[0]).toBe(DEFAULT_SORT);
    expect(new Set(values).size).toBe(values.length);
    expect(values).toEqual(
      expect.arrayContaining(['name', 'rating', 'time', 'calories', 'default'])
    );
  });
});