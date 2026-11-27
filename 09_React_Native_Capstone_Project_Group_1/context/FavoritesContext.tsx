/**
 * Favorites Context with useReducer
 * Keeps favorite recipe ids in memory and persists them with AsyncStorage (favoritesStorage).
 */

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import { favoritesStorage } from '@/utils/storage';

export interface FavoritesState {
  ids: number[];
  isLoading: boolean; // true until the saved ids are loaded from storage
}

export type FavoritesAction =
  | { type: 'FAVORITES_HYDRATE'; payload: number[] }
  | { type: 'FAVORITES_ADD'; payload: number }
  | { type: 'FAVORITES_REMOVE'; payload: number }
  | { type: 'FAVORITES_CLEAR' };

const initialState: FavoritesState = {
  ids: [],
  isLoading: true,
};

// Reducer (exported so it can be unit tested)
export function favoritesReducer(
  state: FavoritesState,
  action: FavoritesAction
): FavoritesState {
  switch (action.type) {
    case 'FAVORITES_HYDRATE':
      return { ids: action.payload, isLoading: false };

    case 'FAVORITES_ADD':
      if (state.ids.includes(action.payload)) return state;
      // Newest favorite first
      return { ...state, ids: [action.payload, ...state.ids] };

    case 'FAVORITES_REMOVE':
      return { ...state, ids: state.ids.filter((id) => id !== action.payload) };

    case 'FAVORITES_CLEAR':
      return { ...state, ids: [] };

    default:
      return state;
  }
}

// Context
interface FavoritesContextType {
  ids: number[];
  count: number;
  isLoading: boolean;
  isFavorite: (id: number) => boolean;
  toggleFavorite: (id: number) => void;
  removeFavorite: (id: number) => void;
  clearFavorites: () => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

// Provider
export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(favoritesReducer, initialState);

  // Load saved favorites on mount
  useEffect(() => {
    favoritesStorage
      .getIds()
      .then((ids) => dispatch({ type: 'FAVORITES_HYDRATE', payload: ids }))
      .catch(() => dispatch({ type: 'FAVORITES_HYDRATE', payload: [] }));
  }, []);

  // Save whenever the list changes (but not before the saved list has loaded)
  useEffect(() => {
    if (state.isLoading) return;
    favoritesStorage.setIds(state.ids).catch((error: unknown) => {
      console.error('Failed to save favorites:', error);
    });
  }, [state.ids, state.isLoading]);

  const isFavorite = useCallback((id: number) => state.ids.includes(id), [state.ids]);

  const toggleFavorite = useCallback(
    (id: number) => {
      dispatch({
        type: state.ids.includes(id) ? 'FAVORITES_REMOVE' : 'FAVORITES_ADD',
        payload: id,
      });
    },
    [state.ids]
  );

  const removeFavorite = useCallback((id: number) => {
    dispatch({ type: 'FAVORITES_REMOVE', payload: id });
  }, []);

  const clearFavorites = useCallback(() => {
    dispatch({ type: 'FAVORITES_CLEAR' });
  }, []);

  const value = useMemo(
    () => ({
      ids: state.ids,
      count: state.ids.length,
      isLoading: state.isLoading,
      isFavorite,
      toggleFavorite,
      removeFavorite,
      clearFavorites,
    }),
    [state.ids, state.isLoading, isFavorite, toggleFavorite, removeFavorite, clearFavorites]
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

// Hook
export function useFavorites(): FavoritesContextType {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}

export { FavoritesContext };