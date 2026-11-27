/**
 * Integration tests - favorites flow
 * Real FavoritesProvider + AsyncStorage mock: adding, removing and restoring favorites.
 */
import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { FavoritesProvider, useFavorites } from '@/context/FavoritesContext';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <FavoritesProvider>{children}</FavoritesProvider>
);

const readSaved = async () =>
  JSON.parse((await AsyncStorage.getItem('favorite_recipe_ids')) ?? 'null');

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('favorites flow', () => {
  it('starts empty and stops loading', async () => {
    const { result } = renderHook(() => useFavorites(), { wrapper });
    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.ids).toEqual([]);
    expect(result.current.count).toBe(0);
  });

  it('loads saved favorites on start', async () => {
    await AsyncStorage.setItem('favorite_recipe_ids', JSON.stringify([4, 2]));
    const { result } = renderHook(() => useFavorites(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.ids).toEqual([4, 2]);
    expect(result.current.count).toBe(2);
    expect(result.current.isFavorite(4)).toBe(true);
    expect(result.current.isFavorite(9)).toBe(false);
  });

  it('toggle adds then removes a favorite and saves each change', async () => {
    const { result } = renderHook(() => useFavorites(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.toggleFavorite(7));
    expect(result.current.isFavorite(7)).toBe(true);
    expect(result.current.count).toBe(1);
    await waitFor(async () => expect(await readSaved()).toEqual([7]));

    act(() => result.current.toggleFavorite(7));
    expect(result.current.isFavorite(7)).toBe(false);
    await waitFor(async () => expect(await readSaved()).toEqual([]));
  });

  it('keeps favorites after the app restarts', async () => {
    const first = renderHook(() => useFavorites(), { wrapper });
    await waitFor(() => expect(first.result.current.isLoading).toBe(false));
    act(() => first.result.current.toggleFavorite(1));
    act(() => first.result.current.toggleFavorite(2));
    await waitFor(async () => expect(await readSaved()).toEqual([2, 1]));
    first.unmount();

    const second = renderHook(() => useFavorites(), { wrapper });
    await waitFor(() => expect(second.result.current.isLoading).toBe(false));
    expect(second.result.current.ids).toEqual([2, 1]);
  });

  it('removeFavorite and clearFavorites update the saved list', async () => {
    await AsyncStorage.setItem('favorite_recipe_ids', JSON.stringify([1, 2, 3]));
    const { result } = renderHook(() => useFavorites(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.removeFavorite(2));
    await waitFor(async () => expect(await readSaved()).toEqual([1, 3]));

    act(() => result.current.clearFavorites());
    expect(result.current.count).toBe(0);
    await waitFor(async () => expect(await readSaved()).toEqual([]));
  });

  it('does not wipe saved favorites while they are still loading', async () => {
    await AsyncStorage.setItem('favorite_recipe_ids', JSON.stringify([5]));
    const { result } = renderHook(() => useFavorites(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.ids).toEqual([5]);
    // The empty starting list was never written over the saved one
    await waitFor(async () => expect(await readSaved()).toEqual([5]));
  });

  it('throws outside of the provider', () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => renderHook(() => useFavorites())).toThrow(
      'useFavorites must be used within a FavoritesProvider'
    );
    jest.restoreAllMocks();
  });
});