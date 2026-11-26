/**
 * Cart Context - useReducer state, persisted to AsyncStorage.
 * The saved cart is restored on startup and re-saved whenever items change.
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
import type { CartItem, CartTotals, Product } from '@/types/product';
import { cartStorage } from '@/utils/storage';
import { calculateTotals, cartReducer, initialCartState, productToCartItem } from '@/utils/cart';

interface CartContextType {
  items: CartItem[];
  totals: CartTotals;
  /** True once the saved cart has been loaded. */
  hydrated: boolean;
  addToCart: (product: Product, quantity?: number) => void;
  /** Add an existing cart line back (used by Undo). */
  addItem: (item: CartItem) => void;
  removeFromCart: (productId: number) => void;
  setQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getQuantity: (productId: number) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialCartState);

  // Restore the saved cart on mount
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

  // Persist after every change (but never before the saved cart has loaded,
  // or we would overwrite it with an empty list)
  useEffect(() => {
    if (!state.hydrated) return;
    cartStorage.setCart(state.items).catch(() => undefined);
  }, [state.items, state.hydrated]);

  const addToCart = useCallback((product: Product, quantity: number = 1) => {
    dispatch({ type: 'CART_ADD', payload: productToCartItem(product, quantity) });
  }, []);

  const addItem = useCallback((item: CartItem) => {
    dispatch({ type: 'CART_ADD', payload: item });
  }, []);

  const removeFromCart = useCallback((productId: number) => {
    dispatch({ type: 'CART_REMOVE', payload: { productId } });
  }, []);

  const setQuantity = useCallback((productId: number, quantity: number) => {
    dispatch({ type: 'CART_SET_QUANTITY', payload: { productId, quantity } });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: 'CART_CLEAR' });
  }, []);

  const getQuantity = useCallback(
    (productId: number) => state.items.find((i) => i.productId === productId)?.quantity ?? 0,
    [state.items]
  );

  const totals = useMemo(() => calculateTotals(state.items), [state.items]);

  const value = useMemo<CartContextType>(
    () => ({
      items: state.items,
      totals,
      hydrated: state.hydrated,
      addToCart,
      addItem,
      removeFromCart,
      setQuantity,
      clearCart,
      getQuantity,
    }),
    [state.items, state.hydrated, totals, addToCart, addItem, removeFromCart, setQuantity, clearCart, getQuantity]
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
