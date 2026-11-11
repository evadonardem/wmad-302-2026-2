/**
 * Recipe Types - DummyJSON Recipes API
 * Docs: https://dummyjson.com/docs/recipes
 */

export type RecipeDifficulty = 'Easy' | 'Medium' | 'Hard';

export interface Recipe {
  id: number;
  name: string;
  ingredients: string[];
  instructions: string[];
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  difficulty: RecipeDifficulty;
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

// Fields the API can sort by (?sortBy=name&order=asc)
export type RecipeSortField =
  | 'name'
  | 'rating'
  | 'caloriesPerServing'
  | 'prepTimeMinutes'
  | 'cookTimeMinutes';

export type SortOrder = 'asc' | 'desc';

// Query-string options shared by the list endpoints
export interface RecipeQueryParams {
  limit?: number; // 0 = return everything
  skip?: number;
  select?: string; // e.g. 'name,image'
  sortBy?: RecipeSortField;
  order?: SortOrder;
}