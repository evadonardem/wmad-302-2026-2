/**
 * AsyncStorage Utilities - Extended with Bonus Features
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CartItem } from '@/types/product';

const STORAGE_KEYS = {
  AUTH_USER: 'auth_user',
  FAVORITES: 'favorite_recipe_ids',
  CART: 'cart_items',
  SETTINGS: 'user_settings',
  MEAL_PLAN: 'meal_plan_data',
  SHOPPING_LIST: 'shopping_list_items',
  COLLECTIONS: 'recipe_collections',
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];

export async function getStorageItem<T>(key: StorageKey): Promise<T | null> {
  try {
    const value = await AsyncStorage.getItem(key);
    return value ? JSON.parse(value) : null;
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

export const authStorage = {
  getUser: () => getStorageItem<any>(STORAGE_KEYS.AUTH_USER),
  setUser: (user: unknown) => setStorageItem(STORAGE_KEYS.AUTH_USER, user),
  clearUser: () => removeStorageItem(STORAGE_KEYS.AUTH_USER),
};

export const favoritesStorage = {
  getIds: async (): Promise<number[]> => {
    const ids = await getStorageItem<number[]>(STORAGE_KEYS.FAVORITES);
    return ids || [];
  },
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

export interface ShoppingItem {
  id: string;
  name: string;
  checked: boolean;
  category?: string;
}

export const shoppingStorage = {
  getItems: async (): Promise<ShoppingItem[]> => {
    const items = await getStorageItem<ShoppingItem[]>(STORAGE_KEYS.SHOPPING_LIST);
    return items || [];
  },
  setItems: (items: ShoppingItem[]) => setStorageItem(STORAGE_KEYS.SHOPPING_LIST, items),
  addItem: async (name: string) => {
    const items = await shoppingStorage.getItems();
    const newItem: ShoppingItem = { id: Date.now().toString(), name, checked: false };
    await shoppingStorage.setItems([...items, newItem]);
  },
  toggleItem: async (id: string) => {
    const items = await shoppingStorage.getItems();
    const updated = items.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i));
    await shoppingStorage.setItems(updated);
  },
  removeItem: async (id: string) => {
    const items = await shoppingStorage.getItems();
    await shoppingStorage.setItems(items.filter((i) => i.id !== id));
  },
};

export const mealPlanStorage = {
  getPlan: async () => {
    const plan = await getStorageItem<Record<string, { breakfast?: string; lunch?: string; dinner?: string }>>(STORAGE_KEYS.MEAL_PLAN);
    return plan || {};
  },
  savePlan: (plan: any) => setStorageItem(STORAGE_KEYS.MEAL_PLAN, plan),
};

export interface Collection {
  id: string;
  name: string;
  recipeIds: number[];
}

export const collectionsStorage = {
  getCollections: async (): Promise<Collection[]> => {
    const cols = await getStorageItem<Collection[]>(STORAGE_KEYS.COLLECTIONS);
    if (cols) return cols;
    const defaults: Collection[] = [
      { id: '1', name: '🌅 Quick Breakfasts', recipeIds: [] },
      { id: '2', name: '🥗 Healthy Lunches', recipeIds: [] },
      { id: '3', name: '🍷 Weekend Feasts', recipeIds: [] },
    ];
    await setStorageItem(STORAGE_KEYS.COLLECTIONS, defaults);
    return defaults;
  },
  saveCollections: (cols: Collection[]) => setStorageItem(STORAGE_KEYS.COLLECTIONS, cols),
};