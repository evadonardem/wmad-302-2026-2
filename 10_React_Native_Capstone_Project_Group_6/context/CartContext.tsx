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
  useRef,
  ReactNode,
} from 'react';
import { CartItem, Product } from '@/types/product';
import { cartStorage, couponStorage } from '@/utils/storage';
import { Coupon, evaluateCoupon } from '@/utils/coupons';
import { useAuth } from '@/context/AuthContext';

/** Only the product fields the cart needs (so any screen's Product type works). */
export type CartProduct = Pick<
  Product,
  'id' | 'title' | 'thumbnail' | 'price' | 'discountPercentage' | 'stock'
>;

export interface CartState {
  items: CartItem[];
  isHydrated: boolean; // true once the saved cart has been read from AsyncStorage
  couponCode: string | null; // coupon the person applied (checked again against the cart total)
}

export type CartAction =
  | { type: 'CART_HYDRATE'; payload: CartItem[] }
  | { type: 'CART_ADD'; payload: CartItem }
  | { type: 'CART_SET_QUANTITY'; payload: { productId: number; quantity: number } }
  | { type: 'CART_REMOVE'; payload: number }
  | { type: 'CART_CLEAR' }
  | { type: 'COUPON_SET'; payload: string | null };

export interface CartTotals {
  total: number; // price before discounts
  discountedTotal: number; // what the customer pays
  totalProducts: number; // number of different products
  totalQuantity: number; // number of units (shown on the tab badge)
}

export type AddToCartResult = 'added' | 'out_of_stock' | 'max_reached';

export const initialCartState: CartState = { items: [], isHydrated: false, couponCode: null };

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
      return { items: action.payload, isHydrated: true, couponCode: null };

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
      return { ...state, items: [], couponCode: null }; // a used coupon goes away with the cart

    case 'COUPON_SET':
      return { ...state, couponCode: action.payload };

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
  /** The applied coupon (null if none / unknown) */
  coupon: Coupon | null;
  /** Dollars the coupon takes off right now (0 if the cart is too small for it) */
  couponDiscount: number;
  /** Set when an applied coupon can't be used any more (e.g. the cart got smaller) */
  couponError: string | null;
  /** discountedTotal minus the coupon: what the customer really pays */
  payableTotal: number;
  /** Returns an error message to show, or null when the coupon was applied. */
  applyCoupon: (code: string) => string | null;
  removeCoupon: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialCartState);

  // Whose cart is this? (null = nobody logged in)
  const { user } = useAuth();
  const owner = user?.username ?? null;
  // Which account's cart is currently loaded into `state`. Stops us from saving one
  // account's items under another account's name while switching.
  const loadedOwner = useRef<string | null>(null);

  // 1. Load the cart (and coupon) of whoever is logged in; again every time the account changes
  useEffect(() => {
    let cancelled = false;
    loadedOwner.current = null;
    dispatch({ type: 'CART_HYDRATE', payload: [] }); // never show the previous account's items
    if (!owner) return;

    Promise.all([cartStorage.getCart(owner), couponStorage.get(owner)])
      .then(([saved, savedCoupon]) => {
        if (cancelled) return;
        loadedOwner.current = owner;
        dispatch({ type: 'CART_HYDRATE', payload: saved });
        dispatch({ type: 'COUPON_SET', payload: savedCoupon });
      })
      .catch(() => {
        if (cancelled) return;
        loadedOwner.current = owner;
        dispatch({ type: 'CART_HYDRATE', payload: [] });
      });
    return () => {
      cancelled = true;
    };
  }, [owner]);

  // 2. Save whenever the items change (only once THIS account's cart has been loaded)
  useEffect(() => {
    if (!owner || loadedOwner.current !== owner) return;
    cartStorage.setCart(owner, state.items).catch((error: unknown) => {
      console.error('Failed to save cart:', error);
    });
  }, [state.items, owner]);

  // 3. Same for the applied coupon
  useEffect(() => {
    if (!owner || loadedOwner.current !== owner) return;
    couponStorage.set(owner, state.couponCode).catch((error: unknown) => {
      console.error('Failed to save coupon:', error);
    });
  }, [state.couponCode, owner]);

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

  // The coupon is checked against the cart every time, so it stops counting if the
  // cart drops below its minimum spend
  const couponResult = useMemo(
    () => evaluateCoupon(state.couponCode, totals.discountedTotal),
    [state.couponCode, totals.discountedTotal]
  );

  const applyCoupon = useCallback(
    (code: string): string | null => {
      const result = evaluateCoupon(code, totals.discountedTotal);
      if (!code.trim()) return 'Enter a coupon code';
      if (result.error || !result.coupon) return result.error ?? 'That coupon code is not valid';
      dispatch({ type: 'COUPON_SET', payload: result.coupon.code });
      return null;
    },
    [totals.discountedTotal]
  );

  const removeCoupon = useCallback(() => {
    dispatch({ type: 'COUPON_SET', payload: null });
  }, []);

  const value = useMemo<CartContextType>(
    () => ({
      items: state.items,
      isHydrated: state.isHydrated,
      ...totals,
      coupon: couponResult.coupon,
      couponDiscount: couponResult.discount,
      couponError: couponResult.error,
      payableTotal: Math.round((totals.discountedTotal - couponResult.discount) * 100) / 100,
      addToCart,
      restoreItem,
      updateQuantity,
      removeFromCart,
      clearCart,
      applyCoupon,
      removeCoupon,
    }),
    [
      state.items,
      state.isHydrated,
      totals,
      couponResult,
      addToCart,
      restoreItem,
      updateQuantity,
      removeFromCart,
      clearCart,
      applyCoupon,
      removeCoupon,
    ]
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