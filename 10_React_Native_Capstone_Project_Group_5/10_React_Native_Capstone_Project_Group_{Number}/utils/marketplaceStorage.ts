import AsyncStorage from '@react-native-async-storage/async-storage';
import { CartItem } from '@/types/product';

const KEYS = {
  orders: 'marketplace_orders',
  addresses: 'marketplace_addresses',
  preferences: 'marketplace_preferences',
} as const;

export interface DeliveryAddress {
  id: string;
  recipient: string;
  phone: string;
  street: string;
  city: string;
  postalCode: string;
  isDefault: boolean;
}

export interface MarketplaceOrder {
  id: string;
  createdAt: string;
  status: 'Processing';
  items: CartItem[];
  subtotal: number;
  total: number;
  shippingAddress: DeliveryAddress;
  paymentMethod: 'cash' | 'demo-card';
}

export interface MarketplacePreferences {
  notificationsEnabled: boolean;
  promotionalEmailsEnabled: boolean;
}

async function read<T>(key: string, fallback: T): Promise<T> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch (error) {
    console.error(`Invalid saved data for ${key}:`, error);
    throw new Error('Saved marketplace data is corrupted. Clear the app data and try again.');
  }
}

async function write<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export const ordersStorage = {
  getAll: () => read<MarketplaceOrder[]>(KEYS.orders, []),
  add: async (order: MarketplaceOrder) => {
    const orders = await ordersStorage.getAll();
    await write(KEYS.orders, [order, ...orders]);
  },
};

export const addressesStorage = {
  getAll: () => read<DeliveryAddress[]>(KEYS.addresses, []),
  save: async (address: DeliveryAddress) => {
    const current = await addressesStorage.getAll();
    const remaining = current.filter((entry) => entry.id !== address.id);
    const updated = address.isDefault
      ? remaining.map((entry) => ({ ...entry, isDefault: false }))
      : remaining;
    await write(KEYS.addresses, [...updated, address]);
  },
  remove: async (id: string) => {
    const current = await addressesStorage.getAll();
    const removed = current.find((address) => address.id === id);
    const remaining = current.filter((address) => address.id !== id);
    if (removed?.isDefault && remaining.length > 0) {
      remaining[0] = { ...remaining[0], isDefault: true };
    }
    await write(KEYS.addresses, remaining);
  },
  setDefault: async (id: string) => {
    const current = await addressesStorage.getAll();
    await write(
      KEYS.addresses,
      current.map((address) => ({ ...address, isDefault: address.id === id }))
    );
  },
};

const defaultPreferences: MarketplacePreferences = {
  notificationsEnabled: true,
  promotionalEmailsEnabled: false,
};

export const preferencesStorage = {
  get: () => read(KEYS.preferences, defaultPreferences),
  set: (preferences: MarketplacePreferences) => write(KEYS.preferences, preferences),
};
