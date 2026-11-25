/**
 * Recipe Types - DummyJSON Recipes API
 * Docs: https://dummyjson.com/docs/recipes
 */

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface Recipe {
  id: number;
  name: string;
  ingredients: string[];
  instructions: string[];
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  difficulty: Difficulty;
  cuisine: string;
  caloriesPerServing: number;
  tags: string[];
  userId: number;
  image: string;
  rating: number;
  reviewCount: number;
  mealType: string[];
}

export interface RecipesResponse {
  recipes: Recipe[];
  total: number;
  skip: number;
  limit: number;
}

export interface RecipeSearchParams {
  q?: string;
  category?: string;
  tag?: string;
  limit?: number;
  skip?: number;
  select?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

export interface CategoryResponse {
  [key: string]: string[];
}

/** A category is a recipe tag together with the number of recipes that carry it. */
export interface CategorySummary {
  name: string;
  count: number;
}

export type SortOption = 'relevance' | 'rating' | 'time' | 'calories';

export interface RecipeFilters {
  category: string | null;
  cuisine: string | null;
  difficulty: Difficulty | null;
}

/** A review written inside the app (DummyJSON has no recipe-review endpoint). */
export interface Review {
  id: string;
  recipeId: number;
  userId: number;
  author: string;
  rating: number;
  comment: string;
  createdAt: string;
}
