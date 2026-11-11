/**
 * Pure helpers for filtering, sorting and counting recipes.
 * They have no React or network code, so they are easy to unit-test.
 */
import type { Recipe, RecipeDifficulty } from '@/types/recipe';

export type SortOption = 'default' | 'rating' | 'time' | 'calories' | 'name';

export interface RecipeFilters {
    cuisine: string | null;
    difficulty: RecipeDifficulty | null;
    mealType: string | null;
    tag: string | null;
}

export const EMPTY_FILTERS: RecipeFilters = {
    cuisine: null,
    difficulty: null,
    mealType: null,
    tag: null,
};

export interface CountedItem {
    name: string;
    count: number;
}

const same = (a: string, b: string): boolean => a.toLowerCase() === b.toLowerCase();

/** Prep + cook time in minutes */
export function totalTime(recipe: Recipe): number {
    return recipe.prepTimeMinutes + recipe.cookTimeMinutes;
}

export function hasActiveFilters(filters: RecipeFilters): boolean {
    return Object.values(filters).some((value) => value !== null);
}

/** Keep only recipes that match every filter that is set. */
export function filterRecipes(recipes: Recipe[], filters: RecipeFilters): Recipe[] {
    const { cuisine, difficulty, mealType, tag } = filters;
    return recipes.filter(
        (recipe) =>
            (cuisine === null || same(recipe.cuisine, cuisine)) &&
            (difficulty === null || recipe.difficulty === difficulty) &&
            (mealType === null || recipe.mealType.some((m) => same(m, mealType))) &&
            (tag === null || recipe.tags.some((t) => same(t, tag)))
    );
}

/** Return a sorted copy. 'default' keeps the original (API) order. */
export function sortRecipes(recipes: Recipe[], sort: SortOption): Recipe[] {
    const copy = [...recipes];
    switch (sort) {
        case 'rating':
            return copy.sort((a, b) => b.rating - a.rating);
        case 'time':
            return copy.sort((a, b) => totalTime(a) - totalTime(b));
        case 'calories':
            return copy.sort((a, b) => a.caloriesPerServing - b.caloriesPerServing);
        case 'name':
            return copy.sort((a, b) => a.name.localeCompare(b.name));
        default:
            return copy;
    }
}

/**
 * Count how many recipes fall under each value, most common first.
 * e.g. countBy(recipes, (r) => r.tags) -> [{ name: 'Pasta', count: 6 }, ...]
 */
export function countBy(recipes: Recipe[], pick: (recipe: Recipe) => string[]): CountedItem[] {
    const counts = new Map<string, number>();
    recipes.forEach((recipe) => {
        pick(recipe).forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1));
    });
    return [...counts.entries()]
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

/** Distinct values, alphabetically. */
export function uniqueSorted(recipes: Recipe[], pick: (recipe: Recipe) => string[]): string[] {
    return countBy(recipes, pick)
        .map((item) => item.name)
        .sort((a, b) => a.localeCompare(b));
}