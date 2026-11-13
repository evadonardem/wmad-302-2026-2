import { describe, expect, it } from '@jest/globals';
import type { Recipe } from '@/types/recipe';
import { recipeMatchesSearch } from './recipeSearch';

const recipe: Pick<Recipe, 'name' | 'cuisine' | 'tags' | 'ingredients'> = {
  name: 'Chicken Alfredo Pasta',
  cuisine: 'Italian',
  tags: ['Dinner'],
  ingredients: ['chicken', 'cream', 'fettuccine'],
};

describe('recipe search matching', () => {
  it('matches all query words even when they are not adjacent or ordered', () => {
    expect(recipeMatchesSearch(recipe, 'pasta chicken')).toBe(true);
    expect(recipeMatchesSearch(recipe, 'chicken alfredo')).toBe(true);
    expect(recipeMatchesSearch(recipe, 'chicken seafood')).toBe(false);
  });

  it('matches terms from cuisine, tags, and ingredients without case sensitivity', () => {
    expect(recipeMatchesSearch(recipe, 'italian dinner')).toBe(true);
    expect(recipeMatchesSearch(recipe, 'FETTUCCINE')).toBe(true);
  });

  it('matches an empty query without filtering recipes', () => {
    expect(recipeMatchesSearch(recipe, '   ')).toBe(true);
  });
});
