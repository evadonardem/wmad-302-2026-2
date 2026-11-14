/**
 * Cookbook Context
 * Holds the user's collections, weekly meal plan and shopping list and saves
 * them to AsyncStorage (same pattern as FavoritesContext).
 * The reducer lives in cookbookReducer.ts so it can be tested without React.
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  ReactNode,
} from 'react';
import { cookbookStorage } from '@/utils/storage';
import type {
  Collection,
  MealSlot,
  PlannedMeal,
  RecipeNotes,
  ShoppingItem,
} from '@/types/cookbook';
import { cookbookReducer, initialCookbookState } from '@/context/cookbookReducer';

interface CookbookContextType {
  isLoading: boolean;
  collections: Collection[];
  mealPlan: PlannedMeal[];
  shopping: ShoppingItem[];
  notes: RecipeNotes;

  createCollection: (name: string) => string; // returns the new id
  renameCollection: (id: string, name: string) => void;
  deleteCollection: (id: string) => void;
  addToCollection: (collectionId: string, recipeId: number) => void;
  removeFromCollection: (collectionId: string, recipeId: number) => void;
  collectionsContaining: (recipeId: number) => Collection[];

  planMeal: (date: string, slot: MealSlot, recipeId: number) => void;
  unplanMeal: (id: string) => void;
  clearPlanDates: (dates: string[]) => void;

  addRecipesToShopping: (recipes: { id: number; ingredients: string[] }[]) => void;
  addShoppingItem: (name: string) => void;
  toggleShoppingItem: (id: string) => void;
  removeShoppingItem: (id: string) => void;
  clearCheckedShopping: () => void;
  clearShopping: () => void;

  /** Save a personal note for a recipe (empty text deletes it) */
  setNote: (recipeId: number, text: string) => void;
}

const CookbookContext = createContext<CookbookContextType | undefined>(undefined);

export function CookbookProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cookbookReducer, initialCookbookState);
  const counter = useRef(0);

  // Unique-enough ids for items created on this device
  const newId = useCallback((prefix: string) => {
    counter.current += 1;
    return `${prefix}-${Date.now().toString(36)}-${counter.current}`;
  }, []);

  // Load saved data once at start
  useEffect(() => {
    let active = true;
    cookbookStorage
      .load()
      .then((data) => {
        if (active) dispatch({ type: 'COOKBOOK_HYDRATE', payload: data });
      })
      .catch(() => {
        if (active)
          dispatch({
            type: 'COOKBOOK_HYDRATE',
            payload: { collections: [], mealPlan: [], shopping: [], notes: {} },
          });
      });
    return () => {
      active = false;
    };
  }, []);

  // Save each list when it changes (not before the first load finishes)
  useEffect(() => {
    if (state.isLoading) return;
    cookbookStorage.saveCollections(state.collections).catch(() => undefined);
  }, [state.collections, state.isLoading]);
  useEffect(() => {
    if (state.isLoading) return;
    cookbookStorage.saveMealPlan(state.mealPlan).catch(() => undefined);
  }, [state.mealPlan, state.isLoading]);
  useEffect(() => {
    if (state.isLoading) return;
    cookbookStorage.saveShopping(state.shopping).catch(() => undefined);
  }, [state.shopping, state.isLoading]);

  useEffect(() => {
    if (state.isLoading) return;
    cookbookStorage.saveNotes(state.notes).catch(() => undefined);
  }, [state.notes, state.isLoading]);

  const createCollection = useCallback(
    (name: string) => {
      const id = newId('col');
      dispatch({ type: 'COLLECTION_CREATE', payload: { id, name } });
      return id;
    },
    [newId]
  );
  const renameCollection = useCallback((id: string, name: string) => {
    dispatch({ type: 'COLLECTION_RENAME', payload: { id, name } });
  }, []);
  const deleteCollection = useCallback((id: string) => {
    dispatch({ type: 'COLLECTION_DELETE', payload: id });
  }, []);
  const addToCollection = useCallback((id: string, recipeId: number) => {
    dispatch({ type: 'COLLECTION_ADD_RECIPE', payload: { id, recipeId } });
  }, []);
  const removeFromCollection = useCallback((id: string, recipeId: number) => {
    dispatch({ type: 'COLLECTION_REMOVE_RECIPE', payload: { id, recipeId } });
  }, []);
  const collectionsContaining = useCallback(
    (recipeId: number) => state.collections.filter((c) => c.recipeIds.includes(recipeId)),
    [state.collections]
  );

  const planMeal = useCallback(
    (date: string, slot: MealSlot, recipeId: number) => {
      dispatch({ type: 'PLAN_ADD', payload: { id: newId('meal'), date, slot, recipeId } });
    },
    [newId]
  );
  const unplanMeal = useCallback((id: string) => dispatch({ type: 'PLAN_REMOVE', payload: id }), []);
  const clearPlanDates = useCallback(
    (dates: string[]) => dispatch({ type: 'PLAN_CLEAR_DATES', payload: dates }),
    []
  );

  const addRecipesToShopping = useCallback(
    (recipes: { id: number; ingredients: string[] }[]) =>
      dispatch({ type: 'SHOPPING_ADD_RECIPES', payload: recipes }),
    []
  );
  const addShoppingItem = useCallback(
    (name: string) => dispatch({ type: 'SHOPPING_ADD_ITEM', payload: { id: newId('item'), name } }),
    [newId]
  );
  const toggleShoppingItem = useCallback(
    (id: string) => dispatch({ type: 'SHOPPING_TOGGLE', payload: id }),
    []
  );
  const removeShoppingItem = useCallback(
    (id: string) => dispatch({ type: 'SHOPPING_REMOVE', payload: id }),
    []
  );
  const clearCheckedShopping = useCallback(() => dispatch({ type: 'SHOPPING_CLEAR_CHECKED' }), []);
  const clearShopping = useCallback(() => dispatch({ type: 'SHOPPING_CLEAR' }), []);

  const setNote = useCallback(
    (recipeId: number, text: string) => dispatch({ type: 'NOTE_SET', payload: { recipeId, text } }),
    []
  );

  const value = useMemo<CookbookContextType>(
    () => ({
      isLoading: state.isLoading,
      collections: state.collections,
      mealPlan: state.mealPlan,
      shopping: state.shopping,
      notes: state.notes,
      createCollection,
      renameCollection,
      deleteCollection,
      addToCollection,
      removeFromCollection,
      collectionsContaining,
      planMeal,
      unplanMeal,
      clearPlanDates,
      addRecipesToShopping,
      addShoppingItem,
      toggleShoppingItem,
      removeShoppingItem,
      clearCheckedShopping,
      clearShopping,
      setNote,
    }),
    [
      state,
      createCollection,
      renameCollection,
      deleteCollection,
      addToCollection,
      removeFromCollection,
      collectionsContaining,
      planMeal,
      unplanMeal,
      clearPlanDates,
      addRecipesToShopping,
      addShoppingItem,
      toggleShoppingItem,
      removeShoppingItem,
      clearCheckedShopping,
      clearShopping,
      setNote,
    ]
  );

  return <CookbookContext.Provider value={value}>{children}</CookbookContext.Provider>;
}

export function useCookbook(): CookbookContextType {
  const context = useContext(CookbookContext);
  if (context === undefined) {
    throw new Error('useCookbook must be used within a CookbookProvider');
  }
  return context;
}
