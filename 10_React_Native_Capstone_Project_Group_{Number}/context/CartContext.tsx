import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { CartItem, Product } from '@/types/product';
import { cartStorage } from '@/utils/storage';
import {
  calculateCouponDiscount,
  CouponDefinition,
  getCouponByCode,
} from '@/utils/coupons';

interface CartContextValue {
  items: CartItem[];
  isLoading: boolean;
  totalQuantity: number;
  subtotal: number;
  discountedTotal: number;
  appliedCoupon: CouponDefinition | null;
  couponDiscount: number;
  totalAfterCoupon: number;
  addItem: (product: Product, quantity?: number) => Promise<void>;
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: () => void;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  removeItem: (productId: number) => Promise<void>;
  removeItems: (productIds: number[]) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [appliedCoupon, setAppliedCoupon] = useState<CouponDefinition | null>(null);
  const itemsRef = useRef<CartItem[]>([]);

  useEffect(() => {
    let active = true;
    cartStorage
      .getCart()
      .then((storedItems) => {
        if (active) {
          itemsRef.current = storedItems;
          setItems(storedItems);
        }
      })
      .catch((error: unknown) => {
        console.error('Failed to load cart:', error);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const saveItems = useCallback(async (nextItems: CartItem[]) => {
    await cartStorage.setCart(nextItems);
    itemsRef.current = nextItems;
    setItems(nextItems);
  }, []);

  const addItem = useCallback(
    async (product: Product, quantity = 1) => {
      if (!Number.isInteger(quantity) || quantity < 1) {
        throw new Error('Choose a valid quantity.');
      }

      const currentItems = itemsRef.current;
      const existing = currentItems.find((item) => item.productId === product.id);
      const nextQuantity = (existing?.quantity ?? 0) + quantity;
      if (nextQuantity > product.stock) {
        throw new Error(`Only ${product.stock} item(s) are available.`);
      }

      const nextItems = existing
        ? currentItems.map((item) =>
            item.productId === product.id ? { ...item, quantity: nextQuantity } : item
          )
        : [
            ...currentItems,
            {
              productId: product.id,
              title: product.title,
              thumbnail: product.thumbnail,
              price: product.price,
              discountPercentage: product.discountPercentage,
              quantity,
              stock: product.stock,
            },
          ];
      await saveItems(nextItems);
    },
    [saveItems]
  );

  const updateQuantity = useCallback(
    async (productId: number, quantity: number) => {
      const item = itemsRef.current.find((entry) => entry.productId === productId);
      if (!item) return;
      if (!Number.isInteger(quantity) || quantity < 1) {
        throw new Error('Quantity must be at least one.');
      }
      if (quantity > item.stock) {
        throw new Error(`Only ${item.stock} item(s) are available.`);
      }
      await saveItems(
        itemsRef.current.map((entry) =>
          entry.productId === productId ? { ...entry, quantity } : entry
        )
      );
    },
    [saveItems]
  );

  const removeItem = useCallback(
    async (productId: number) => {
      const nextItems = itemsRef.current.filter((item) => item.productId !== productId);
      await saveItems(nextItems);
      if (nextItems.length === 0) setAppliedCoupon(null);
    },
    [saveItems]
  );

  const removeItems = useCallback(
    async (productIds: number[]) => {
      const removedIds = new Set(productIds);
      if (removedIds.size === 0) return;
      const nextItems = itemsRef.current.filter((item) => !removedIds.has(item.productId));
      await saveItems(nextItems);
      if (nextItems.length === 0) setAppliedCoupon(null);
    },
    [saveItems]
  );

  const applyCoupon = useCallback(async (code: string) => {
    if (itemsRef.current.length === 0) {
      throw new Error('Add an item to your cart before applying a coupon.');
    }
    const coupon = getCouponByCode(code);
    if (!coupon) {
      throw new Error('That coupon code is not valid. Try KARTORA10 or WELCOME5.');
    }
    setAppliedCoupon(coupon);
  }, []);

  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null);
  }, []);

  const clearCart = useCallback(async () => {
    await cartStorage.clear();
    itemsRef.current = [];
    setItems([]);
    setAppliedCoupon(null);
  }, []);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountedTotal = items.reduce(
    (sum, item) =>
      sum + item.price * (1 - item.discountPercentage / 100) * item.quantity,
    0
  );
  const couponDiscount = calculateCouponDiscount(appliedCoupon, discountedTotal);
  const totalAfterCoupon = Number((discountedTotal - couponDiscount).toFixed(2));
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        isLoading,
        totalQuantity,
        subtotal,
        discountedTotal,
        appliedCoupon,
        couponDiscount,
        totalAfterCoupon,
        addItem,
        applyCoupon,
        removeCoupon,
        updateQuantity,
        removeItem,
        removeItems,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
