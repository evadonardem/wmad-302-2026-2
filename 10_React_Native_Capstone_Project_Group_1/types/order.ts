/**
 * Order types. DummyJSON does not persist carts created with POST /carts/add,
 * so orders placed in the app are also kept locally (AsyncStorage) and merged
 * with the carts returned by GET /carts/user/{id}.
 */
import { CartItem } from '@/types/product';

export type PaymentMethod = 'cod' | 'card';

export interface ShippingInfo {
  fullName: string;
  phone: string;
  line1: string;
  city: string;
  postalCode: string;
}

export type OrderStatus = 'processing' | 'completed' | 'cancelled';

export interface Order {
  /** Unique local id, e.g. "ORD-1700000000000" or "CART-12" for remote carts */
  id: string;
  userId: number;
  /** id returned by DummyJSON (POST /carts/add or GET /carts/user) */
  cartId: number;
  source: 'local' | 'remote';
  status: OrderStatus;
  /** ISO string - remote carts have no date */
  createdAt?: string;
  /** ISO string - set when the order was cancelled */
  cancelledAt?: string;
  items: CartItem[];
  subtotal: number;
  discountedTotal: number;
  totalQuantity: number;
  shipping?: ShippingInfo;
  paymentMethod?: PaymentMethod;
}

export interface OrdersState {
  orders: Order[];
  isHydrated: boolean;
}

export type OrdersAction =
  | { type: 'ORDERS_HYDRATE'; payload: Order[] }
  | { type: 'ORDER_ADD'; payload: Order }
  | { type: 'ORDER_CANCEL'; payload: { id: string; cancelledAt: string } };