/**
 * Pure cart helpers (no React) so they are easy to unit test.
 */
import type { CartAction, CartItem, CartState, CartTotals, Product } from '@/types/product';

export const initialCartState: CartState = { items: [], hydrated: false };

/** Price of one unit after the product's discount. */
export function getDiscountedPrice(price: number, discountPercentage: number): number {
  return price * (1 - discountPercentage / 100);
}

/** Build a cart line from a product. */
export function productToCartItem(product: Product, quantity: number = 1): CartItem {
  return {
    productId: product.id,
    title: product.title,
    thumbnail: product.thumbnail,
    price: product.price,
    discountPercentage: product.discountPercentage,
    quantity,
    stock: product.stock,
  };
}

/** Clamp a quantity to the available stock. */
function clampToStock(quantity: number, stock: number): number {
  return Math.min(quantity, Math.max(stock, 0));
}

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'CART_HYDRATE':
      return { items: action.payload, hydrated: true };

    case 'CART_ADD': {
      const incoming = action.payload;
      const existing = state.items.find((i) => i.productId === incoming.productId);
      if (existing) {
        const quantity = clampToStock(existing.quantity + incoming.quantity, existing.stock);
        return {
          ...state,
          items: state.items.map((i) =>
            i.productId === incoming.productId ? { ...i, quantity } : i
          ),
        };
      }
      const quantity = clampToStock(incoming.quantity, incoming.stock);
      if (quantity <= 0) return state;
      return { ...state, items: [...state.items, { ...incoming, quantity }] };
    }

    case 'CART_REMOVE':
      return {
        ...state,
        items: state.items.filter((i) => i.productId !== action.payload.productId),
      };

    case 'CART_SET_QUANTITY': {
      const { productId, quantity } = action.payload;
      if (quantity <= 0) {
        return { ...state, items: state.items.filter((i) => i.productId !== productId) };
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.productId === productId ? { ...i, quantity: clampToStock(quantity, i.stock) } : i
        ),
      };
    }

    case 'CART_CLEAR':
      return { ...state, items: [] };

    default:
      return state;
  }
}

export function calculateTotals(items: CartItem[]): CartTotals {
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const total = items.reduce(
    (sum, i) => sum + getDiscountedPrice(i.price, i.discountPercentage) * i.quantity,
    0
  );
  return {
    subtotal,
    discount: subtotal - total,
    total,
    totalProducts: items.length,
    totalQuantity: items.reduce((sum, i) => sum + i.quantity, 0),
  };
}
