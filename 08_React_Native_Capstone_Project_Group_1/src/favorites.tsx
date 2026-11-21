import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Photo } from '@/services/geoPhotoService';

// Favorite photos are kept in memory for the screens and saved on the device,
// so they are still there the next time the app opens.
const STORAGE_KEY = 'lakbay_favorites';

type FavoritesValue = {
  favorites: Photo[];
  isFavorite: (id: number) => boolean;
  toggleFavorite: (photo: Photo) => void;
};

const FavoritesContext = createContext<FavoritesValue>({
  favorites: [],
  isFavorite: () => false,
  toggleFavorite: () => {},
});

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<Photo[]>([]);

  // Load the saved favorites once when the app starts.
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setFavorites(JSON.parse(raw));
      })
      .catch(() => {
        // Nothing saved yet, or storage is unavailable: start with an empty list.
      });
  }, []);

  const isFavorite = (id: number) => favorites.some((p) => p.id === id);

  const toggleFavorite = (photo: Photo) => {
    const next = isFavorite(photo.id)
      ? favorites.filter((p) => p.id !== photo.id)
      : [photo, ...favorites];
    setFavorites(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {
      // The list still works in memory if saving fails.
    });
  };

  return (
    <FavoritesContext.Provider value={{ favorites, isFavorite, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export const useFavorites = () => useContext(FavoritesContext);