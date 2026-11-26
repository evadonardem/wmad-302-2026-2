/**
 * AsyncStorage Utilities
 * Wrapper for @react-native-async-storage/async-storage with TypeScript
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AuthUser } from '@/types/auth';
import type { CartItem } from '@/types/product';
import type { Order } from '@/types/order';
import type { Address } from '@/types/address';

const STORAGE_KEYS = {
  AUTH_USER: 'auth_user',
  FAVORITES: 'wishlist_product_ids',
  CART: 'cart_items',
  ORDERS: 'orders',
  ADDRESSES: 'addresses',
  SETTINGS: 'user_settings',
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

export const cartStorage = {
  getCart: async (): Promise<CartItem[]> =>
    (await getStorageItem<CartItem[]>(STORAGE_KEYS.CART)) ?? [],
  setCart: (items: CartItem[]) => setStorageItem(STORAGE_KEYS.CART, items),
  addItem: async (item: CartItem) => {
    const items = await cartStorage.getCart();
    const existingIndex = items.findIndex((i) => i.productId === item.productId);
    if (existingIndex >= 0) {
      items[existingIndex].quantity += item.quantity;
    } else {
      items.push(item);
    }
    await cartStorage.setCart(items);
  },
  updateQuantity: async (productId: number, quantity: number) => {
    const items = await cartStorage.getCart();
    const index = items.findIndex((i) => i.productId === productId);
    if (index >= 0) {
      if (quantity <= 0) {
        items.splice(index, 1);
      } else {
        items[index].quantity = quantity;
      }
      await cartStorage.setCart(items);
    }
  },
  removeItem: async (productId: number) => {
    const items = await cartStorage.getCart();
    await cartStorage.setCart(items.filter((i) => i.productId !== productId));
  },
  clear: () => removeStorageItem(STORAGE_KEYS.CART),
};

export const ordersStorage = {
  /** All locally saved orders (newest first), for every user on this device. */
  getAll: async (): Promise<Order[]> => (await getStorageItem<Order[]>(STORAGE_KEYS.ORDERS)) ?? [],
  getForUser: async (userId: number): Promise<Order[]> =>
    (await ordersStorage.getAll()).filter((o) => o.userId === userId),
  add: async (order: Order): Promise<void> => {
    const all = await ordersStorage.getAll();
    await setStorageItem(STORAGE_KEYS.ORDERS, [order, ...all]);
  },
};

export const addressStorage = {
  getAll: async (): Promise<Address[]> =>
    (await getStorageItem<Address[]>(STORAGE_KEYS.ADDRESSES)) ?? [],
  getForUser: async (userId: number): Promise<Address[]> =>
    (await addressStorage.getAll()).filter((a) => a.userId === userId),
  /** Replace one user's addresses, keeping other users' addresses untouched. */
  setForUser: async (userId: number, addresses: Address[]): Promise<void> => {
    const others = (await addressStorage.getAll()).filter((a) => a.userId !== userId);
    await setStorageItem(STORAGE_KEYS.ADDRESSES, [...others, ...addresses]);
  },
  clearForUser: async (userId: number): Promise<void> => addressStorage.setForUser(userId, []),
};

/** Remove every saved order for one user (used by Settings). */
export async function clearOrdersForUser(userId: number): Promise<void> {
  const remaining = (await ordersStorage.getAll()).filter((o) => o.userId !== userId);
  await setStorageItem(STORAGE_KEYS.ORDERS, remaining);
}
