import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CartProvider, useCart } from '@/context/CartContext';
import { productToCartItem } from '@/utils/cart';
import { makeProduct } from './fixtures';

const wrapper = ({ children }: { children: React.ReactNode }) => <CartProvider>{children}</CartProvider>;

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('CartProvider', () => {
  it('restores the saved cart from AsyncStorage', async () => {
    const saved = [productToCartItem(makeProduct({ id: 3 }), 2)];
    await AsyncStorage.setItem('cart_items', JSON.stringify(saved));

    const { result } = renderHook(() => useCart(), { wrapper });
    await waitFor(() => expect(result.current.hydrated).toBe(true));

    expect(result.current.items).toHaveLength(1);
    expect(result.current.totals.totalQuantity).toBe(2);
    expect(result.current.getQuantity(3)).toBe(2);
  });

  it('adds items, updates totals and persists them', async () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    await waitFor(() => expect(result.current.hydrated).toBe(true));

    act(() => result.current.addToCart(makeProduct({ id: 1, price: 100, discountPercentage: 10 }), 2));

    expect(result.current.totals.totalQuantity).toBe(2);
    expect(result.current.totals.total).toBeCloseTo(180);

    await waitFor(async () => {
      const raw = await AsyncStorage.getItem('cart_items');
      expect(raw).not.toBeNull();
      expect(JSON.parse(raw as string)).toHaveLength(1);
    });
  });

  it('updates quantity, removes items and clears the cart', async () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    await waitFor(() => expect(result.current.hydrated).toBe(true));

    act(() => result.current.addToCart(makeProduct({ id: 1, stock: 10 })));
    act(() => result.current.setQuantity(1, 4));
    expect(result.current.getQuantity(1)).toBe(4);

    act(() => result.current.removeFromCart(1));
    expect(result.current.items).toHaveLength(0);

    act(() => result.current.addToCart(makeProduct({ id: 2 })));
    act(() => result.current.clearCart());
    expect(result.current.items).toHaveLength(0);
  });

  it('throws when used outside the provider', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => renderHook(() => useCart())).toThrow('useCart must be used within a CartProvider');
    spy.mockRestore();
  });
});
