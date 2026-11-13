/* eslint-env jest */
import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FavoritesProvider, favoritesReducer, useFavorites } from '@/context/FavoritesContext';
import { favoritesStorage } from '@/utils/storage';

jest.mock('@react-native-async-storage/async-storage', () =>
  jest.requireActual('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

describe('favoritesReducer', () => {
  const state = { ids: [1, 2], isLoading: false };

  it('HYDRATE replaces ids and stops loading', () => {
    expect(
      favoritesReducer({ ids: [], isLoading: true }, { type: 'FAVORITES_HYDRATE', payload: [4] }),
    ).toEqual({
      ids: [4],
      isLoading: false,
    });
  });

  it('ADD appends a new id', () => {
    expect(favoritesReducer(state, { type: 'FAVORITES_ADD', payload: 3 }).ids).toEqual([1, 2, 3]);
  });

  it('ADD ignores a duplicate (same state returned)', () => {
    expect(favoritesReducer(state, { type: 'FAVORITES_ADD', payload: 1 })).toBe(state);
  });

  it('REMOVE deletes an id', () => {
    expect(favoritesReducer(state, { type: 'FAVORITES_REMOVE', payload: 1 }).ids).toEqual([2]);
  });

  it('CLEAR empties the list', () => {
    expect(favoritesReducer(state, { type: 'FAVORITES_CLEAR' }).ids).toEqual([]);
  });
});

describe('FavoritesProvider / useFavorites', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <FavoritesProvider>{children}</FavoritesProvider>
  );

  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('throws outside the provider', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => renderHook(() => useFavorites())).toThrow();
    spy.mockRestore();
  });

  it('loads saved favorites', async () => {
    await favoritesStorage.setIds([10, 20]);
    const { result } = renderHook(() => useFavorites(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.ids).toEqual([10, 20]);
    expect(result.current.count).toBe(2);
    expect(result.current.isFavorite(10)).toBe(true);
    expect(result.current.isFavorite(99)).toBe(false);
  });

  it('toggleFavorite adds and removes, and the list is saved', async () => {
    const { result } = renderHook(() => useFavorites(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.toggleFavorite(5));
    expect(result.current.isFavorite(5)).toBe(true);
    await waitFor(async () => expect(await favoritesStorage.getIds()).toEqual([5]));

    act(() => result.current.toggleFavorite(5));
    expect(result.current.isFavorite(5)).toBe(false);
    await waitFor(async () => expect(await favoritesStorage.getIds()).toEqual([]));
  });

  it('removeFavorite and clearFavorites work', async () => {
    await favoritesStorage.setIds([1, 2, 3]);
    const { result } = renderHook(() => useFavorites(), { wrapper });
    await waitFor(() => expect(result.current.count).toBe(3));

    act(() => result.current.removeFavorite(2));
    expect(result.current.ids).toEqual([1, 3]);

    act(() => result.current.clearFavorites());
    expect(result.current.count).toBe(0);
  });
});
