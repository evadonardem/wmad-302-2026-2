const mockGet = jest.fn();

jest.mock('axios', () => ({
  __esModule: true,
  default: { create: jest.fn(() => ({ get: (...args: unknown[]) => mockGet(...args) })) },
}));

import { RecipeApiService } from '@/services/recipeApi';
import { makeRecipe } from '@/test-utils/fixtures';

const recipes = [makeRecipe({ id: 1 }), makeRecipe({ id: 2, tags: ['Pasta'] })];

describe('RecipeApiService', () => {
  beforeEach(() => mockGet.mockReset());

  it('paginates with limit/skip', async () => {
    mockGet.mockResolvedValue({ data: { recipes, total: 50, skip: 10, limit: 2 } });
    const api = new RecipeApiService();
    const result = await api.getRecipes({ limit: 2, skip: 10 });
    expect(mockGet).toHaveBeenCalledWith('', { params: { limit: 2, skip: 10 } });
    expect(result.total).toBe(50);
  });

  it('searches by query', async () => {
    mockGet.mockResolvedValue({ data: { recipes, total: 2, skip: 0, limit: 0 } });
    await new RecipeApiService().searchRecipes('pizza');
    expect(mockGet).toHaveBeenCalledWith('/search', { params: { limit: 0, q: 'pizza' } });
  });

  it('caches the full list and derives categories with counts', async () => {
    mockGet.mockResolvedValue({ data: { recipes, total: 2, skip: 0, limit: 0 } });
    const api = new RecipeApiService();
    const categories = await api.getCategories();
    await api.getCuisines();
    expect(mockGet).toHaveBeenCalledTimes(1);
    expect(categories.find((c) => c.name === 'Italian')?.count).toBe(1);
    expect(categories.find((c) => c.name === 'Pasta')?.count).toBe(1);
  });

  it('does not cache failures', async () => {
    mockGet.mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce({
      data: { recipes, total: 2, skip: 0, limit: 0 },
    });
    const api = new RecipeApiService();
    await expect(api.getAllRecipes()).rejects.toThrow('offline');
    await expect(api.getAllRecipes()).resolves.toHaveLength(2);
  });

  it('encodes tag names', async () => {
    mockGet.mockResolvedValue({ data: { recipes: [], total: 0, skip: 0, limit: 0 } });
    await new RecipeApiService().getRecipesByTag('Side Dish');
    expect(mockGet).toHaveBeenCalledWith('/tag/Side%20Dish', { params: {} });
  });
});
