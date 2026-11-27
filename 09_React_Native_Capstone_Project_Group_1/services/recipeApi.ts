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
    const response = await this.client.get<RecipesResponse>('', { params });
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
   * Get recipes by category
   * DummyJSON has no /category endpoint for recipes, so a "category" is a tag
   * (GET /recipes/tag/{tag}).
   */
  async getRecipesByCategory(category: string, params: RecipeSearchParams = {}): Promise<RecipesResponse> {
    const response = await this.client.get<RecipesResponse>(`/tag/${encodeURIComponent(category)}`, {
      params,
    });
    return response.data;
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
   * Get recipes by meal type (GET /recipes/meal-type/{mealType})
   */
  async getRecipesByMealType(mealType: string, params: RecipeSearchParams = {}): Promise<RecipesResponse> {
    const response = await this.client.get<RecipesResponse>(
      `/meal-type/${encodeURIComponent(mealType)}`,
      { params }
    );
    return response.data;
  }

  /**
   * Get random recipe(s)
   * DummyJSON has no /random endpoint for recipes, so we pick random ids from the total.
   */
  async getRandomRecipes(count: number = 1): Promise<Recipe[]> {
    const { total } = await this.getRecipes({ limit: 1 });
    const ids = Array.from({ length: count }, () => Math.floor(Math.random() * total) + 1);
    return Promise.all(ids.map((id) => this.getRecipeById(id)));
  }

  /**
   * Get all categories
   * DummyJSON doesn't have a categories endpoint for recipes,
   * so we use its tag list (GET /recipes/tags) as the categories.
   */
  async getCategories(): Promise<string[]> {
    const response = await this.client.get<string[]>('/tags');
    return response.data;
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