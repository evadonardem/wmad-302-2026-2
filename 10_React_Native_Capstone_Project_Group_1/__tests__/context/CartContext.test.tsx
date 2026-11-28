import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CartProvider, useCart } from '@/context/CartContext';
import { makeCartItem, makeProduct } from '@/test-utils/fixtures';

const wrapper = ({ children }: { children: React.ReactNode }) => <CartProvider>{children}</CartProvider>;
const flush = () =>
  act(async () => {
    await new Promise((resolve) => setImmediate(resolve));
  });

describe('CartProvider (state + persistence)', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('starts empty and hydrates', async () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    await waitFor(() => expect(result.current.isHydrated).toBe(true));
    expect(result.current.items).toEqual([]);
    expect(result.current.totals.totalQuantity).toBe(0);
  });

  it('loads a previously saved cart', async () => {
    await AsyncStorage.setItem('cart', JSON.stringify([makeCartItem({ productId: 4, quantity: 2 })]));
    const { result } = renderHook(() => useCart(), { wrapper });
    await waitFor(() => expect(result.current.items).toHaveLength(1));
    expect(result.current.getQuantity(4)).toBe(2);
  });

  it('adds, updates and removes products and keeps totals in sync', async () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    await waitFor(() => expect(result.current.isHydrated).toBe(true));

    act(() => result.current.addProduct(makeProduct({ id: 1, price: 100, discountPercentage: 10 }), 2));
    expect(result.current.totals).toMatchObject({ totalQuantity: 2, subtotal: 200, discountedTotal: 180 });

    act(() => result.current.updateQuantity(1, 3));
    expect(result.current.getQuantity(1)).toBe(3);

    act(() => result.current.removeItem(1));
    expect(result.current.items).toHaveLength(0);
  });

  it('persists changes to AsyncStorage under the "cart" key', async () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    await waitFor(() => expect(result.current.isHydrated).toBe(true));

    act(() => result.current.addProduct(makeProduct({ id: 9 }), 1));
    await flush();

    const saved = JSON.parse((await AsyncStorage.getItem('cart')) ?? '[]') as Array<{ productId: number }>;
    expect(saved.map((i) => i.productId)).toEqual([9]);

    act(() => result.current.clearCart());
    await flush();
    expect(JSON.parse((await AsyncStorage.getItem('cart')) ?? 'null')).toEqual([]);
  });

  it('throws when used outside the provider', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => renderHook(() => useCart())).toThrow(/CartProvider/);
    spy.mockRestore();
  });
});
