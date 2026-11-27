import React, { createContext, ReactNode, useCallback, useContext, useEffect, useReducer, useState } from 'react';
import { Product, CartItem } from '@/types/product';
import { cartStorage } from '@/utils/storage';

type CartAction =
  | { type: 'HYDRATE'; items: CartItem[] }
  | { type: 'ADD'; item: CartItem }
  | { type: 'UPDATE'; productId: number; quantity: number }
  | { type: 'REMOVE'; productId: number }
  | { type: 'CLEAR' };

function cartReducer(items: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case 'HYDRATE':
      return action.items;
    case 'ADD': {
      const existing = items.find((item) => item.productId === action.item.productId);
      if (!existing) return [...items, action.item];
      return items.map((item) =>
        item.productId === action.item.productId
          ? { ...item, quantity: item.quantity + action.item.quantity }
          : item
      );
    }
    case 'UPDATE':
      return action.quantity <= 0
        ? items.filter((item) => item.productId !== action.productId)
        : items.map((item) =>
            item.productId === action.productId ? { ...item, quantity: action.quantity } : item
          );
    case 'REMOVE':
      return items.filter((item) => item.productId !== action.productId);
    case 'CLEAR':
      return [];
  }
}

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  isLoading: boolean;
  addToCart: (product: Product, quantity?: number) => boolean;
  updateQuantity: (productId: number, quantity: number) => boolean;
  removeItem: (productId: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, dispatch] = useReducer(cartReducer, []);
  const [isLoading, setIsLoading] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;
    cartStorage.getCart()
      .then((storedItems) => {
        if (active) dispatch({ type: 'HYDRATE', items: storedItems });
      })
      .catch((error: unknown) => {
        console.error('Failed to restore the shopping cart:', error);
      })
      .finally(() => {
        if (active) {
          setHydrated(true);
          setIsLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    cartStorage.setCart(items).catch((error: unknown) => {
      console.error('Failed to persist the shopping cart:', error);
    });
  }, [items, hydrated]);

  const addToCart = useCallback((product: Product, quantity = 1) => {
    const currentQuantity = items.find((item) => item.productId === product.id)?.quantity ?? 0;
    if (!Number.isInteger(quantity) || quantity < 1 || currentQuantity + quantity > product.stock) {
      return false;
    }
    dispatch({
      type: 'ADD',
      item: {
        productId: product.id,
        title: product.title,
        thumbnail: product.thumbnail,
        price: product.price,
        discountPercentage: product.discountPercentage,
        quantity,
        stock: product.stock,
      },
    });
    return true;
  }, [items]);

  const updateQuantity = useCallback((productId: number, quantity: number) => {
    const item = items.find((current) => current.productId === productId);
    if (!item || quantity > item.stock) return false;
    dispatch({ type: 'UPDATE', productId, quantity });
    return true;
  }, [items]);

  const removeItem = useCallback((productId: number) => {
    dispatch({ type: 'REMOVE', productId });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR' });
  }, []);

  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, itemCount, isLoading, addToCart, updateQuantity, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}
