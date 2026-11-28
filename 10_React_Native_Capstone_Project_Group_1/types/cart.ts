/**
 * Local shopping cart types (persisted with AsyncStorage)
 */
import { CartItem } from '@/types/product';

export interface CartState {
  items: CartItem[];
  /** False until the persisted cart has been read from storage. */
  isHydrated: boolean;
}

export type CartAction =
  | { type: 'CART_HYDRATE'; payload: CartItem[] }
  | { type: 'CART_ADD_ITEM'; payload: CartItem }
  | { type: 'CART_UPDATE_QUANTITY'; payload: { productId: number; quantity: number } }
  | { type: 'CART_REMOVE_ITEM'; payload: { productId: number } }
  | { type: 'CART_CLEAR' };

export interface CartTotals {
  /** Sum of undiscounted prices */
  subtotal: number;
  /** Sum after per-product discounts */
  discountedTotal: number;
  /** subtotal - discountedTotal */
  savings: number;
  totalQuantity: number;
  /** Number of distinct products */
  totalProducts: number;
}
