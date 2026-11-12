/**
 * Favorites Context with useReducer
 * Keeps the list of favorite recipe IDs in memory and saves it to AsyncStorage
 * so it survives reloads. Only IDs are stored; recipe details are fetched when
 * needed (see the Favorites screen).
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

interface FavoritesState {
    ids: number[]; // oldest first
    isLoading: boolean; // true until the saved list has been read
}

type FavoritesAction =
    | { type: 'FAVORITES_HYDRATE'; payload: number[] }
    | { type: 'FAVORITES_ADD'; payload: number }
    | { type: 'FAVORITES_REMOVE'; payload: number }
    | { type: 'FAVORITES_CLEAR' };

const initialState: FavoritesState = { ids: [], isLoading: true };

// Exported so it can be unit-tested
export function favoritesReducer(state: FavoritesState, action: FavoritesAction): FavoritesState {
    switch (action.type) {
        case 'FAVORITES_HYDRATE':
            return { ids: action.payload, isLoading: false };

        case 'FAVORITES_ADD':
            if (state.ids.includes(action.payload)) return state;
            return { ...state, ids: [...state.ids, action.payload] };

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
    isLoading: boolean;
    isFavorite: (id: number) => boolean;
    toggleFavorite: (id: number) => void;
    removeFavorite: (id: number) => void;
    clearFavorites: () => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(favoritesReducer, initialState);

    // Load the saved list once when the app starts
    useEffect(() => {
        let active = true;
        favoritesStorage
            .getIds()
            .then((ids) => {
                if (active) dispatch({ type: 'FAVORITES_HYDRATE', payload: ids });
            })
            .catch(() => {
                if (active) dispatch({ type: 'FAVORITES_HYDRATE', payload: [] });
            });
        return () => {
            active = false;
        };
    }, []);

    // Save every change (but not before the first load finishes, or we'd
    // overwrite the saved list with an empty one)
    useEffect(() => {
        if (state.isLoading) return;
        favoritesStorage.setIds(state.ids).catch((error: unknown) => {
            console.error('Failed to save favorites:', error);
        });
    }, [state.ids, state.isLoading]);

    const isFavorite = useCallback((id: number) => state.ids.includes(id), [state.ids]);

    const toggleFavorite = useCallback(
        (id: number) => {
            dispatch({ type: state.ids.includes(id) ? 'FAVORITES_REMOVE' : 'FAVORITES_ADD', payload: id });
        },
        [state.ids]
    );

    const removeFavorite = useCallback((id: number) => {
        dispatch({ type: 'FAVORITES_REMOVE', payload: id });
    }, []);

    const clearFavorites = useCallback(() => {
        dispatch({ type: 'FAVORITES_CLEAR' });
    }, []);

    const value = useMemo<FavoritesContextType>(
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

export function useFavorites(): FavoritesContextType {
    const context = useContext(FavoritesContext);
    if (context === undefined) {
        throw new Error('useFavorites must be used within a FavoritesProvider');
    }
    return context;
}