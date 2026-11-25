/**
 * Storage Utilities
 * - AsyncStorage wrapper (typed) for app data such as favorites, settings and reviews
 * - SecureStore (native) / AsyncStorage (web fallback) for auth tokens
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import type { AuthUser } from '@/types/auth';
import type { Review } from '@/types/recipe';

export const STORAGE_KEYS = {
  AUTH_PROFILE: 'auth_profile',
  AUTH_TOKENS: 'auth_tokens',
  FAVORITES: 'favorite_recipe_ids',
  SETTINGS: 'user_settings',
  REVIEWS: 'recipe_reviews',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

export interface AppSettings {
  darkMode: boolean;
  notifications: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = { darkMode: false, notifications: true };

/** Get item from storage with type safety */
export async function getStorageItem<T>(key: StorageKey): Promise<T | null> {
  try {
    const value = await AsyncStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : null;
  } catch (error) {
    console.error(`Failed to get storage item ${key}:`, error);
    return null;
  }
}

/** Set item in storage */
export async function setStorageItem<T>(key: StorageKey, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Failed to set storage item ${key}:`, error);
    throw error;
  }
}

/** Remove item from storage */
export async function removeStorageItem(key: StorageKey): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`Failed to remove storage item ${key}:`, error);
  }
}

/** Clear everything this app stores (including secure tokens) */
export async function clearAllStorage(): Promise<void> {
  try {
    await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
    await secureStorage.removeItem(STORAGE_KEYS.AUTH_TOKENS);
  } catch (error) {
    console.error('Failed to clear storage:', error);
  }
}

/** Get multiple items at once */
export async function getMultipleStorageItems<T extends Record<string, unknown>>(
  keys: StorageKey[]
): Promise<T> {
  try {
    const pairs = await AsyncStorage.multiGet(keys);
    const result: Record<string, unknown> = {};
    pairs.forEach(([key, value]) => {
      result[key] = value ? JSON.parse(value) : null;
    });
    return result as T;
  } catch (error) {
    console.error('Failed to get multiple storage items:', error);
    return {} as T;
  }
}

/** Set multiple items at once */
export async function setMultipleStorageItems(
  items: Array<{ key: StorageKey; value: unknown }>
): Promise<void> {
  try {
    const pairs: [string, string][] = items.map(({ key, value }) => [key, JSON.stringify(value)]);
    await AsyncStorage.multiSet(pairs);
  } catch (error) {
    console.error('Failed to set multiple storage items:', error);
    throw error;
  }
}

// ---------------------------------------------------------------------------
// Secure storage (tokens)
// ---------------------------------------------------------------------------

const canUseSecureStore = Platform.OS !== 'web';

export const secureStorage = {
  async getItem(key: string): Promise<string | null> {
    if (canUseSecureStore) return SecureStore.getItemAsync(key);
    return AsyncStorage.getItem(key);
  },
  async setItem(key: string, value: string): Promise<void> {
    if (canUseSecureStore) {
      await SecureStore.setItemAsync(key, value);
      return;
    }
    await AsyncStorage.setItem(key, value);
  },
  async removeItem(key: string): Promise<void> {
    if (canUseSecureStore) {
      await SecureStore.deleteItemAsync(key);
      return;
    }
    await AsyncStorage.removeItem(key);
  },
};

interface StoredTokens {
  token: string;
  refreshToken: string;
}

/**
 * Auth session persistence. Tokens go to secure storage; the (non sensitive) profile
 * goes to AsyncStorage. Logging out removes both.
 */
export const authStorage = {
  async saveSession(user: AuthUser): Promise<void> {
    const { token, refreshToken, ...profile } = user;
    const tokens: StoredTokens = { token, refreshToken };
    await secureStorage.setItem(STORAGE_KEYS.AUTH_TOKENS, JSON.stringify(tokens));
    await setStorageItem(STORAGE_KEYS.AUTH_PROFILE, profile);
  },

  async loadSession(): Promise<AuthUser | null> {
    try {
      const rawTokens = await secureStorage.getItem(STORAGE_KEYS.AUTH_TOKENS);
      const profile = await getStorageItem<Omit<AuthUser, 'token' | 'refreshToken'>>(
        STORAGE_KEYS.AUTH_PROFILE
      );
      if (!rawTokens || !profile) return null;
      const tokens = JSON.parse(rawTokens) as StoredTokens;
      if (!tokens.token || !tokens.refreshToken) return null;
      return { ...profile, ...tokens };
    } catch {
      return null;
    }
  },

  async clearSession(): Promise<void> {
    await secureStorage.removeItem(STORAGE_KEYS.AUTH_TOKENS);
    await removeStorageItem(STORAGE_KEYS.AUTH_PROFILE);
  },
};

// ---------------------------------------------------------------------------
// Favorites
// ---------------------------------------------------------------------------

export const favoritesStorage = {
  getIds: async (): Promise<number[]> => (await getStorageItem<number[]>(STORAGE_KEYS.FAVORITES)) ?? [],
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
  toggleId: async (id: number): Promise<boolean> => {
    const ids = await favoritesStorage.getIds();
    if (ids.includes(id)) {
      await favoritesStorage.removeId(id);
      return false;
    }
    await favoritesStorage.addId(id);
    return true;
  },
};

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

export const settingsStorage = {
  get: async (): Promise<AppSettings> => ({
    ...DEFAULT_SETTINGS,
    ...((await getStorageItem<Partial<AppSettings>>(STORAGE_KEYS.SETTINGS)) ?? {}),
  }),
  set: (settings: AppSettings) => setStorageItem(STORAGE_KEYS.SETTINGS, settings),
};

// ---------------------------------------------------------------------------
// Reviews (stored locally per recipe)
// ---------------------------------------------------------------------------

type ReviewMap = Record<string, Review[]>;

export const reviewsStorage = {
  getAll: async (): Promise<ReviewMap> =>
    (await getStorageItem<ReviewMap>(STORAGE_KEYS.REVIEWS)) ?? {},
  getForRecipe: async (recipeId: number): Promise<Review[]> => {
    const all = await reviewsStorage.getAll();
    return all[String(recipeId)] ?? [];
  },
  add: async (review: Review): Promise<Review[]> => {
    const all = await reviewsStorage.getAll();
    const key = String(review.recipeId);
    const next = [review, ...(all[key] ?? [])];
    await setStorageItem(STORAGE_KEYS.REVIEWS, { ...all, [key]: next });
    return next;
  },
  countByUser: async (userId: number): Promise<number> => {
    const all = await reviewsStorage.getAll();
    return Object.values(all).reduce(
      (total, list) => total + list.filter((r) => r.userId === userId).length,
      0
    );
  },
};
