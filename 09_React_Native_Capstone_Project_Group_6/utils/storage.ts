/**
 * AsyncStorage Utilities
 * Wrapper for @react-native-async-storage/async-storage with TypeScript
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AuthUser } from '@/types/auth';

const STORAGE_KEYS = {
  AUTH_USER: 'auth_user',
  FAVORITES: 'favorite_recipe_ids',
  LOCAL_ACCOUNTS: 'local_accounts',
  SETTINGS: 'user_settings',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

/**
 * Get item from storage with type safety
 */
export async function getStorageItem<T>(key: StorageKey): Promise<T | null> {
  try {
    const value = await AsyncStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error(`Failed to get storage item ${key}:`, error);
    return null;
  }
}

/**
 * Set item in storage
 */
export async function setStorageItem<T>(key: StorageKey, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Failed to set storage item ${key}:`, error);
    throw error;
  }
}

/**
 * Remove item from storage
 */
export async function removeStorageItem(key: StorageKey): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`Failed to remove storage item ${key}:`, error);
  }
}

/**
 * Clear all app storage
 */
export async function clearAllStorage(): Promise<void> {
  try {
    await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
  } catch (error) {
    console.error('Failed to clear storage:', error);
  }
}

/**
 * Get multiple items at once
 */
export async function getMultipleStorageItems<T extends Record<string, unknown>>(
  keys: StorageKey[],
): Promise<T> {
  try {
    const pairs = await AsyncStorage.multiGet(keys);
    const result = {} as T;
    pairs.forEach(([key, value]) => {
      (result as Record<string, unknown>)[key] = value ? JSON.parse(value) : null;
    });
    return result;
  } catch (error) {
    console.error('Failed to get multiple storage items:', error);
    return {} as T;
  }
}

/**
 * Set multiple items at once
 */
export async function setMultipleStorageItems(
  items: { key: StorageKey; value: unknown }[]
): Promise<void> {
  try {
    const pairs: [string, string][] = items.map(({ key, value }) => [key, JSON.stringify(value)]);
    await AsyncStorage.multiSet(pairs);
  } catch (error) {
    console.error('Failed to set multiple storage items:', error);
    throw error;
  }
}

// Specific helpers for common use cases

export const authStorage = {
  getUser: () => getStorageItem<AuthUser>(STORAGE_KEYS.AUTH_USER),
  setUser: (user: AuthUser) => setStorageItem(STORAGE_KEYS.AUTH_USER, user),
  clearUser: () => removeStorageItem(STORAGE_KEYS.AUTH_USER),
};

export const favoritesStorage = {
  getIds: async (): Promise<number[]> =>
    (await getStorageItem<number[]>(STORAGE_KEYS.FAVORITES)) ?? [],
  setIds: (ids: number[]) => setStorageItem(STORAGE_KEYS.FAVORITES, ids),
  addId: async (id: number) => {
    const ids = await favoritesStorage.getIds();
    if (!ids.includes(id)) {
      await favoritesStorage.setIds([...ids, id]);
    }
  },
  removeId: async (id: number) => {
    const ids = await favoritesStorage.getIds();
    await favoritesStorage.setIds(ids.filter((i) => i !== id));
  },
  toggleId: async (id: number) => {
    const ids = await favoritesStorage.getIds();
    if (ids.includes(id)) {
      await favoritesStorage.removeId(id);
      return false;
    } else {
      await favoritesStorage.addId(id);
      return true;
    }
  },
};

/**
 * Accounts created on the Register screen. DummyJSON doesn't save new users,
 * so we keep them on this device and check them at login.
 * NOTE: the password is stored as plain text - acceptable for a class project,
 * never for a real app.
 */
export interface LocalAccount {
  password: string;
  user: Omit<AuthUser, 'token' | 'refreshToken'>;
}

export const accountsStorage = {
  getAll: async (): Promise<LocalAccount[]> =>
    (await getStorageItem<LocalAccount[]>(STORAGE_KEYS.LOCAL_ACCOUNTS)) ?? [],
  add: async (account: LocalAccount): Promise<void> => {
    const all = await accountsStorage.getAll();
    await setStorageItem(STORAGE_KEYS.LOCAL_ACCOUNTS, [...all, account]);
  },
  /** Change profile fields of one saved account (used by Edit Profile). */
  update: async (id: number, changes: Partial<LocalAccount['user']>): Promise<void> => {
    const all = await accountsStorage.getAll();
    const next = all.map((account) =>
      account.user.id === id ? { ...account, user: { ...account.user, ...changes } } : account,
    );
    await setStorageItem(STORAGE_KEYS.LOCAL_ACCOUNTS, next);
  },
};
