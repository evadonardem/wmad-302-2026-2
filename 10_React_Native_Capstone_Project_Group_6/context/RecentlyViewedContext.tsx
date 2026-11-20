/**
 * Recently Viewed Context - the products a person opened lately (shown on Home)
 * Same pattern as WishlistContext: useReducer + AsyncStorage, one history per account.
 * The reducer and helpers live in utils/recentlyViewed.ts.
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
import { useAuth } from '@/context/AuthContext';
import type { Product } from '@/types/product';
import { recentlyViewedStorage } from '@/utils/recentlyViewedStorage';
import {
  initialRecentlyViewedState,
  recentlyViewedReducer,
  type RecentlyViewedItem,
} from '@/utils/recentlyViewed';

interface RecentlyViewedContextType {
  items: RecentlyViewedItem[]; // newest first
  isHydrated: boolean;
  /** Call when a product page opens: moves the product to the front of the history */
  trackView: (product: RecentlyViewedItem | Product) => void;
  removeRecentlyViewed: (productId: number) => void;
  clearRecentlyViewed: () => void;
}

const RecentlyViewedContext = createContext<RecentlyViewedContextType | undefined>(undefined);

export function RecentlyViewedProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(recentlyViewedReducer, initialRecentlyViewedState);
  const { user } = useAuth();
  const owner = user?.username ?? null;
  // Which account's history is loaded: stops one account's views being saved under another
  const loadedOwner = useRef<string | null>(null);

  // Load the history of whoever is logged in (again when the account changes)
  useEffect(() => {
    let cancelled = false;
    loadedOwner.current = null;
    dispatch({ type: 'RECENT_RESET' });
    if (!owner) return;

    recentlyViewedStorage
      .get(owner)
      .then((saved) => {
        if (cancelled) return;
        loadedOwner.current = owner;
        dispatch({ type: 'RECENT_HYDRATE', payload: saved });
      })
      .catch(() => {
        if (cancelled) return;
        loadedOwner.current = owner;
        dispatch({ type: 'RECENT_HYDRATE', payload: [] }); // start empty rather than never tracking
      });
    return () => {
      cancelled = true;
    };
  }, [owner]);

  // Save whenever the history changes (only once THIS account's history has been loaded)
  useEffect(() => {
    if (!owner || loadedOwner.current !== owner || !state.isHydrated) return;
    recentlyViewedStorage.set(owner, state.items).catch((error: unknown) => {
      console.error('Failed to save recently viewed:', error);
    });
  }, [state.items, state.isHydrated, owner]);

  const trackView = useCallback((product: RecentlyViewedItem | Product) => {
    dispatch({ type: 'RECENT_VIEW', payload: product });
  }, []);

  const removeRecentlyViewed = useCallback((productId: number) => {
    dispatch({ type: 'RECENT_REMOVE', payload: productId });
  }, []);

  const clearRecentlyViewed = useCallback(() => {
    dispatch({ type: 'RECENT_CLEAR' });
  }, []);

  const value = useMemo<RecentlyViewedContextType>(
    () => ({
      items: state.items,
      isHydrated: state.isHydrated,
      trackView,
      removeRecentlyViewed,
      clearRecentlyViewed,
    }),
    [state.items, state.isHydrated, trackView, removeRecentlyViewed, clearRecentlyViewed]
  );

  return <RecentlyViewedContext.Provider value={value}>{children}</RecentlyViewedContext.Provider>;
}

export function useRecentlyViewed(): RecentlyViewedContextType {
  const context = useContext(RecentlyViewedContext);
  if (context === undefined) {
    throw new Error('useRecentlyViewed must be used within a RecentlyViewedProvider');
  }
  return context;
}

export { RecentlyViewedContext };
