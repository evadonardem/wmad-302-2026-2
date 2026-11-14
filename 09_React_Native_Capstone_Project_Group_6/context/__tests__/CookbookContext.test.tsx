/* eslint-env jest */
import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CookbookProvider, useCookbook } from '@/context/CookbookContext';
import { cookbookReducer, initialCookbookState, CookbookState } from '@/context/cookbookReducer';

jest.mock('@react-native-async-storage/async-storage', () =>
  jest.requireActual('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

const loaded: CookbookState = { ...initialCookbookState, isLoading: false };

describe('cookbookReducer - collections', () => {
  it('HYDRATE loads data and stops loading', () => {
    const next = cookbookReducer(initialCookbookState, {
      type: 'COOKBOOK_HYDRATE',
      payload: {
        collections: [{ id: 'c', name: 'A', recipeIds: [] }],
        mealPlan: [],
        shopping: [],
        notes: {},
      },
    });
    expect(next.isLoading).toBe(false);
    expect(next.collections).toHaveLength(1);
  });

  it('creates a collection with a trimmed name', () => {
    const next = cookbookReducer(loaded, {
      type: 'COLLECTION_CREATE',
      payload: { id: 'c1', name: '  Weeknight   dinners ' },
    });
    expect(next.collections).toEqual([{ id: 'c1', name: 'Weeknight dinners', recipeIds: [] }]);
  });

  it('ignores an empty collection name', () => {
    const next = cookbookReducer(loaded, { type: 'COLLECTION_CREATE', payload: { id: 'c1', name: '   ' } });
    expect(next).toBe(loaded);
  });

  it('renames, adds and removes recipes, and deletes', () => {
    let s = cookbookReducer(loaded, { type: 'COLLECTION_CREATE', payload: { id: 'c1', name: 'A' } });
    s = cookbookReducer(s, { type: 'COLLECTION_RENAME', payload: { id: 'c1', name: 'B' } });
    expect(s.collections[0].name).toBe('B');
    s = cookbookReducer(s, { type: 'COLLECTION_ADD_RECIPE', payload: { id: 'c1', recipeId: 7 } });
    s = cookbookReducer(s, { type: 'COLLECTION_ADD_RECIPE', payload: { id: 'c1', recipeId: 7 } });
    expect(s.collections[0].recipeIds).toEqual([7]);
    s = cookbookReducer(s, { type: 'COLLECTION_REMOVE_RECIPE', payload: { id: 'c1', recipeId: 7 } });
    expect(s.collections[0].recipeIds).toEqual([]);
    s = cookbookReducer(s, { type: 'COLLECTION_DELETE', payload: 'c1' });
    expect(s.collections).toEqual([]);
  });
});

describe('cookbookReducer - meal plan', () => {
  const meal = { id: 'm1', date: '2026-11-11', slot: 'Dinner' as const, recipeId: 1 };

  it('adds a meal and ignores an exact duplicate', () => {
    const once = cookbookReducer(loaded, { type: 'PLAN_ADD', payload: meal });
    expect(once.mealPlan).toHaveLength(1);
    const twice = cookbookReducer(once, { type: 'PLAN_ADD', payload: { ...meal, id: 'm2' } });
    expect(twice).toBe(once);
  });

  it('allows two different recipes in the same slot', () => {
    const a = cookbookReducer(loaded, { type: 'PLAN_ADD', payload: meal });
    const b = cookbookReducer(a, { type: 'PLAN_ADD', payload: { ...meal, id: 'm2', recipeId: 2 } });
    expect(b.mealPlan).toHaveLength(2);
  });

  it('removes one meal and clears whole days', () => {
    let s = cookbookReducer(loaded, { type: 'PLAN_ADD', payload: meal });
    s = cookbookReducer(s, { type: 'PLAN_ADD', payload: { ...meal, id: 'm2', date: '2026-11-12' } });
    s = cookbookReducer(s, { type: 'PLAN_REMOVE', payload: 'm1' });
    expect(s.mealPlan.map((m) => m.id)).toEqual(['m2']);
    s = cookbookReducer(s, { type: 'PLAN_CLEAR_DATES', payload: ['2026-11-12'] });
    expect(s.mealPlan).toEqual([]);
  });
});

describe('cookbookReducer - shopping list', () => {
  it('adds recipe ingredients without duplicates', () => {
    const s = cookbookReducer(loaded, {
      type: 'SHOPPING_ADD_RECIPES',
      payload: [
        { id: 1, ingredients: ['Flour', 'Salt'] },
        { id: 2, ingredients: ['salt'] },
      ],
    });
    expect(s.shopping.map((i) => i.name)).toEqual(['Flour', 'Salt']);
  });

  it('adds a manual item once', () => {
    let s = cookbookReducer(loaded, { type: 'SHOPPING_ADD_ITEM', payload: { id: 'i1', name: 'Milk' } });
    s = cookbookReducer(s, { type: 'SHOPPING_ADD_ITEM', payload: { id: 'i2', name: 'milk' } });
    expect(s.shopping).toHaveLength(1);
  });

  it('ignores a blank manual item', () => {
    const s = cookbookReducer(loaded, { type: 'SHOPPING_ADD_ITEM', payload: { id: 'i1', name: ' ' } });
    expect(s).toBe(loaded);
  });

  it('toggles, removes, clears checked and clears all', () => {
    let s = cookbookReducer(loaded, {
      type: 'SHOPPING_ADD_RECIPES',
      payload: [{ id: 1, ingredients: ['A', 'B', 'C'] }],
    });
    s = cookbookReducer(s, { type: 'SHOPPING_TOGGLE', payload: 'ing-a' });
    expect(s.shopping[0].checked).toBe(true);
    s = cookbookReducer(s, { type: 'SHOPPING_CLEAR_CHECKED' });
    expect(s.shopping.map((i) => i.name)).toEqual(['B', 'C']);
    s = cookbookReducer(s, { type: 'SHOPPING_REMOVE', payload: 'ing-b' });
    expect(s.shopping.map((i) => i.name)).toEqual(['C']);
    s = cookbookReducer(s, { type: 'SHOPPING_CLEAR' });
    expect(s.shopping).toEqual([]);
  });
});

describe('cookbookReducer - notes', () => {
  it('saves a trimmed note for a recipe', () => {
    const s = cookbookReducer(loaded, { type: 'NOTE_SET', payload: { recipeId: 5, text: '  Less salt  ' } });
    expect(s.notes).toEqual({ 5: 'Less salt' });
  });

  it('replaces an existing note', () => {
    let s = cookbookReducer(loaded, { type: 'NOTE_SET', payload: { recipeId: 5, text: 'a' } });
    s = cookbookReducer(s, { type: 'NOTE_SET', payload: { recipeId: 5, text: 'b' } });
    expect(s.notes).toEqual({ 5: 'b' });
  });

  it('an empty note deletes it and leaves other notes alone', () => {
    let s = cookbookReducer(loaded, { type: 'NOTE_SET', payload: { recipeId: 5, text: 'a' } });
    s = cookbookReducer(s, { type: 'NOTE_SET', payload: { recipeId: 6, text: 'b' } });
    s = cookbookReducer(s, { type: 'NOTE_SET', payload: { recipeId: 5, text: '   ' } });
    expect(s.notes).toEqual({ 6: 'b' });
  });

  it('does not change the previous state object', () => {
    const before = { ...loaded, notes: { 1: 'x' } };
    cookbookReducer(before, { type: 'NOTE_SET', payload: { recipeId: 1, text: '' } });
    expect(before.notes).toEqual({ 1: 'x' });
  });
});

describe('CookbookProvider / useCookbook', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <CookbookProvider>{children}</CookbookProvider>
  );

  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('throws outside the provider', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => renderHook(() => useCookbook())).toThrow(/CookbookProvider/);
    spy.mockRestore();
  });

  it('starts empty and finishes loading', async () => {
    const { result } = renderHook(() => useCookbook(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.collections).toEqual([]);
  });

  it('creates a collection, fills it and saves to storage', async () => {
    const { result } = renderHook(() => useCookbook(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    let id = '';
    act(() => {
      id = result.current.createCollection('Favorites of May');
    });
    act(() => result.current.addToCollection(id, 4));
    expect(result.current.collectionsContaining(4)).toHaveLength(1);
    await waitFor(async () => {
      const saved = JSON.parse((await AsyncStorage.getItem('cookbook_collections')) as string);
      expect(saved[0].recipeIds).toEqual([4]);
    });
  });

  it('restores saved data on the next start', async () => {
    await AsyncStorage.setItem(
      'cookbook_shopping',
      JSON.stringify([{ id: 'i', name: 'Rice', checked: false, recipeIds: [] }])
    );
    const { result } = renderHook(() => useCookbook(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.shopping[0].name).toBe('Rice');
  });

  it('saves a note and writes it to storage', async () => {
    const { result } = renderHook(() => useCookbook(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    act(() => result.current.setNote(3, 'Used oat milk'));
    expect(result.current.notes[3]).toBe('Used oat milk');
    await waitFor(async () => {
      const saved = JSON.parse((await AsyncStorage.getItem('cookbook_notes')) as string);
      expect(saved[3]).toBe('Used oat milk');
    });
  });

  it('plans a meal and adds recipe ingredients to the list', async () => {
    const { result } = renderHook(() => useCookbook(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    act(() => result.current.planMeal('2026-11-11', 'Lunch', 9));
    expect(result.current.mealPlan[0]).toMatchObject({ date: '2026-11-11', slot: 'Lunch', recipeId: 9 });
    act(() => result.current.addRecipesToShopping([{ id: 9, ingredients: ['Beef'] }]));
    expect(result.current.shopping[0].name).toBe('Beef');
  });
});
