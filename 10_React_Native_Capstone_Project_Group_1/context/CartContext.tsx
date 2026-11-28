/**
 * Cart Context - Context + useReducer, persisted to AsyncStorage ("cart" key)
 */
import React, { createContext, useCallback, useContext, useMemo, ReactNode } from 'react';
import { CartAction, CartState, CartTotals } from '@/types/cart';
import { CartItem, ProductSummary } from '@/types/product';
import { cartReducer, initialCartState } from '@/context/cartReducer';
import { usePersistedReducer } from '@/hooks/usePersistedReducer';
import { STORAGE_KEYS } from '@/utils/storage';
import { calculateCartTotals, productToCartItem } from '@/utils/pricing';

interface CartContextType {
  items: CartItem[];
  totals: CartTotals;
  isHydrated: boolean;
  addProduct: (product: ProductSummary, quantity?: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  removeItem: (productId: number) => void;
  clearCart: () => void;
  getQuantity: (productId: number) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const EMPTY_CART: CartItem[] = [];
const hydrateAction = (items: CartItem[]): CartAction => ({ type: 'CART_HYDRATE', payload: items });
const selectItems = (state: CartState): CartItem[] => state.items;

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = usePersistedReducer(cartReducer, initialCartState, {
    storageKey: STORAGE_KEYS.CART,
    emptyValue: EMPTY_CART,
    toHydrateAction: hydrateAction,
    selectPersisted: selectItems,
  });

  const totals = useMemo(() => calculateCartTotals(state.items), [state.items]);

  const addProduct = useCallback(
    (product: ProductSummary, quantity = 1) => {
      dispatch({ type: 'CART_ADD_ITEM', payload: productToCartItem(product, quantity) });
    },
    [dispatch]
  );

  const updateQuantity = useCallback(
    (productId: number, quantity: number) => {
      dispatch({ type: 'CART_UPDATE_QUANTITY', payload: { productId, quantity } });
    },
    [dispatch]
  );

  const removeItem = useCallback(
    (productId: number) => dispatch({ type: 'CART_REMOVE_ITEM', payload: { productId } }),
    [dispatch]
  );

  const clearCart = useCallback(() => dispatch({ type: 'CART_CLEAR' }), [dispatch]);

  const getQuantity = useCallback(
    (productId: number) => state.items.find((i) => i.productId === productId)?.quantity ?? 0,
    [state.items]
  );

  const value = useMemo(
    () => ({
      items: state.items,
      totals,
      isHydrated: state.isHydrated,
      addProduct,
      updateQuantity,
      removeItem,
      clearCart,
      getQuantity,
    }),
    [state.items, state.isHydrated, totals, addProduct, updateQuantity, removeItem, clearCart, getQuantity]
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
