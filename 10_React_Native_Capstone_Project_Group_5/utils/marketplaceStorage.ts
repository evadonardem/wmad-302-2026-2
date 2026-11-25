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
  regionCode?: string;
  region?: string;
  provinceCode?: string;
  province?: string;
  cityCode?: string;
  barangayCode?: string;
  barangay?: string;
}

export function formatDeliveryAddress(address: DeliveryAddress): string {
  return [
    address.street,
    address.barangay,
    address.city,
    address.province,
    address.region,
    address.postalCode,
  ].filter(Boolean).join(', ');
}

export interface MarketplaceOrder {
  id: string;
  createdAt: string;
  status: 'Processing' | 'Completed' | 'Cancelled';
  items: CartItem[];
  subtotal: number;
  total: number;
  couponCode?: string;
  couponDiscount?: number;
  shippingAddress: DeliveryAddress;
  paymentMethod: 'cash' | 'demo-card';
}

export const ORDER_CANCELLATION_WINDOW_MS = 12 * 60 * 60 * 1000;

export function getOrderCancellationTimeRemaining(order: MarketplaceOrder, now = Date.now()): number | null {
  const createdAt = Date.parse(order.createdAt);
  if (!Number.isFinite(createdAt)) return null;
  const remaining = createdAt + ORDER_CANCELLATION_WINDOW_MS - now;
  return remaining > 0 ? remaining : null;
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

async function updateOrderStatus(
  id: string,
  status: Exclude<MarketplaceOrder['status'], 'Processing'>
): Promise<MarketplaceOrder> {
  const orders = await read<MarketplaceOrder[]>(KEYS.orders, []);
  const order = orders.find((entry) => entry.id === id);
  if (!order) throw new Error('Order not found.');
  if (order.status !== 'Processing') throw new Error('Only in-progress orders can change status.');
  if (status === 'Cancelled' && order.paymentMethod === 'demo-card' && getOrderCancellationTimeRemaining(order) === null) {
    throw new Error('Paid orders can only be cancelled within 12 hours of being placed.');
  }

  const updatedOrder: MarketplaceOrder = { ...order, status };
  await write(KEYS.orders, orders.map((entry) => entry.id === id ? updatedOrder : entry));
  return updatedOrder;
}

export const ordersStorage = {
  getAll: () => read<MarketplaceOrder[]>(KEYS.orders, []),
  add: async (order: MarketplaceOrder) => {
    const orders = await ordersStorage.getAll();
    await write(KEYS.orders, [order, ...orders]);
  },
  cancel: (id: string) => updateOrderStatus(id, 'Cancelled'),
  complete: (id: string) => updateOrderStatus(id, 'Completed'),
};

export const addressesStorage = {
  getAll: async () => {
    const saved = await read<DeliveryAddress[]>(KEYS.addresses, []);
    if (saved.length <= 1) return saved;

    const retained = saved.find((address) => address.isDefault) ?? saved[0];
    const onlyAddress = [{ ...retained, isDefault: true }];
    await write(KEYS.addresses, onlyAddress);
    return onlyAddress;
  },
  save: async (address: DeliveryAddress) => {
    await write(KEYS.addresses, [{ ...address, isDefault: true }]);
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
