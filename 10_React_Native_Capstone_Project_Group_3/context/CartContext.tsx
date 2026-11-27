/**
 * Cart Context with useReducer + AsyncStorage Persistence
 */

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { Cart, CartItem, Product } from '@/types/product';
import { cartStorage, orderStorage, wishlistStorage } from '@/utils/storage';
import { productApi } from '@/services/productApi';

export interface CartState {
  items: CartItem[];
  wishlistIds: number[];
  couponCode: string | null;
  couponDiscountRate: number;
  total: number;
  discountedTotal: number;
  totalProducts: number;
  totalQuantity: number;
  isLoading: boolean;
  isCheckingOut: boolean;
  error: string | null;
}

export type CartAction =
  | { type: 'CART_HYDRATE'; payload: { items: CartItem[]; wishlistIds: number[] } }
  | { type: 'CART_ADD_ITEM'; payload: { product: Product; quantity?: number } }
  | { type: 'CART_UPDATE_QTY'; payload: { productId: number; quantity: number } }
  | { type: 'CART_REMOVE_ITEM'; payload: number }
  | { type: 'CART_CLEAR' }
  | { type: 'CART_APPLY_COUPON'; payload: { code: string; discountRate: number } | null }
  | { type: 'CART_CHECKOUT_START' }
  | { type: 'CART_CHECKOUT_SUCCESS' }
  | { type: 'CART_CHECKOUT_FAILURE'; payload: string }
  | { type: 'WISHLIST_SET'; payload: number[] }
  | { type: 'CART_CLEAR_ERROR' };

function computeTotals(
  items: CartItem[],
  couponDiscountRate: number
): Pick<CartState, 'total' | 'discountedTotal' | 'totalProducts' | 'totalQuantity'> {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const afterItemDiscount = items.reduce(
    (sum, item) =>
      sum + item.price * (1 - item.discountPercentage / 100) * item.quantity,
    0
  );
  const discountedTotal = Math.max(0, afterItemDiscount * (1 - couponDiscountRate));
  const totalProducts = items.length;
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    total,
    discountedTotal,
    totalProducts,
    totalQuantity,
  };
}

const initialState: CartState = {
  items: [],
  wishlistIds: [],
  couponCode: null,
  couponDiscountRate: 0,
  total: 0,
  discountedTotal: 0,
  totalProducts: 0,
  totalQuantity: 0,
  isLoading: true,
  isCheckingOut: false,
  error: null,
};

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'CART_HYDRATE': {
      const totals = computeTotals(action.payload.items, state.couponDiscountRate);
      return {
        ...state,
        items: action.payload.items,
        wishlistIds: action.payload.wishlistIds,
        ...totals,
        isLoading: false,
      };
    }

    case 'CART_ADD_ITEM': {
      const { product, quantity = 1 } = action.payload;
      if (product.stock <= 0 || quantity <= 0) return state;

      const existingIndex = state.items.findIndex((i) => i.productId === product.id);
      let nextItems: CartItem[];

      if (existingIndex >= 0) {
        const existing = state.items[existingIndex];
        const nextQty = Math.min(product.stock, existing.quantity + quantity);
        nextItems = state.items.map((item, idx) =>
          idx === existingIndex ? { ...item, quantity: nextQty, stock: product.stock } : item
        );
      } else {
        const newItem: CartItem = {
          productId: product.id,
          title: product.title,
          thumbnail: product.thumbnail,
          price: product.price,
          discountPercentage: product.discountPercentage,
          quantity: Math.min(product.stock, quantity),
          stock: product.stock,
        };
        nextItems = [...state.items, newItem];
      }

      return {
        ...state,
        items: nextItems,
        ...computeTotals(nextItems, state.couponDiscountRate),
        error: null,
      };
    }

    case 'CART_UPDATE_QTY': {
      const { productId, quantity } = action.payload;
      const nextItems =
        quantity <= 0
          ? state.items.filter((item) => item.productId !== productId)
          : state.items.map((item) =>
              item.productId === productId
                ? { ...item, quantity: Math.min(item.stock, quantity) }
                : item
            );

      return {
        ...state,
        items: nextItems,
        ...computeTotals(nextItems, state.couponDiscountRate),
      };
    }

    case 'CART_REMOVE_ITEM': {
      const nextItems = state.items.filter((item) => item.productId !== action.payload);
      return {
        ...state,
        items: nextItems,
        ...computeTotals(nextItems, state.couponDiscountRate),
      };
    }

    case 'CART_CLEAR': {
      return {
        ...state,
        items: [],
        couponCode: null,
        couponDiscountRate: 0,
        total: 0,
        discountedTotal: 0,
        totalProducts: 0,
        totalQuantity: 0,
      };
    }

    case 'CART_APPLY_COUPON': {
      const code = action.payload?.code ?? null;
      const discountRate = action.payload?.discountRate ?? 0;
      return {
        ...state,
        couponCode: code,
        couponDiscountRate: discountRate,
        ...computeTotals(state.items, discountRate),
      };
    }

    case 'CART_CHECKOUT_START':
      return { ...state, isCheckingOut: true, error: null };

    case 'CART_CHECKOUT_SUCCESS':
      return {
        ...state,
        isCheckingOut: false,
        items: [],
        couponCode: null,
        couponDiscountRate: 0,
        total: 0,
        discountedTotal: 0,
        totalProducts: 0,
        totalQuantity: 0,
      };

    case 'CART_CHECKOUT_FAILURE':
      return { ...state, isCheckingOut: false, error: action.payload };

    case 'WISHLIST_SET':
      return { ...state, wishlistIds: action.payload };

    case 'CART_CLEAR_ERROR':
      return { ...state, error: null };

    default:
      return state;
  }
}

