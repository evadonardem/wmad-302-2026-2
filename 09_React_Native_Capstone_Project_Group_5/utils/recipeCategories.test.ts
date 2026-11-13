import { describe, expect, it } from '@jest/globals';
import type { Recipe } from '@/types/recipe';
import { getRecipeCategoryCounts, recipeMatchesCategory } from './recipeCategories';

const shrimpPasta: Pick<Recipe, 'name' | 'cuisine' | 'tags' | 'ingredients' | 'mealType'> = {
  name: 'Shrimp Pasta',
  cuisine: 'Italian',
  tags: ['Dinner'],
  ingredients: ['shrimp', 'pasta'],
  mealType: ['Lunch'],
};

describe('recipe category matching', () => {
  it('matches categories from recipe ingredients even when they are not API tags', () => {
    expect(recipeMatchesCategory(shrimpPasta, 'Seafood')).toBe(true);
    expect(recipeMatchesCategory(shrimpPasta, 'Pasta')).toBe(true);
  });

  it('returns category counts using the same matching rules', () => {
    const counts = getRecipeCategoryCounts([shrimpPasta]);

    expect(counts.find(({ name }) => name === 'Seafood')?.count).toBe(1);
    expect(counts.find(({ name }) => name === 'Beef')?.count).toBe(0);
    expect(recipeMatchesCategory(shrimpPasta, 'Unknown')).toBe(false);
  });
});
