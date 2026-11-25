/**
 * Favorites Context (useReducer) - persisted to AsyncStorage
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  ReactNode,
} from 'react';
import { favoritesStorage } from '@/utils/storage';

export interface FavoritesState {
  ids: number[];
  hydrated: boolean;
}

export type FavoritesAction =
  | { type: 'FAVORITES_HYDRATE'; payload: number[] }
  | { type: 'FAVORITES_TOGGLE'; payload: number }
  | { type: 'FAVORITES_REMOVE'; payload: number }
  | { type: 'FAVORITES_CLEAR' };

export const initialFavoritesState: FavoritesState = { ids: [], hydrated: false };

export function favoritesReducer(state: FavoritesState, action: FavoritesAction): FavoritesState {
  switch (action.type) {
    case 'FAVORITES_HYDRATE':
      return { ids: action.payload, hydrated: true };
    case 'FAVORITES_TOGGLE':
      return {
        ...state,
        ids: state.ids.includes(action.payload)
          ? state.ids.filter((id) => id !== action.payload)
          : [...state.ids, action.payload],
      };
    case 'FAVORITES_REMOVE':
      return { ...state, ids: state.ids.filter((id) => id !== action.payload) };
    case 'FAVORITES_CLEAR':
      return { ...state, ids: [] };
    default:
      return state;
  }
}

interface FavoritesContextType {
  ids: number[];
  count: number;
  hydrated: boolean;
  isFavorite: (id: number) => boolean;
  toggleFavorite: (id: number) => void;
  removeFavorite: (id: number) => void;
  clearFavorites: () => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(favoritesReducer, initialFavoritesState);

  // Load persisted favorites once
  useEffect(() => {
    let cancelled = false;
    favoritesStorage
      .getIds()
      .then((ids) => {
        if (!cancelled) dispatch({ type: 'FAVORITES_HYDRATE', payload: ids });
      })
      .catch(() => {
        if (!cancelled) dispatch({ type: 'FAVORITES_HYDRATE', payload: [] });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Persist every change after hydration
  useEffect(() => {
    if (state.hydrated) {
      favoritesStorage.setIds(state.ids).catch(() => undefined);
    }
  }, [state.ids, state.hydrated]);

  const isFavorite = useCallback((id: number) => state.ids.includes(id), [state.ids]);
  const toggleFavorite = useCallback(
    (id: number) => dispatch({ type: 'FAVORITES_TOGGLE', payload: id }),
    []
  );
  const removeFavorite = useCallback(
    (id: number) => dispatch({ type: 'FAVORITES_REMOVE', payload: id }),
    []
  );
  const clearFavorites = useCallback(() => dispatch({ type: 'FAVORITES_CLEAR' }), []);

  const value = useMemo<FavoritesContextType>(
    () => ({
      ids: state.ids,
      count: state.ids.length,
      hydrated: state.hydrated,
      isFavorite,
      toggleFavorite,
      removeFavorite,
      clearFavorites,
    }),
    [state.ids, state.hydrated, isFavorite, toggleFavorite, removeFavorite, clearFavorites]
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites(): FavoritesContextType {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
