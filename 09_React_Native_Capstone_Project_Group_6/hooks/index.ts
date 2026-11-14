/**
 * Custom Hooks
 */

import { useState, useEffect, useCallback } from 'react';
import { getStorageItem, setStorageItem, StorageKey } from '@/utils/storage';
import { recipeApi } from '@/services/recipeApi';
import { Recipe } from '@/types/recipe';

/**
 * Hook for async storage with state
 */
export function useAsyncStorage<T>(key: StorageKey, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const stored = await getStorageItem<T>(key);
        if (stored !== null) setValue(stored);
      } catch (error) {
        console.error(`Failed to load ${key}:`, error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [key]);

  const updateValue = useCallback(
    async (newValue: T | ((prev: T) => T)) => {
      const resolvedValue = newValue instanceof Function ? newValue(value) : newValue;
      setValue(resolvedValue);
      try {
        await setStorageItem(key, resolvedValue);
      } catch (error) {
        console.error(`Failed to save ${key}:`, error);
      }
    },
    [key, value],
  );

  return [value, updateValue, loading] as const;
}

/**
 * Hook for debounced values (used by Search in Phase 4)
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook that loads the whole recipe catalog (shared and cached by recipeApi).
 * Used by Search, Categories and Home.
 */
export function useRecipeCatalog() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    try {
      setRecipes(await recipeApi.getAllRecipes(forceRefresh));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recipes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { recipes, loading, error, reload: load };
}
