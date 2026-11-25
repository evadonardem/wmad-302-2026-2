/**
 * Custom Hooks
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import { recipeApi } from '@/services/recipeApi';
import { getErrorMessage } from '@/services/authApi';
import { getStorageItem, setStorageItem, StorageKey } from '@/utils/storage';
import type { Recipe } from '@/types/recipe';

/**
 * Hook for async storage with state
 */
export function useAsyncStorage<T>(key: StorageKey, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getStorageItem<T>(key)
      .then((stored) => {
        if (!cancelled && stored !== null) setValue(stored);
      })
      .catch((error: unknown) => console.error(`Failed to load ${key}:`, error))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [key]);

  const updateValue = useCallback(
    async (newValue: T | ((prev: T) => T)) => {
      const resolved = newValue instanceof Function ? newValue(value) : newValue;
      setValue(resolved);
      try {
        await setStorageItem(key, resolved);
      } catch (error) {
        console.error(`Failed to save ${key}:`, error);
      }
    },
    [key, value]
  );

  return [value, updateValue, loading] as const;
}

/**
 * Hook for debounced values (used by the search box)
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

export interface PageResult<T> {
  items: T[];
  total: number;
}

/**
 * Hook for infinite scroll pagination (skip/limit based).
 * Exposes separate flags for first load, load-more and pull-to-refresh.
 */
export function useInfiniteScroll<T>(
  fetchPage: (skip: number, limit: number) => Promise<PageResult<T>>,
  pageSize: number = 10
) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Refs avoid stale closures inside onEndReached callbacks
  const skipRef = useRef(0);
  const busyRef = useRef(false);
  const fetchRef = useRef(fetchPage);
  fetchRef.current = fetchPage;

  const load = useCallback(
    async (mode: 'initial' | 'more' | 'refresh') => {
      if (busyRef.current) return;
      busyRef.current = true;
      if (mode === 'more') setLoadingMore(true);
      if (mode === 'refresh') setRefreshing(true);
      if (mode === 'initial') setLoading(true);
      setError(null);

      try {
        const skip = mode === 'more' ? skipRef.current : 0;
        const result = await fetchRef.current(skip, pageSize);
        skipRef.current = skip + result.items.length;
        setItems((prev) => (mode === 'more' ? [...prev, ...result.items] : result.items));
        setHasMore(skipRef.current < result.total && result.items.length > 0);
      } catch (err) {
        setError(getErrorMessage(err, 'Failed to load recipes'));
      } finally {
        busyRef.current = false;
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    },
    [pageSize]
  );

  useEffect(() => {
    load('initial');
  }, [load]);

  const loadMore = useCallback(() => {
    if (hasMore && !error) load('more');
  }, [hasMore, error, load]);
  const refresh = useCallback(() => load('refresh'), [load]);
  const retry = useCallback(() => load(items.length === 0 ? 'initial' : 'more'), [load, items.length]);

  return { items, loading, loadingMore, refreshing, hasMore, error, loadMore, refresh, retry };
}

/**
 * Load one recipe by id (used by the detail screen)
 */
export function useRecipe(id: number | null) {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (id === null || Number.isNaN(id)) {
      setError('Invalid recipe');
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    recipeApi
      .getRecipeById(id)
      .then((data) => {
        if (!cancelled) setRecipe(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(getErrorMessage(err, 'Failed to load recipe'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  return { recipe, loading, error, retry };
}

/**
 * Load the full (cached) recipe list - used by favorites, categories, stats
 */
export function useAllRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (force = false) => {
    setError(null);
    try {
      setRecipes(await recipeApi.getAllRecipes(force));
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load recipes'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { recipes, loading, error, reload: () => load(true) };
}

/**
 * Hook for network status (browser events on web; assumed online on native)
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