interface CartContextType extends CartState {
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  removeItem: (productId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  applyCoupon: (rawCode: string) => { ok: boolean; message: string };
  toggleWishlist: (productId: number) => Promise<boolean>;
  checkout: (userId: number) => Promise<Cart>;
  clearError: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const VALID_COUPONS: Record<string, number> = {
  SAVE10: 0.1,
  SAVE20: 0.2,
  WELCOME15: 0.15,
};

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const [hydratedOnce, setHydratedOnce] = React.useState(false);

  useEffect(() => {
    const hydrate = async () => {
      const [savedItems, savedWishlist] = await Promise.all([
        cartStorage.getCart(),
        wishlistStorage.getIds(),
      ]);
      dispatch({
        type: 'CART_HYDRATE',
        payload: { items: savedItems, wishlistIds: savedWishlist },
      });
      setHydratedOnce(true);
    };
    hydrate();
  }, []);

  useEffect(() => {
    if (!hydratedOnce) return;
    cartStorage.setCart(state.items).catch((err) => {
      console.error('Cart persistence failed:', err);
    });
  }, [state.items, hydratedOnce]);

  const addToCart = useCallback(async (product: Product, quantity = 1) => {
    dispatch({ type: 'CART_ADD_ITEM', payload: { product, quantity } });
  }, []);

  const updateQuantity = useCallback(async (productId: number, quantity: number) => {
    dispatch({ type: 'CART_UPDATE_QTY', payload: { productId, quantity } });
  }, []);

  const removeItem = useCallback(async (productId: number) => {
    dispatch({ type: 'CART_REMOVE_ITEM', payload: productId });
  }, []);

  const clearCart = useCallback(async () => {
    dispatch({ type: 'CART_CLEAR' });
    await cartStorage.clear();
  }, []);

  const applyCoupon = useCallback((rawCode: string): { ok: boolean; message: string } => {
    const normalized = rawCode.trim().toUpperCase();
    if (!normalized) {
      dispatch({ type: 'CART_APPLY_COUPON', payload: null });
      return { ok: true, message: 'Coupon cleared.' };
    }
    const rate = VALID_COUPONS[normalized];
    if (!rate) {
      return {
        ok: false,
        message: 'Invalid code. Try SAVE10, WELCOME15, or SAVE20.',
      };
    }
    dispatch({ type: 'CART_APPLY_COUPON', payload: { code: normalized, discountRate: rate } });
    return {
      ok: true,
      message: `Coupon ${normalized} applied (${Math.round(rate * 100)}% off).`,
    };
  }, []);

  const toggleWishlist = useCallback(async (productId: number): Promise<boolean> => {
    const added = await wishlistStorage.toggleId(productId);
    const next = await wishlistStorage.getIds();
    dispatch({ type: 'WISHLIST_SET', payload: next });
    return added;
  }, []);

  const checkout = useCallback(
    async (userId: number): Promise<Cart> => {
      if (state.items.length === 0) {
        throw new Error('Your cart is empty');
      }
      dispatch({ type: 'CART_CHECKOUT_START' });
      try {
        let apiCart: Partial<Cart> | null = null;
        try {
          apiCart = await productApi.addCart({
            userId,
            products: state.items.map((item) => ({
              id: item.productId,
              quantity: item.quantity,
            })),
          });
        } catch {
          // DummyJSON /carts/add can return 404 for custom user IDs; continue locally
          apiCart = null;
        }

        const now = Date.now();
        const orderRecord: Cart = {
          id: apiCart?.id ?? now,
          products:
            apiCart?.products ??
            state.items.map((item) => {
              const lineTotal = item.price * item.quantity;
              const lineDiscounted =
                item.price * (1 - item.discountPercentage / 100) * item.quantity;
              return {
                id: item.productId,
                title: item.title,
                price: item.price,
                quantity: item.quantity,
                total: Number(lineTotal.toFixed(2)),
                discountPercentage: item.discountPercentage,
                discountedPrice: Number(lineDiscounted.toFixed(2)),
                discountedTotal: Number(lineDiscounted.toFixed(2)),
                thumbnail: item.thumbnail,
              };
            }),
          userId,
          discountedTotal: Number(state.discountedTotal.toFixed(2)),
          total: Number(state.total.toFixed(2)),
          totalQuantity: state.totalQuantity,
          totalProducts: state.totalProducts,
        };

        await orderStorage.addOrder(orderRecord);
        await cartStorage.clear();
        dispatch({ type: 'CART_CHECKOUT_SUCCESS' });
        return orderRecord;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Checkout failed';
        dispatch({ type: 'CART_CHECKOUT_FAILURE', payload: message });
        throw err;
      }
    },
    [state.items, state.discountedTotal, state.total, state.totalQuantity, state.totalProducts]
  );

  const clearError = useCallback(() => {
    dispatch({ type: 'CART_CLEAR_ERROR' });
  }, []);

  return (
    <CartContext.Provider
      value={{
        ...state,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        applyCoupon,
        toggleWishlist,
        checkout,
        clearError,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextType {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return ctx;
}