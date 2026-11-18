/**
 * Cart Context with useReducer + AsyncStorage persistence
 *
 * - The reducer is a pure function (easy to unit test, see Phase 7)
 * - The cart is loaded from AsyncStorage once on app start, and saved again
 *   every time `items` changes (but only AFTER it was loaded, so we never
 *   overwrite a saved cart with an empty one)
 * - Totals (subtotal, discounted total, badge count) are derived from `items`
 *   with useMemo instead of being stored, so they can never get out of sync
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  ReactNode,
} from 'react';
import { CartItem, Product } from '@/types/product';
import { cartStorage } from '@/utils/storage';

/** Only the product fields the cart needs (so any screen's Product type works). */
export type CartProduct = Pick<
  Product,
  'id' | 'title' | 'thumbnail' | 'price' | 'discountPercentage' | 'stock'
>;

export interface CartState {
  items: CartItem[];
  isHydrated: boolean; // true once the saved cart has been read from AsyncStorage
}

export type CartAction =
  | { type: 'CART_HYDRATE'; payload: CartItem[] }
  | { type: 'CART_ADD'; payload: CartItem }
  | { type: 'CART_SET_QUANTITY'; payload: { productId: number; quantity: number } }
  | { type: 'CART_REMOVE'; payload: number }
  | { type: 'CART_CLEAR' };

export interface CartTotals {
  total: number; // price before discounts
  discountedTotal: number; // what the customer pays
  totalProducts: number; // number of different products
  totalQuantity: number; // number of units (shown on the tab badge)
}

export type AddToCartResult = 'added' | 'out_of_stock' | 'max_reached';

export const initialCartState: CartState = { items: [], isHydrated: false };

/** Price of one unit after its discount. */
export function getDiscountedPrice(item: Pick<CartItem, 'price' | 'discountPercentage'>): number {
  return item.price * (1 - item.discountPercentage / 100);
}

export function calculateTotals(items: CartItem[]): CartTotals {
  return {
    total: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    discountedTotal: items.reduce((sum, i) => sum + getDiscountedPrice(i) * i.quantity, 0),
    totalProducts: items.length,
    totalQuantity: items.reduce((sum, i) => sum + i.quantity, 0),
  };
}

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'CART_HYDRATE':
      return { items: action.payload, isHydrated: true };

    case 'CART_ADD': {
      const incoming = action.payload;
      const existing = state.items.find((i) => i.productId === incoming.productId);
      if (existing) {
        // Same product again: increase quantity, never above stock
        return {
          ...state,
          items: state.items.map((i) =>
            i.productId === incoming.productId
              ? { ...i, quantity: Math.min(i.quantity + incoming.quantity, i.stock) }
              : i
          ),
        };
      }
      return {
        ...state,
        items: [...state.items, { ...incoming, quantity: Math.min(incoming.quantity, incoming.stock) }],
      };
    }

    case 'CART_SET_QUANTITY': {
      const { productId, quantity } = action.payload;
      if (quantity <= 0) {
        return { ...state, items: state.items.filter((i) => i.productId !== productId) };
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.productId === productId ? { ...i, quantity: Math.min(quantity, i.stock) } : i
        ),
      };
    }

    case 'CART_REMOVE':
      return { ...state, items: state.items.filter((i) => i.productId !== action.payload) };

    case 'CART_CLEAR':
      return { ...state, items: [] };

    default:
      return state;
  }
}

interface CartContextType extends CartTotals {
  items: CartItem[];
  isHydrated: boolean;
  addToCart: (product: CartProduct, quantity?: number) => AddToCartResult;
  /** Put a removed item back exactly as it was (used by the "Undo" snackbar). */
  restoreItem: (item: CartItem) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialCartState);

  // 1. Load the saved cart once on start
  useEffect(() => {
    let cancelled = false;
    cartStorage
      .getCart()
      .then((saved) => {
        if (!cancelled) dispatch({ type: 'CART_HYDRATE', payload: saved });
      })
      .catch(() => {
        if (!cancelled) dispatch({ type: 'CART_HYDRATE', payload: [] });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // 2. Save whenever the items change (skipped until the saved cart was loaded)
  useEffect(() => {
    if (!state.isHydrated) return;
    cartStorage.setCart(state.items).catch((error: unknown) => {
      console.error('Failed to save cart:', error);
    });
  }, [state.items, state.isHydrated]);

  const addToCart = useCallback(
    (product: CartProduct, quantity = 1): AddToCartResult => {
      if (product.stock <= 0) return 'out_of_stock';
      const inCart = state.items.find((i) => i.productId === product.id)?.quantity ?? 0;
      if (inCart >= product.stock) return 'max_reached';

      dispatch({
        type: 'CART_ADD',
        payload: {
          productId: product.id,
          title: product.title,
          thumbnail: product.thumbnail,
          price: product.price,
          discountPercentage: product.discountPercentage,
          stock: product.stock,
          quantity,
        },
      });
      return 'added';
    },
    [state.items]
  );

  const restoreItem = useCallback((item: CartItem) => {
    dispatch({ type: 'CART_ADD', payload: item });
  }, []);

  const updateQuantity = useCallback((productId: number, quantity: number) => {
    dispatch({ type: 'CART_SET_QUANTITY', payload: { productId, quantity } });
  }, []);

  const removeFromCart = useCallback((productId: number) => {
    dispatch({ type: 'CART_REMOVE', payload: productId });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: 'CART_CLEAR' });
  }, []);

  const totals = useMemo(() => calculateTotals(state.items), [state.items]);

  const value = useMemo<CartContextType>(
    () => ({
      items: state.items,
      isHydrated: state.isHydrated,
      ...totals,
      addToCart,
      restoreItem,
      updateQuantity,
      removeFromCart,
      clearCart,
    }),
    [state.items, state.isHydrated, totals, addToCart, restoreItem, updateQuantity, removeFromCart, clearCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export { CartContext };
