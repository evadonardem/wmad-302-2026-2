/**
 * Recipe API Service - DummyJSON Recipes
 * Docs: https://dummyjson.com/docs/recipes
 */

import axios, { AxiosInstance } from 'axios';
import {
  CategorySummary,
  Recipe,
  RecipesResponse,
  RecipeSearchParams,
} from '@/types/recipe';
import { summariseCategories, uniqueCuisines } from '@/utils/recipeFilters';

const API_BASE_URL = 'https://dummyjson.com/recipes';

class RecipeApiService {
  private client: AxiosInstance;
  private allRecipesPromise: Promise<Recipe[]> | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /** Get recipes with pagination (limit/skip) */
  async getRecipes(params: RecipeSearchParams = {}): Promise<RecipesResponse> {
    const response = await this.client.get<RecipesResponse>('', { params });
    return response.data;
  }

  /** Get single recipe by ID */
  async getRecipeById(id: number): Promise<Recipe> {
    const response = await this.client.get<Recipe>(`/${id}`);
    return response.data;
  }

  /** Search recipes by query (GET /recipes/search?q=) - returns every match */
  async searchRecipes(query: string, params: RecipeSearchParams = {}): Promise<RecipesResponse> {
    const response = await this.client.get<RecipesResponse>('/search', {
      params: { limit: 0, q: query, ...params },
    });
    return response.data;
  }

  /** Get recipes by tag (GET /recipes/tag/{tag}) */
  async getRecipesByTag(tag: string, params: RecipeSearchParams = {}): Promise<RecipesResponse> {
    const response = await this.client.get<RecipesResponse>(`/tag/${encodeURIComponent(tag)}`, {
      params,
    });
    return response.data;
  }

  /** Get recipes by meal type (GET /recipes/meal-type/{type}) */
  async getRecipesByMealType(
    mealType: string,
    params: RecipeSearchParams = {}
  ): Promise<RecipesResponse> {
    const response = await this.client.get<RecipesResponse>(
      `/meal-type/${encodeURIComponent(mealType)}`,
      { params }
    );
    return response.data;
  }

  /**
   * Every recipe (DummyJSON only has a few dozen). Cached for the lifetime of the app so
   * categories, filters, favorites and stats share a single request.
   */
  getAllRecipes(forceRefresh = false): Promise<Recipe[]> {
    if (!this.allRecipesPromise || forceRefresh) {
      this.allRecipesPromise = this.getRecipes({ limit: 0 })
        .then((res) => res.recipes)
        .catch((error: unknown) => {
          this.allRecipesPromise = null; // allow a retry after a failure
          throw error;
        });
    }
    return this.allRecipesPromise;
  }

  /** Categories = recipe tags with the number of recipes in each */
  async getCategories(forceRefresh = false): Promise<CategorySummary[]> {
    return summariseCategories(await this.getAllRecipes(forceRefresh));
  }

  async getCuisines(): Promise<string[]> {
    return uniqueCuisines(await this.getAllRecipes());
  }

  /** Test helper */
  clearCache(): void {
    this.allRecipesPromise = null;
  }
}

export const recipeApi = new RecipeApiService();
export { RecipeApiService };
