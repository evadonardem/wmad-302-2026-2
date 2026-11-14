/**
 * Recipe API Service - DummyJSON Recipes
 * Docs: https://dummyjson.com/docs/recipes
 *
 * Endpoints used:
 *   GET /recipes                      list (limit, skip, sortBy, order)
 *   GET /recipes/{id}                 one recipe
 *   GET /recipes/search?q=            text search
 *   GET /recipes/tags                 all tags
 *   GET /recipes/tag/{tag}            recipes with a tag
 *   GET /recipes/meal-type/{type}     recipes for a meal type
 * (DummyJSON has no "category" or "random" recipe endpoint.)
 *
 * Offline support: every successful full download is copied to AsyncStorage.
 * If the network fails, getAllRecipes / getRecipeById fall back to that copy
 * and `isUsingCache` becomes true so the UI can show an "offline" banner.
 */

import axios, { AxiosInstance } from 'axios';
import { Recipe, RecipesResponse, RecipeQueryParams } from '@/types/recipe';
import { recipeCacheStorage } from '@/utils/storage';

const API_BASE_URL = 'https://dummyjson.com';

class RecipeApiService {
  private client: AxiosInstance;
  // Shared download of the whole catalog (see getAllRecipes)
  private allRecipesPromise: Promise<Recipe[]> | null = null;
  /** true when the last request was answered from the offline copy */
  isUsingCache = false;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  /** Get recipes with pagination and sorting */
  async getRecipes(params: RecipeQueryParams = {}): Promise<RecipesResponse> {
    const response = await this.client.get<RecipesResponse>('/recipes', { params });
    return response.data;
  }

  /**
   * Get every recipe (DummyJSON only has about 50). The result is cached so
   * Home, Search and Categories share one download. Pass true to re-download.
   */
  getAllRecipes(forceRefresh = false): Promise<Recipe[]> {
    if (!this.allRecipesPromise || forceRefresh) {
      this.allRecipesPromise = this.getRecipes({ limit: 0 })
        .then(async (response) => {
          this.isUsingCache = false;
          try {
            await recipeCacheStorage.set(response.recipes); // keep an offline copy
          } catch {
            // a failed save must never break the screen
          }
          return response.recipes;
        })
        .catch(async (error: unknown) => {
          this.allRecipesPromise = null; // don't cache a failure (retry next time)
          const saved = await recipeCacheStorage.get();
          if (saved.length > 0) {
            this.isUsingCache = true;
            return saved;
          }
          throw error;
        });
    }
    return this.allRecipesPromise;
  }

  /** Get a single recipe by ID */
  async getRecipeById(id: number): Promise<Recipe> {
    try {
      const response = await this.client.get<Recipe>(`/recipes/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new Error('Recipe not found');
      }
      // Network problem: try the offline copy before giving up
      const saved = (await recipeCacheStorage.get()).find((recipe) => recipe.id === id);
      if (saved) {
        this.isUsingCache = true;
        return saved;
      }
      throw error;
    }
  }

  /** Search recipes by text */
  async searchRecipes(query: string, params: RecipeQueryParams = {}): Promise<RecipesResponse> {
    const response = await this.client.get<RecipesResponse>('/recipes/search', {
      params: { q: query, ...params },
    });
    return response.data;
  }

  /** Get every tag used by recipes */
  async getTags(): Promise<string[]> {
    const response = await this.client.get<string[]>('/recipes/tags');
    return response.data;
  }

  /** Get recipes that have a given tag */
  async getRecipesByTag(tag: string, params: RecipeQueryParams = {}): Promise<RecipesResponse> {
    const response = await this.client.get<RecipesResponse>(
      `/recipes/tag/${encodeURIComponent(tag)}`,
      { params }
    );
    return response.data;
  }

  /** Get recipes for a meal type (e.g. "Dinner", "Snack") */
  async getRecipesByMealType(
    mealType: string,
    params: RecipeQueryParams = {}
  ): Promise<RecipesResponse> {
    const response = await this.client.get<RecipesResponse>(
      `/recipes/meal-type/${encodeURIComponent(mealType)}`,
      { params }
    );
    return response.data;
  }
}

export const recipeApi = new RecipeApiService();
export { RecipeApiService };
