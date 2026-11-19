/**
 * AsyncStorage Utilities
 * Wrapper for @react-native-async-storage/async-storage with TypeScript
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CartItem, Order } from '@/types/product';
import type { LocalAccount } from '@/types/auth';

const STORAGE_KEYS = {
  AUTH_USER: 'auth_user',
  FAVORITES: 'favorite_recipe_ids',
  CART: 'cart', // README says the cart lives under the key "cart"
  SETTINGS: 'user_settings',
  ORDERS: 'orders',
  LOCAL_ACCOUNTS: 'local_accounts',
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];

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
  keys: StorageKey[]
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
    const pairs = items.map(({ key, value }): [string, string] => [key, JSON.stringify(value)]);
    await AsyncStorage.multiSet(pairs);
  } catch (error) {
    console.error('Failed to set multiple storage items:', error);
    throw error;
  }
}

// Specific helpers for common use cases

export const authStorage = {
  getUser: () => getStorageItem<{
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    token: string;
    refreshToken: string;
  }>(STORAGE_KEYS.AUTH_USER),
  setUser: (user: unknown) => setStorageItem(STORAGE_KEYS.AUTH_USER, user),
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
 * Carts are saved per account: { "emilys": [items], "jlaw": [items] }.
 * That way two people using the same device never see each other's cart.
 */
type CartMap = Record<string, CartItem[]>;
const cartKey = (owner: string) => owner.trim().toLowerCase();

export const cartStorage = {
  getCart: async (owner: string): Promise<CartItem[]> => {
    const saved = await getStorageItem<CartMap | CartItem[]>(STORAGE_KEYS.CART);
    // An old (pre-per-account) cart was a plain array: ignore it
    if (!saved || Array.isArray(saved)) return [];
    const items = saved[cartKey(owner)];
    return Array.isArray(items) ? items : [];
  },
  setCart: async (owner: string, items: CartItem[]): Promise<void> => {
    const saved = await getStorageItem<CartMap | CartItem[]>(STORAGE_KEYS.CART);
    const map: CartMap = saved && !Array.isArray(saved) ? saved : {};
    await setStorageItem(STORAGE_KEYS.CART, { ...map, [cartKey(owner)]: items });
  },
  clear: () => removeStorageItem(STORAGE_KEYS.CART),
};

/**
 * Orders placed inside this app. DummyJSON only pretends to save new orders
 * (POST /carts/add), so we keep them on the device to show them in Order History.
 */
export const orderStorage = {
  getOrders: async (): Promise<Order[]> => (await getStorageItem<Order[]>(STORAGE_KEYS.ORDERS)) ?? [],
  addOrder: async (order: Order) => {
    const orders = await orderStorage.getOrders();
    await setStorageItem(STORAGE_KEYS.ORDERS, [order, ...orders]); // newest first
  },
  clear: () => removeStorageItem(STORAGE_KEYS.ORDERS),
};

/**
 * Accounts created with Register. DummyJSON only pretends to create users, so we keep
 * them here to let people log in with the username and password they registered.
 */
export const accountStorage = {
  getAll: async (): Promise<LocalAccount[]> => {
    const saved = await getStorageItem<LocalAccount[]>(STORAGE_KEYS.LOCAL_ACCOUNTS);
    // Ignore anything that isn't a proper account (e.g. old or damaged data)
    return Array.isArray(saved)
      ? saved.filter((a) => !!a && typeof a.username === 'string' && typeof a.passwordHash === 'string')
      : [];
  },
  find: async (username: string | undefined): Promise<LocalAccount | null> => {
    const key = (username ?? '').trim().toLowerCase();
    if (!key) return null;
    const accounts = await accountStorage.getAll();
    return accounts.find((a) => a.username.toLowerCase() === key) ?? null;
  },
  add: async (account: LocalAccount) => {
    const accounts = await accountStorage.getAll();
    await setStorageItem(STORAGE_KEYS.LOCAL_ACCOUNTS, [...accounts, account]);
  },
};