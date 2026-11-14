/**
 * Pure helpers for filtering, sorting and summarising recipes.
 * Kept free of React so they are trivial to unit test.
 */
import type { CategorySummary, Recipe, RecipeFilters, SortOption } from '@/types/recipe';

export const EMPTY_FILTERS: RecipeFilters = { category: null, cuisine: null, difficulty: null };

export const totalTime = (recipe: Recipe): number => recipe.prepTimeMinutes + recipe.cookTimeMinutes;

const sameText = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();

export function hasActiveFilters(filters: RecipeFilters): boolean {
  return Boolean(filters.category || filters.cuisine || filters.difficulty);
}

export function filterRecipes(recipes: Recipe[], filters: RecipeFilters): Recipe[] {
  return recipes.filter((recipe) => {
    if (filters.category) {
      const category = filters.category;
      const inTags = recipe.tags.some((tag) => sameText(tag, category));
      const inMeal = recipe.mealType.some((meal) => sameText(meal, category));
      if (!inTags && !inMeal) return false;
    }
    if (filters.cuisine && !sameText(recipe.cuisine, filters.cuisine)) return false;
    if (filters.difficulty && recipe.difficulty !== filters.difficulty) return false;
    return true;
  });
}

export function sortRecipes(recipes: Recipe[], sort: SortOption): Recipe[] {
  const copy = [...recipes];
  switch (sort) {
    case 'rating':
      return copy.sort((a, b) => b.rating - a.rating);
    case 'time':
      return copy.sort((a, b) => totalTime(a) - totalTime(b));
    case 'calories':
      return copy.sort((a, b) => a.caloriesPerServing - b.caloriesPerServing);
    default:
      return copy;
  }
}

export function filterAndSortRecipes(
  recipes: Recipe[],
  filters: RecipeFilters,
  sort: SortOption
): Recipe[] {
  return sortRecipes(filterRecipes(recipes, filters), sort);
}

/** Count how many recipes carry each tag (a "category"), most popular first. */
export function summariseCategories(recipes: Recipe[]): CategorySummary[] {
  const counts = new Map<string, number>();
  recipes.forEach((recipe) => {
    new Set(recipe.tags).forEach((tag) => counts.set(tag, (counts.get(tag) ?? 0) + 1));
  });
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export function uniqueCuisines(recipes: Recipe[]): string[] {
  return [...new Set(recipes.map((recipe) => recipe.cuisine))].sort();
}

/** Average of the in-app review ratings combined with the API rating. */
export function averageRating(apiRating: number, apiCount: number, localRatings: number[]): number {
  const total = apiRating * apiCount + localRatings.reduce((sum, r) => sum + r, 0);
  const count = apiCount + localRatings.length;
  return count === 0 ? 0 : total / count;
}
