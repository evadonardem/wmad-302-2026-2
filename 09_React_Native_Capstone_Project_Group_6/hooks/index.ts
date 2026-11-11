/**
 * Custom Hooks
 */

import { useState, useEffect, useCallback } from 'react';
import { getStorageItem, setStorageItem, StorageKey } from '@/utils/storage';

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
    [key, value]
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