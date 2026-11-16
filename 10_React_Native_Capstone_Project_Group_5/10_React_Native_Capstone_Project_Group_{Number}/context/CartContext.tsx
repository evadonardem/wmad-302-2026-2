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

interface CartContextValue {
  items: CartItem[];
  isLoading: boolean;
  totalQuantity: number;
  subtotal: number;
  discountedTotal: number;
  addItem: (product: Product, quantity?: number) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  removeItem: (productId: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
      await saveItems(itemsRef.current.filter((item) => item.productId !== productId));
    },
    [saveItems]
  );

  const clearCart = useCallback(async () => {
    await cartStorage.clear();
    itemsRef.current = [];
    setItems([]);
  }, []);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountedTotal = items.reduce(
    (sum, item) =>
      sum + item.price * (1 - item.discountPercentage / 100) * item.quantity,
    0
  );
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        isLoading,
        totalQuantity,
        subtotal,
        discountedTotal,
        addItem,
        updateQuantity,
        removeItem,
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
