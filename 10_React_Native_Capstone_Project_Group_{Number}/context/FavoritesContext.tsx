import React, { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { favoritesStorage } from '@/utils/storage';

interface FavoritesContextValue {
  favoriteIds: number[];
  isLoading: boolean;
  isFavorite: (productId: number) => boolean;
  toggleFavorite: (productId: number) => Promise<boolean>;
}

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const favoriteIdsRef = useRef<number[]>([]);

  useEffect(() => {
    let active = true;
    favoritesStorage
      .getIds()
      .then((ids) => {
        if (active) {
          favoriteIdsRef.current = ids;
          setFavoriteIds(ids);
        }
      })
      .catch((error: unknown) => {
        console.error('Failed to load wishlist:', error);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const toggleFavorite = useCallback(async (productId: number) => {
    const current = favoriteIdsRef.current;
    const next = current.includes(productId)
      ? current.filter((id) => id !== productId)
      : [...current, productId];
    await favoritesStorage.setIds(next);
    favoriteIdsRef.current = next;
    setFavoriteIds(next);
    return next.includes(productId);
  }, []);

  const isFavorite = useCallback(
    (productId: number) => favoriteIds.includes(productId),
    [favoriteIds]
  );

  return (
    <FavoritesContext.Provider value={{ favoriteIds, isLoading, isFavorite, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites(): FavoritesContextValue {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error('useFavorites must be used within a FavoritesProvider');
  return context;
}
