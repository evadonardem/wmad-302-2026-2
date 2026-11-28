/**
 * useReducer that loads its state from AsyncStorage on mount and saves it
 * whenever it changes (after hydration). Used by Cart / Orders / Address contexts.
 */
import { Dispatch, useEffect, useReducer } from 'react';
import { StorageKey, getStorageItem, setStorageItem } from '@/utils/storage';

interface PersistOptions<S, A, T> {
  storageKey: StorageKey;
  /** Value used when nothing has been stored yet */
  emptyValue: T;
  /** Builds the action that loads the stored value into state */
  toHydrateAction: (stored: T) => A;
  /** Picks the part of the state that is saved */
  selectPersisted: (state: S) => T;
}

export function usePersistedReducer<S extends { isHydrated: boolean }, A, T>(
  reducer: (state: S, action: A) => S,
  initialState: S,
  { storageKey, emptyValue, toHydrateAction, selectPersisted }: PersistOptions<S, A, T>
): [S, Dispatch<A>] {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Load once on mount
  useEffect(() => {
    let cancelled = false;
    getStorageItem<T>(storageKey).then((stored) => {
      if (!cancelled) dispatch(toHydrateAction(stored ?? emptyValue));
    });
    return () => {
      cancelled = true;
    };
  }, [storageKey, emptyValue, toHydrateAction]);

  // Save on every change - but never before the stored value has been loaded,
  // otherwise the empty initial state would overwrite saved data.
  useEffect(() => {
    if (!state.isHydrated) return;
    setStorageItem(storageKey, selectPersisted(state)).catch(() => {
      // Storage errors are logged inside setStorageItem; the in-memory state stays valid
    });
  }, [state, storageKey, selectPersisted]);

  return [state, dispatch];
}
