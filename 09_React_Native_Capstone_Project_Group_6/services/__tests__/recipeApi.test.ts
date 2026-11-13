/* eslint-env jest */
import { RecipeApiService } from '@/services/recipeApi';
import { SAMPLE_RECIPES } from '../../test-utils/fixtures';

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

beforeEach(() => {
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
});
