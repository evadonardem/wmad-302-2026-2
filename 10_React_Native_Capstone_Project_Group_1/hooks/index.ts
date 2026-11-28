/**
 * Custom Hooks
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import { StorageKey, getStorageItem, setStorageItem } from '@/utils/storage';
import { getErrorMessage } from '@/utils/errors';

/** Hook for a JSON value persisted in AsyncStorage. */
export function useAsyncStorage<T>(key: StorageKey, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getStorageItem<T>(key)
      .then((stored) => {
        if (!cancelled && stored !== null) setValue(stored);
      })
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

/** Hook for debounced values (used by the search box). */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

export interface PageResult<T> {
  data: T[];
  hasMore: boolean;
}

/**
 * Hook for infinite scroll pagination.
 * `fetchFn(page, limit)` receives a zero-based page index.
 */
export function useInfiniteScroll<T>(
  fetchFn: (page: number, limit: number) => Promise<PageResult<T>>,
  limit: number = 20
) {
  const [data, setData] = useState<T[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Refs keep the callbacks stable and free of stale state
  const fetchRef = useRef(fetchFn);
  fetchRef.current = fetchFn;
  const pageRef = useRef(0);
  const hasMoreRef = useRef(true);
  const busyRef = useRef(false);
  const requestIdRef = useRef(0);

  const loadPage = useCallback(
    async (reset: boolean) => {
      if (!reset && (busyRef.current || !hasMoreRef.current)) return;

      const requestId = ++requestIdRef.current;
      busyRef.current = true;
      if (!reset) setLoadingMore(true);
      setError(null);

      try {
        const page = reset ? 0 : pageRef.current;
        const result = await fetchRef.current(page, limit);
        if (requestId !== requestIdRef.current) return; // a newer request replaced this one

        setData((prev) => (reset ? result.data : [...prev, ...result.data]));
        hasMoreRef.current = result.hasMore;
        setHasMore(result.hasMore);
        pageRef.current = page + 1;
      } catch (err) {
        if (requestId !== requestIdRef.current) return;
        setError(getErrorMessage(err, 'Failed to load products'));
      } finally {
        if (requestId === requestIdRef.current) {
          busyRef.current = false;
          setInitialLoading(false);
          setLoadingMore(false);
          setRefreshing(false);
        }
      }
    },
    [limit]
  );

  useEffect(() => {
    loadPage(true);
  }, [loadPage]);

  const loadMore = useCallback(() => loadPage(false), [loadPage]);

  /** Pull-to-refresh: keeps the current list visible while reloading. */
  const refresh = useCallback(() => {
    setRefreshing(true);
    return loadPage(true);
  }, [loadPage]);

  /** Retry after a full-screen error. */
  const retry = useCallback(() => {
    setInitialLoading(true);
    return loadPage(true);
  }, [loadPage]);

  return { data, initialLoading, loadingMore, refreshing, hasMore, error, loadMore, refresh, retry };
}

/** Hook for network status (web only - native platforms report "online"). */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined' || !window.addEventListener) return;

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
