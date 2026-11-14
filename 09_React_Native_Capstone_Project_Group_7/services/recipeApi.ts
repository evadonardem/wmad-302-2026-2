/**
 * Recipe API Service - DummyJSON Recipes
 * Docs: https://dummyjson.com/docs/recipes
 */

import axios, { AxiosInstance } from 'axios';
import { Recipe, RecipesResponse, RecipeSearchParams } from '@/types/recipe';

const API_BASE_URL = 'https://dummyjson.com/recipes';

class RecipeApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Get all recipes with pagination
   */
  async getRecipes(params: RecipeSearchParams = {}): Promise<RecipesResponse> {
    const response = await this.client.get<RecipesResponse>('/', { params });
    return response.data;
  }

  /**
   * Get single recipe by ID
   */
  async getRecipeById(id: number): Promise<Recipe> {
    const response = await this.client.get<Recipe>(`/${id}`);
    return response.data;
  }

  /**
   * Search recipes by query
   */
  async searchRecipes(query: string, params: RecipeSearchParams = {}): Promise<RecipesResponse> {
    const response = await this.client.get<RecipesResponse>('/search', {
      params: { q: query, ...params },
    });
    return response.data;
  }

  /**
   * Get recipes by category (mapped to DummyJSON tags / cuisine / mealType)
   */
  async getRecipesByCategory(category: string, params: RecipeSearchParams = {}): Promise<RecipesResponse> {
    try {
      const response = await this.client.get<RecipesResponse>(`/tag/${encodeURIComponent(category)}`, {
        params,
      });
      if (response.data && response.data.recipes && response.data.recipes.length > 0) {
        return response.data;
      }
    } catch {
      // Fallback to fetching all and filtering
    }

    const response = await this.client.get<RecipesResponse>('/', {
      params: { limit: 50, ...params },
    });
    const lower = category.toLowerCase();
    const filtered = (response.data.recipes || []).filter(
      (r) =>
        r.cuisine?.toLowerCase() === lower ||
        r.tags?.some((t) => t.toLowerCase() === lower) ||
        r.mealType?.some((m) => m.toLowerCase() === lower)
    );
    return {
      recipes: filtered,
      total: filtered.length,
      skip: 0,
      limit: filtered.length,
    };
  }

  /**
   * Get recipes by tag/meal type
   */
  async getRecipesByTag(tag: string, params: RecipeSearchParams = {}): Promise<RecipesResponse> {
    const response = await this.client.get<RecipesResponse>(`/tag/${encodeURIComponent(tag)}`, {
      params,
    });
    return response.data;
  }

  /**
   * Get random recipe(s)
   */
  async getRandomRecipes(count: number = 1): Promise<Recipe[]> {
    const response = await this.client.get<{ recipes: Recipe[] }>(`/random/${count}`);
    return response.data.recipes;
  }

  /**
   * Get all categories
   */
  async getCategories(): Promise<string[]> {
    return [
      'Beef', 'Chicken', 'Dessert', 'Lamb', 'Pasta', 'Pork', 'Seafood', 'Vegetarian',
      'Breakfast', 'Appetizer', 'Side Dish', 'Main Course', 'Soup', 'Salad', 'Drink',
    ];
  }

  /**
   * Get all meal types/tags
   */
  async getMealTypes(): Promise<string[]> {
    return [
      'Breakfast', 'Lunch', 'Dinner', 'Snack', 'Appetizer', 'Dessert', 'Drink',
    ];
  }
}

export const recipeApi = new RecipeApiService();
export { RecipeApiService };