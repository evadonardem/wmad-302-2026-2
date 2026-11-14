import axios, { AxiosInstance } from 'axios';
import {
  Recipe,
  RecipesResponse,
  RecipeSearchParams,
} from '@/types/recipe';

const API_BASE_URL = 'https://dummyjson.com/recipes';

class RecipeApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 15000,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  async getRecipes(
    params: RecipeSearchParams = {}
  ): Promise<RecipesResponse> {
    const response = await this.client.get('/', { params });
    return response.data;
  }

  async getRecipeById(id: number): Promise<Recipe> {
    const response = await this.client.get(`/${id}`);
    return response.data;
  }

  async searchRecipes(
    query: string,
    params: RecipeSearchParams = {}
  ): Promise<RecipesResponse> {
    const response = await this.client.get('/search', {
      params: { ...params, q: query },
    });
    return response.data;
  }

  // Original Cookbook categories
  async getCategories(): Promise<string[]> {
    return [
      'Beef',
      'Chicken',
      'Dessert',
      'Lamb',
      'Pasta',
      'Pork',
      'Seafood',
      'Vegetarian',
      'Breakfast',
      'Appetizer',
      'Side Dish',
      'Main Course',
      'Soup',
      'Salad',
      'Drink',
    ];
  }

  // Filter recipes using the original Cookbook categories
  async getRecipesByCategory(
    category: string,
    params: RecipeSearchParams = {}
  ): Promise<RecipesResponse> {
    const response = await this.getRecipes({ limit: 50 });
    const recipes = response.recipes;

    const keywords: Record<string, string[]> = {
      Beef: ['beef'],
      Chicken: ['chicken'],
      Lamb: ['lamb'],
      Pasta: ['pasta', 'spaghetti', 'macaroni', 'penne', 'noodle'],
      Pork: ['pork', 'bacon', 'ham'],
      Seafood: [
        'fish', 'salmon', 'tuna', 'shrimp', 'prawn',
        'crab', 'lobster', 'squid', 'seafood'
      ],
    };

    const normalizedCategory = category.toLowerCase();

    let filtered: Recipe[];

    if (keywords[category]) {
      filtered = recipes.filter(recipe => {
        const ingredients = recipe.ingredients.join(' ').toLowerCase();
        const name = recipe.name.toLowerCase();

        return keywords[category].some(keyword =>
          ingredients.includes(keyword) || name.includes(keyword)
        );
      });
    } else if (category === 'Vegetarian') {
      const meatWords = [
        'beef', 'chicken', 'pork', 'lamb', 'fish',
        'shrimp', 'salmon', 'bacon', 'ham', 'seafood'
      ];

      filtered = recipes.filter(recipe => {
        const ingredients = recipe.ingredients.join(' ').toLowerCase();

        return !meatWords.some(word => ingredients.includes(word));
      });
    } else {
      filtered = recipes.filter(recipe => {
        const mealTypes = recipe.mealType || [];
        const tags = recipe.tags || [];
        const searchable = [
          recipe.name,
          ...mealTypes,
          ...tags,
          ...recipe.ingredients,
        ].join(' ').toLowerCase();

        if (category === 'Dessert') {
          return mealTypes.some(type => type.toLowerCase() === 'dessert')
            || tags.some(tag => tag.toLowerCase().includes('dessert'));
        }

        if (category === 'Breakfast' ||
            category === 'Appetizer' ||
            category === 'Side Dish' ||
            category === 'Main Course') {
          return mealTypes.some(type =>
            type.toLowerCase() === normalizedCategory
          );
        }

        return searchable.includes(normalizedCategory);
      });
    }

    const skip = params.skip ?? 0;
    const limit = params.limit ?? 50;

    return {
      recipes: filtered.slice(skip, skip + limit),
      total: filtered.length,
      skip,
      limit,
    };
  }

  async getRecipesByTag(
    tag: string,
    params: RecipeSearchParams = {}
  ): Promise<RecipesResponse> {
    const response = await this.client.get(
      `/tag/${encodeURIComponent(tag)}`,
      { params }
    );
    return response.data;
  }

  async getRandomRecipes(count: number = 1): Promise<Recipe[]> {
    const response = await this.client.get(`/random/${count}`);
    return response.data.recipes;
  }

  async getMealTypes(): Promise<string[]> {
    return [
      'Breakfast',
      'Lunch',
      'Dinner',
      'Snack',
      'Appetizer',
      'Dessert',
      'Drink',
    ];
  }
}

export const recipeApi = new RecipeApiService();
export { RecipeApiService };