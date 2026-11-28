import { beforeEach, expect, it, jest } from '@jest/globals';
import {
  addressesStorage,
  formatDeliveryAddress,
  getOrderCancellationTimeRemaining,
  MarketplaceOrder,
  ordersStorage,
} from './marketplaceStorage';

const mockStorage = new Map<string, string>();

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(async (key: string) => mockStorage.get(key) ?? null),
    setItem: jest.fn(async (key: string, value: string) => {
      mockStorage.set(key, value);
    }),
  },
}));

const order: MarketplaceOrder = {
  id: 'order-1',
  createdAt: '2026-11-19T00:00:00.000Z',
  status: 'Processing',
  items: [],
  subtotal: 10,
  total: 10,
  shippingAddress: {
    id: 'address-1',
    recipient: 'Test User',
    phone: '123456789',
    street: '1 Test Street',
    city: 'Test City',
    postalCode: '12345',
    isDefault: true,
  },
  paymentMethod: 'cash',
};

beforeEach(() => {
  mockStorage.clear();
});

it('persists a cancelled order and prevents another status change', async () => {
  await ordersStorage.add(order);

  await expect(ordersStorage.cancel(order.id)).resolves.toMatchObject({ status: 'Cancelled' });
  await expect(ordersStorage.getAll()).resolves.toMatchObject([{ id: order.id, status: 'Cancelled' }]);
  await expect(ordersStorage.complete(order.id)).rejects.toThrow('Only in-progress orders can change status.');
});

it('persists completed orders for the completed orders filter', async () => {
  await ordersStorage.add(order);

  await expect(ordersStorage.complete(order.id)).resolves.toMatchObject({ status: 'Completed' });
  await expect(ordersStorage.getAll()).resolves.toMatchObject([{ id: order.id, status: 'Completed' }]);
});

it('allows paid orders to be cancelled within 12 hours and rejects expired cancellation', async () => {
  const paidOrder = { ...order, paymentMethod: 'demo-card' as const, createdAt: new Date(Date.now() - 11 * 60 * 60 * 1000).toISOString() };
  await ordersStorage.add(paidOrder);
  await expect(ordersStorage.cancel(paidOrder.id)).resolves.toMatchObject({ status: 'Cancelled' });

  const expiredOrder = {
    ...order,
    id: 'expired-order',
    paymentMethod: 'demo-card' as const,
    createdAt: new Date(Date.now() - 13 * 60 * 60 * 1000).toISOString(),
  };
  await ordersStorage.add(expiredOrder);
  await expect(ordersStorage.cancel(expiredOrder.id)).rejects.toThrow(
    'Paid orders can only be cancelled within 12 hours of being placed.'
  );
});

it('provides a 12-hour timer for cash-on-delivery orders too', () => {
  const cashOrder = {
    ...order,
    createdAt: new Date(Date.now() - 11 * 60 * 60 * 1000).toISOString(),
  };

  expect(getOrderCancellationTimeRemaining(cashOrder)).toBeGreaterThan(0);
});

it('keeps only one saved delivery address', async () => {
  const firstAddress = { ...order.shippingAddress, isDefault: true };
  const secondAddress = { ...order.shippingAddress, id: 'address-2', isDefault: false };
  await addressesStorage.save(firstAddress);
  await addressesStorage.save(secondAddress);

  await expect(addressesStorage.getAll()).resolves.toEqual([{ ...secondAddress, isDefault: true }]);
});

it('consolidates older saved address lists to their default address', async () => {
  const defaultAddress = { ...order.shippingAddress, isDefault: true };
  const otherAddress = { ...order.shippingAddress, id: 'address-2', isDefault: false };
  mockStorage.set('marketplace_addresses', JSON.stringify([otherAddress, defaultAddress]));

  await expect(addressesStorage.getAll()).resolves.toEqual([defaultAddress]);
});

it('formats full Philippine delivery locations while supporting older saved addresses', () => {
  expect(formatDeliveryAddress({
    ...order.shippingAddress,
    barangay: 'Barangay Test',
    province: 'Test Province',
    region: 'Test Region',
  })).toBe('1 Test Street, Barangay Test, Test City, Test Province, Test Region, 12345');
  expect(formatDeliveryAddress(order.shippingAddress)).toBe('1 Test Street, Test City, 12345');
});
