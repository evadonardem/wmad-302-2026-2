import { beforeEach, expect, it, jest } from '@jest/globals';
import { MarketplaceOrder, ordersStorage } from './marketplaceStorage';

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
