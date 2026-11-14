/* eslint-env jest */
import { RecipeApiService } from '@/services/recipeApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SAMPLE_RECIPES } from '../../test-utils/fixtures';

jest.mock('@react-native-async-storage/async-storage', () =>
  jest.requireActual('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

const mockGet = jest.fn();

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    create: () => ({ get: (...args: unknown[]) => mockGet(...args) }),
    isAxiosError: (e: unknown) => typeof e === 'object' && e !== null && 'response' in e,
  },
}));

const listResponse = {
  data: { recipes: SAMPLE_RECIPES, total: 3, skip: 0, limit: 10 },
};

let api: RecipeApiService;

beforeEach(async () => {
  await AsyncStorage.clear();
  mockGet.mockReset();
  api = new RecipeApiService();
});

describe('RecipeApiService', () => {
  it('getRecipes passes limit/skip to /recipes', async () => {
    mockGet.mockResolvedValue(listResponse);
    const result = await api.getRecipes({ limit: 10, skip: 20 });
    expect(mockGet).toHaveBeenCalledWith('/recipes', { params: { limit: 10, skip: 20 } });
    expect(result.recipes).toHaveLength(3);
  });

  it('getAllRecipes downloads once and caches the result', async () => {
    mockGet.mockResolvedValue(listResponse);
    await api.getAllRecipes();
    await api.getAllRecipes();
    expect(mockGet).toHaveBeenCalledTimes(1);
    expect(mockGet).toHaveBeenCalledWith('/recipes', { params: { limit: 0 } });
  });

  it('getAllRecipes(true) downloads again', async () => {
    mockGet.mockResolvedValue(listResponse);
    await api.getAllRecipes();
    await api.getAllRecipes(true);
    expect(mockGet).toHaveBeenCalledTimes(2);
  });

  it('getAllRecipes does not cache a failure', async () => {
    mockGet.mockRejectedValueOnce(new Error('offline'));
    await expect(api.getAllRecipes()).rejects.toThrow('offline');
    mockGet.mockResolvedValueOnce(listResponse);
    await expect(api.getAllRecipes()).resolves.toHaveLength(3);
  });

  it('getRecipeById returns the recipe', async () => {
    mockGet.mockResolvedValue({ data: SAMPLE_RECIPES[0] });
    const recipe = await api.getRecipeById(1);
    expect(mockGet).toHaveBeenCalledWith('/recipes/1');
    expect(recipe.name).toBe('Margherita Pizza');
  });

  it('getRecipeById turns a 404 into "Recipe not found"', async () => {
    mockGet.mockRejectedValue({ response: { status: 404 } });
    await expect(api.getRecipeById(999)).rejects.toThrow('Recipe not found');
  });

  it('getRecipeById rethrows other errors', async () => {
    mockGet.mockRejectedValue(new Error('boom'));
    await expect(api.getRecipeById(1)).rejects.toThrow('boom');
  });

  it('searchRecipes sends q and extra params', async () => {
    mockGet.mockResolvedValue(listResponse);
    await api.searchRecipes('pizza', { limit: 0 });
    expect(mockGet).toHaveBeenCalledWith('/recipes/search', { params: { q: 'pizza', limit: 0 } });
  });

  it('getTags returns the tag list', async () => {
    mockGet.mockResolvedValue({ data: ['Pizza', 'Pasta'] });
    expect(await api.getTags()).toEqual(['Pizza', 'Pasta']);
    expect(mockGet).toHaveBeenCalledWith('/recipes/tags');
  });

  it('getRecipesByTag and getRecipesByMealType encode the value', async () => {
    mockGet.mockResolvedValue(listResponse);
    await api.getRecipesByTag('Stir fry', {});
    expect(mockGet).toHaveBeenLastCalledWith('/recipes/tag/Stir%20fry', { params: {} });
    await api.getRecipesByMealType('Side Dish', {});
    expect(mockGet).toHaveBeenLastCalledWith('/recipes/meal-type/Side%20Dish', { params: {} });
  });

  describe('offline support', () => {
    it('saves a copy of the catalog after a successful download', async () => {
      mockGet.mockResolvedValue(listResponse);
      await api.getAllRecipes();
      const saved = await AsyncStorage.getItem('recipes_offline_cache');
      expect(JSON.parse(saved as string)).toHaveLength(3);
      expect(api.isUsingCache).toBe(false);
    });

    it('getAllRecipes falls back to the saved copy when the network fails', async () => {
      mockGet.mockResolvedValueOnce(listResponse);
      await api.getAllRecipes(); // fills the offline copy
      mockGet.mockRejectedValueOnce(new Error('Network Error'));
      const recipes = await api.getAllRecipes(true);
      expect(recipes).toHaveLength(3);
      expect(api.isUsingCache).toBe(true);
    });

    it('getAllRecipes retries the network on the next call after a fallback', async () => {
      mockGet.mockResolvedValueOnce(listResponse);
      await api.getAllRecipes();
      mockGet.mockRejectedValueOnce(new Error('Network Error'));
      await api.getAllRecipes(true);
      mockGet.mockResolvedValueOnce(listResponse);
      await api.getAllRecipes();
      expect(api.isUsingCache).toBe(false);
    });

    it('getRecipeById returns the saved recipe when offline', async () => {
      mockGet.mockResolvedValueOnce(listResponse);
      await api.getAllRecipes();
      mockGet.mockRejectedValueOnce(new Error('Network Error'));
      const recipe = await api.getRecipeById(2);
      expect(recipe.id).toBe(2);
      expect(api.isUsingCache).toBe(true);
    });

    it('getRecipeById still throws when offline and nothing was saved', async () => {
      mockGet.mockRejectedValueOnce(new Error('Network Error'));
      await expect(api.getRecipeById(2)).rejects.toThrow('Network Error');
    });

    it('a 404 is never answered from the saved copy', async () => {
      mockGet.mockResolvedValueOnce(listResponse);
      await api.getAllRecipes();
      mockGet.mockRejectedValueOnce({ response: { status: 404 } });
      await expect(api.getRecipeById(1)).rejects.toThrow('Recipe not found');
    });
  });
});
