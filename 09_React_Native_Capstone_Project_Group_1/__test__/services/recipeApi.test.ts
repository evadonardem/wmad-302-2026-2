/**
 * Unit tests - recipeApi (axios is mocked, no network)
 */
import axios from 'axios';
import { recipeApi } from '@/services/recipeApi';
import { sampleRecipe } from '../../test-utils/fixtures';

jest.mock('axios', () => {
  const client = { get: jest.fn() };
  return { __esModule: true, default: { create: jest.fn(() => client) } };
});

// The service creates its axios client once, when it is imported
const client = (axios.create as jest.Mock).mock.results[0].value as { get: jest.Mock };

const listResponse = { recipes: [sampleRecipe], total: 1, skip: 0, limit: 10 };

beforeEach(() => {
  client.get.mockReset();
});

describe('recipeApi', () => {
  it('creates the client with the recipes base URL', () => {
    expect(axios.create).toHaveBeenCalledWith(
      expect.objectContaining({ baseURL: 'https://dummyjson.com/recipes' })
    );
  });

  it('getRecipes passes pagination params', async () => {
    client.get.mockResolvedValue({ data: listResponse });
    const result = await recipeApi.getRecipes({ limit: 10, skip: 20 });
    expect(client.get).toHaveBeenCalledWith('', { params: { limit: 10, skip: 20 } });
    expect(result).toEqual(listResponse);
  });

  it('getRecipeById requests /{id}', async () => {
    client.get.mockResolvedValue({ data: sampleRecipe });
    expect(await recipeApi.getRecipeById(1)).toEqual(sampleRecipe);
    expect(client.get).toHaveBeenCalledWith('/1');
  });

  it('searchRecipes sends the query as q', async () => {
    client.get.mockResolvedValue({ data: listResponse });
    await recipeApi.searchRecipes('pizza', { limit: 0 });
    expect(client.get).toHaveBeenCalledWith('/search', { params: { q: 'pizza', limit: 0 } });
  });

  it('getRecipesByCategory uses the tag endpoint and encodes the name', async () => {
    client.get.mockResolvedValue({ data: listResponse });
    await recipeApi.getRecipesByCategory('Side Dish', { limit: 5 });
    expect(client.get).toHaveBeenCalledWith('/tag/Side%20Dish', { params: { limit: 5 } });
  });

  it('getRecipesByTag encodes the tag', async () => {
    client.get.mockResolvedValue({ data: listResponse });
    await recipeApi.getRecipesByTag('Stir-fry');
    expect(client.get).toHaveBeenCalledWith('/tag/Stir-fry', { params: {} });
  });

  it('getRecipesByMealType uses the meal-type endpoint', async () => {
    client.get.mockResolvedValue({ data: listResponse });
    await recipeApi.getRecipesByMealType('Dinner');
    expect(client.get).toHaveBeenCalledWith('/meal-type/Dinner', { params: {} });
  });

  it('getCategories returns the tag list', async () => {
    client.get.mockResolvedValue({ data: ['Pizza', 'Pasta'] });
    expect(await recipeApi.getCategories()).toEqual(['Pizza', 'Pasta']);
    expect(client.get).toHaveBeenCalledWith('/tags');
  });

  it('getMealTypes returns the static list', async () => {
    const types = await recipeApi.getMealTypes();
    expect(types).toContain('Breakfast');
    expect(types).toContain('Dinner');
  });

  it('getRandomRecipes fetches random ids within the total', async () => {
    client.get
      .mockResolvedValueOnce({ data: { ...listResponse, total: 50 } })
      .mockResolvedValue({ data: sampleRecipe });
    jest.spyOn(Math, 'random').mockReturnValue(0.5);

    const recipes = await recipeApi.getRandomRecipes(2);

    // first call reads the total (50); random 0.5 -> id 26, requested twice
    expect(client.get).toHaveBeenNthCalledWith(1, '', { params: { limit: 1 } });
    expect(client.get).toHaveBeenCalledWith('/26');
    expect(recipes).toHaveLength(2);
    jest.restoreAllMocks();
  });

  it('passes API errors on to the caller', async () => {
    client.get.mockRejectedValue(new Error('Network Error'));
    await expect(recipeApi.getRecipeById(1)).rejects.toThrow('Network Error');
  });
});