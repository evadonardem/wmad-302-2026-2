import React, { ReactNode } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { beforeEach, expect, it, jest } from '@jest/globals';
import { CartItem } from '@/types/product';
import { CartProvider, useCart } from './CartContext';

const mockStorage = new Map<string, string>();

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(async (key: string) => mockStorage.get(key) ?? null),
    setItem: jest.fn(async (key: string, value: string) => {
      mockStorage.set(key, value);
    }),
    removeItem: jest.fn(async (key: string) => {
      mockStorage.delete(key);
    }),
  },
}));

const initialItems: CartItem[] = [
  {
    productId: 1,
    title: 'First product',
    thumbnail: 'first.jpg',
    price: 10,
    discountPercentage: 0,
    quantity: 1,
    stock: 5,
  },
  {
    productId: 2,
    title: 'Second product',
    thumbnail: 'second.jpg',
    price: 20,
    discountPercentage: 0,
    quantity: 2,
    stock: 5,
  },
];

const wrapper = ({ children }: { children: ReactNode }) => (
  <CartProvider>{children}</CartProvider>
);

beforeEach(() => {
  mockStorage.clear();
});

it('removes only purchased products and keeps the remaining cart and coupon', async () => {
  mockStorage.set('cart_items', JSON.stringify(initialItems));
  const { result } = renderHook(() => useCart(), { wrapper });

  await waitFor(() => expect(result.current.isLoading).toBe(false));
  await act(async () => {
    await result.current.applyCoupon('KARTORA10');
    await result.current.removeItems([1]);
  });

  expect(result.current.items).toEqual([initialItems[1]]);
  expect(result.current.appliedCoupon?.code).toBe('KARTORA10');
  expect(mockStorage.get('cart_items')).toBe(JSON.stringify([initialItems[1]]));
});
