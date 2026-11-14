/**
 * Favorites Context with useReducer
 *
 * - Stores favorite recipe IDs (newest first)
 * - Persists to AsyncStorage, one list per signed-in user
 * - Exposes isFavorite / toggleFavorite / removeFavorite / count for the
 *   favorites screen, heart buttons and the tab badge
 *
 * Must be rendered inside <AuthProvider>.
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/context/AuthContext';

const STORAGE_KEY_PREFIX = 'favorite_recipe_ids';

interface FavoritesState {
  ids: number[];
  /** Storage key the ids were loaded for (guards against writing one user's list to another) */
  loadedFor: string | null;
}

type FavoritesAction =
  | { type: 'LOADED'; key: string; ids: number[] }
  | { type: 'TOGGLE'; key: string; id: number }
  | { type: 'REMOVE'; key: string; id: number }
  | { type: 'CLEAR'; key: string };

function favoritesReducer(state: FavoritesState, action: FavoritesAction): FavoritesState {
  if (action.type === 'LOADED') {
    return { ids: action.ids, loadedFor: action.key };
  }

  // Ignore changes that arrive for a different user's list
  if (state.loadedFor !== action.key) return state;

  switch (action.type) {
    case 'TOGGLE':
      return {
        ...state,
        ids: state.ids.includes(action.id)
          ? state.ids.filter((id) => id !== action.id)
          : [action.id, ...state.ids],
      };
    case 'REMOVE':
      return { ...state, ids: state.ids.filter((id) => id !== action.id) };
    case 'CLEAR':
      return { ...state, ids: [] };
    default:
      return state;
  }
}

interface FavoritesContextType {
  ids: number[];
  count: number;
  /** False until the saved list has been read from AsyncStorage */
  isLoaded: boolean;
  isFavorite: (id: number) => boolean;
  toggleFavorite: (id: number) => void;
  removeFavorite: (id: number) => void;
  clearFavorites: () => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const storageKey = user ? `${STORAGE_KEY_PREFIX}:${user.id}` : null;

  const [state, dispatch] = useReducer(favoritesReducer, { ids: [], loadedFor: null });

  const isLoaded = storageKey === null || state.loadedFor === storageKey;
  const ids = useMemo(
    () => (state.loadedFor === storageKey ? state.ids : []),
    [state.ids, state.loadedFor, storageKey]
  );
  const idSet = useMemo(() => new Set(ids), [ids]);

  // Load the saved list whenever the signed-in user changes
  useEffect(() => {
    if (!storageKey) return;
    let cancelled = false;

    const load = async () => {
      let loaded: number[] = [];
      try {
        const raw = await AsyncStorage.getItem(storageKey);
        const parsed: unknown = raw ? JSON.parse(raw) : [];
        if (Array.isArray(parsed)) {
          loaded = parsed.filter((value): value is number => typeof value === 'number');
        }
      } catch (error) {
        console.warn('Failed to load favorites:', error);
      }
      if (!cancelled) dispatch({ type: 'LOADED', key: storageKey, ids: loaded });
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [storageKey]);

  // Persist changes (only once this user's list has been loaded)
  useEffect(() => {
    if (!storageKey || state.loadedFor !== storageKey) return;
    AsyncStorage.setItem(storageKey, JSON.stringify(state.ids)).catch((error) =>
      console.warn('Failed to save favorites:', error)
    );
  }, [state.ids, state.loadedFor, storageKey]);

  const isFavorite = useCallback((id: number) => idSet.has(id), [idSet]);

  const toggleFavorite = useCallback(
    (id: number) => {
      if (storageKey) dispatch({ type: 'TOGGLE', key: storageKey, id });
    },
    [storageKey]
  );

  const removeFavorite = useCallback(
    (id: number) => {
      if (storageKey) dispatch({ type: 'REMOVE', key: storageKey, id });
    },
    [storageKey]
  );

  const clearFavorites = useCallback(() => {
    if (storageKey) dispatch({ type: 'CLEAR', key: storageKey });
  }, [storageKey]);

  const value = useMemo<FavoritesContextType>(
    () => ({
      ids,
      count: ids.length,
      isLoaded,
      isFavorite,
      toggleFavorite,
      removeFavorite,
      clearFavorites,
    }),
    [ids, isLoaded, isFavorite, toggleFavorite, removeFavorite, clearFavorites]
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
