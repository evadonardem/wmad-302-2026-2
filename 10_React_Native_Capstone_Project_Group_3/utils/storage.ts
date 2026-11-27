/**
 * AsyncStorage Utilities
 * Wrapper for @react-native-async-storage/async-storage with TypeScript
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Cart, CartItem } from '@/types/product';
import type { AuthUser, UserAddress } from '@/types/auth';

const STORAGE_KEYS = {
  AUTH_USER: 'auth_user',
  WISHLIST: 'wishlist_product_ids',
  CART: 'cart',
  ORDERS: 'local_orders',
  ADDRESSES: 'user_addresses',
  SETTINGS: 'user_settings',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

export async function getStorageItem<T>(key: StorageKey): Promise<T | null> {
  try {
    const value = await AsyncStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : null;
  } catch (error) {
    console.error(`Failed to get storage item ${key}:`, error);
    return null;
  }
}

export async function setStorageItem<T>(key: StorageKey, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Failed to set storage item ${key}:`, error);
    throw error;
  }
}

export async function removeStorageItem(key: StorageKey): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`Failed to remove storage item ${key}:`, error);
  }
}

export async function clearAllStorage(): Promise<void> {
  try {
    await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
  } catch (error) {
    console.error('Failed to clear storage:', error);
  }
}

export const authStorage = {
  getUser: () => getStorageItem<AuthUser>(STORAGE_KEYS.AUTH_USER),
  setUser: (user: AuthUser) => setStorageItem(STORAGE_KEYS.AUTH_USER, user),
  clearUser: () => removeStorageItem(STORAGE_KEYS.AUTH_USER),
};

export const wishlistStorage = {
  getIds: async (): Promise<number[]> =>
    (await getStorageItem<number[]>(STORAGE_KEYS.WISHLIST)) ?? [],
  setIds: (ids: number[]) => setStorageItem(STORAGE_KEYS.WISHLIST, ids),
  toggleId: async (id: number): Promise<boolean> => {
    const ids = await wishlistStorage.getIds();
    if (ids.includes(id)) {
      await wishlistStorage.setIds(ids.filter((item) => item !== id));
      return false;
    }
    await wishlistStorage.setIds([...ids, id]);
    return true;
  },
};

export const cartStorage = {
  getCart: async (): Promise<CartItem[]> =>
    (await getStorageItem<CartItem[]>(STORAGE_KEYS.CART)) ?? [],
  setCart: (items: CartItem[]) => setStorageItem(STORAGE_KEYS.CART, items),
  clear: () => removeStorageItem(STORAGE_KEYS.CART),
};

export const orderStorage = {
  getOrders: async (): Promise<Cart[]> =>
    (await getStorageItem<Cart[]>(STORAGE_KEYS.ORDERS)) ?? [],
  addOrder: async (order: Cart): Promise<void> => {
    const existing = await orderStorage.getOrders();
    await setStorageItem(STORAGE_KEYS.ORDERS, [order, ...existing]);
  },
};

export const addressStorage = {
  getAddresses: async (): Promise<UserAddress[]> =>
    (await getStorageItem<UserAddress[]>(STORAGE_KEYS.ADDRESSES)) ?? [],
  setAddresses: (addresses: UserAddress[]) =>
    setStorageItem(STORAGE_KEYS.ADDRESSES, addresses),
};