/**
 * Order types. DummyJSON does not save carts created with POST /carts/add,
 * so each placed order is also stored on the device (see ordersStorage).
 */

export type PaymentMethod = 'cod' | 'card';

export interface ShippingDetails {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
}

export interface OrderLine {
  productId: number;
  title: string;
  thumbnail: string;
  price: number;
  discountPercentage: number;
  quantity: number;
}

export interface Order {
  id: string;
  /** Cart id returned by POST /carts/add. */
  cartId: number;
  userId: number;
  /** ISO date string. */
  createdAt: string;
  items: OrderLine[];
  subtotal: number;
  discount: number;
  total: number;
  totalQuantity: number;
  shipping: ShippingDetails;
  paymentMethod: PaymentMethod;
}

/** Display model that covers both on-device orders and carts from the API. */
export interface OrderSummary {
  id: string;
  source: 'device' | 'server';
  /** ISO date; null for carts returned by the API (it has no date). */
  createdAt: string | null;
  lines: OrderLine[];
  subtotal: number;
  discount: number;
  total: number;
  totalQuantity: number;
  shipping?: ShippingDetails;
  paymentMethod?: PaymentMethod;
}
