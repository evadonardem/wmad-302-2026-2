/**
 * Cart reducer (pure). Quantities are always clamped to the product's stock.
 */
import { CartAction, CartState } from '@/types/cart';

export const initialCartState: CartState = { items: [], isHydrated: false };

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'CART_HYDRATE':
      return { items: action.payload, isHydrated: true };

    case 'CART_ADD_ITEM': {
      const incoming = action.payload;
      if (incoming.stock <= 0 || incoming.quantity <= 0) return state;

      const existing = state.items.find((i) => i.productId === incoming.productId);
      if (existing) {
        const quantity = Math.min(existing.quantity + incoming.quantity, incoming.stock);
        return {
          ...state,
          items: state.items.map((i) =>
            i.productId === incoming.productId ? { ...i, ...incoming, quantity } : i
          ),
        };
      }
      return {
        ...state,
        items: [...state.items, { ...incoming, quantity: Math.min(incoming.quantity, incoming.stock) }],
      };
    }

    case 'CART_UPDATE_QUANTITY': {
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

    case 'CART_REMOVE_ITEM':
      return { ...state, items: state.items.filter((i) => i.productId !== action.payload.productId) };

    case 'CART_CLEAR':
      return { ...state, items: [] };

    default:
      return state;
  }
}
