/* eslint-env jest */
import { act, renderHook, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAsyncStorage, useDebounce, useRecipeCatalog } from '@/hooks';
import { recipeApi } from '@/services/recipeApi';
import { SAMPLE_RECIPES } from '../../test-utils/fixtures';

jest.mock('@react-native-async-storage/async-storage', () =>
  jest.requireActual('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
jest.mock('@/services/recipeApi', () => ({
  recipeApi: { getAllRecipes: jest.fn() },
}));

const mockGetAll = recipeApi.getAllRecipes as jest.Mock;

describe('useDebounce', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('returns the first value at once and the new value after the delay', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 400), {
      initialProps: { value: 'a' },
    });
    expect(result.current).toBe('a');

    rerender({ value: 'ab' });
    expect(result.current).toBe('a');

    act(() => {
      jest.advanceTimersByTime(399);
    });
    expect(result.current).toBe('a');

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(result.current).toBe('ab');
  });

  it('restarts the timer while the user keeps typing', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 400), {
      initialProps: { value: 'a' },
    });
    rerender({ value: 'ab' });
    act(() => {
      jest.advanceTimersByTime(300);
    });
    rerender({ value: 'abc' });
    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(result.current).toBe('a');
    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(result.current).toBe('abc');
  });
});

describe('useAsyncStorage', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('uses the initial value when nothing is saved', async () => {
    const { result } = renderHook(() => useAsyncStorage<number[]>('favorite_recipe_ids', []));
    await waitFor(() => expect(result.current[2]).toBe(false));
    expect(result.current[0]).toEqual([]);
  });

  it('loads a saved value', async () => {
    await AsyncStorage.setItem('favorite_recipe_ids', JSON.stringify([1, 2]));
    const { result } = renderHook(() => useAsyncStorage<number[]>('favorite_recipe_ids', []));
    await waitFor(() => expect(result.current[0]).toEqual([1, 2]));
  });

  it('saves updates (value or updater function)', async () => {
    const { result } = renderHook(() => useAsyncStorage<number[]>('favorite_recipe_ids', []));
    await waitFor(() => expect(result.current[2]).toBe(false));

    await act(async () => {
      await result.current[1]([7]);
    });
    expect(result.current[0]).toEqual([7]);
    expect(await AsyncStorage.getItem('favorite_recipe_ids')).toBe('[7]');

    await act(async () => {
      await result.current[1]((prev) => [...prev, 8]);
    });
    expect(result.current[0]).toEqual([7, 8]);
  });
});

describe('useRecipeCatalog', () => {
  beforeEach(() => mockGetAll.mockReset());

  it('loads the recipes', async () => {
    mockGetAll.mockResolvedValue(SAMPLE_RECIPES);
    const { result } = renderHook(() => useRecipeCatalog());
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.recipes).toHaveLength(3);
    expect(result.current.error).toBeNull();
  });

  it('reports an error, and reload(true) recovers', async () => {
    mockGetAll.mockRejectedValueOnce(new Error('Network Error'));
    const { result } = renderHook(() => useRecipeCatalog());
    await waitFor(() => expect(result.current.error).toBe('Network Error'));
    expect(result.current.recipes).toEqual([]);

    mockGetAll.mockResolvedValueOnce(SAMPLE_RECIPES);
    await act(async () => {
      await result.current.reload(true);
    });
    expect(mockGetAll).toHaveBeenLastCalledWith(true);
    expect(result.current.error).toBeNull();
    expect(result.current.recipes).toHaveLength(3);
  });
});
