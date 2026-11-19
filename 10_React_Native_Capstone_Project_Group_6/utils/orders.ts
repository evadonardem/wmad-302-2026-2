/**
 * Order helpers (pure functions, easy to unit test)
 * - validateShipping: checkout form rules
 * - buildOrder: turns the cart + form into an Order we can save
 * - apiCartToOrder: turns a DummyJSON cart (GET /carts/user/{id}) into an Order
 */

import { Cart, CartItem, Order, PaymentMethod, ShippingInfo } from '@/types/product';
import { calculateTotals } from '@/context/CartContext';

export const PAYMENT_METHODS: { value: PaymentMethod; label: string; description: string }[] = [
  { value: 'cod', label: 'Cash on Delivery', description: 'Pay when your order arrives' },
  { value: 'gcash', label: 'GCash', description: 'Pay with your e-wallet' },
  { value: 'card', label: 'Credit / Debit Card', description: 'Visa, Mastercard' },
];

export type ShippingErrors = Partial<Record<keyof ShippingInfo, string>>;

/** Returns an error message for each invalid field. An empty object means the form is valid. */
export function validateShipping(form: ShippingInfo): ShippingErrors {
  const errors: ShippingErrors = {};

  if (form.fullName.trim().length < 2) errors.fullName = 'Enter your full name';

  // Allow spaces, dashes, brackets and a leading "+"; need 7-15 digits
  const phoneDigits = form.phone.replace(/[\s\-()+]/g, '');
  if (!/^\d{7,15}$/.test(phoneDigits)) errors.phone = 'Enter a valid phone number (7-15 digits)';

  if (form.address.trim().length < 5) errors.address = 'Enter your street address';
  if (form.city.trim().length < 2) errors.city = 'Enter your city';
  if (!/^\d{4,6}$/.test(form.postalCode.trim())) errors.postalCode = 'Enter a 4-6 digit postal code';

  return errors;
}

export function buildOrder(params: {
  userId: number;
  owner: string; // username of the account placing the order
  items: CartItem[];
  shipping: ShippingInfo;
  paymentMethod: PaymentMethod;
  now?: Date;
}): Order {
  const { userId, owner, items, shipping, paymentMethod, now = new Date() } = params;
  const totals = calculateTotals(items);
  return {
    id: `ORD-${now.getTime()}`,
    userId,
    owner,
    placedAt: now.toISOString(),
    status: 'Processing',
    items: items.map((i) => ({
      productId: i.productId,
      title: i.title,
      thumbnail: i.thumbnail,
      price: i.price,
      discountPercentage: i.discountPercentage,
      quantity: i.quantity,
    })),
    total: totals.total,
    discountedTotal: totals.discountedTotal,
    totalQuantity: totals.totalQuantity,
    shipping: { ...shipping },
    paymentMethod,
  };
}

/** DummyJSON carts are sample "past orders": no date, no address, already delivered. */
export function apiCartToOrder(cart: Cart): Order {
  return {
    id: `CART-${cart.id}`,
    userId: cart.userId,
    placedAt: null,
    status: 'Delivered',
    items: cart.products.map((p) => ({
      productId: p.id,
      title: p.title,
      thumbnail: p.thumbnail,
      price: p.price,
      discountPercentage: p.discountPercentage,
      quantity: p.quantity,
    })),
    total: cart.total,
    discountedTotal: cart.discountedTotal,
    totalQuantity: cart.totalQuantity,
  };
}

/** Short number to show people: "ORD-1731999999999" -> "#999999", "CART-51" -> "#51" */
export function getOrderNumber(order: Pick<Order, 'id'>): string {
  const [prefix, rest] = order.id.split('-');
  return prefix === 'ORD' ? `#${rest.slice(-6)}` : `#${rest}`;
}

export function formatOrderDate(iso: string | null): string {
  if (!iso) return 'Past order';
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? 'Past order'
    : date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

/**
 * Does this saved order belong to the logged-in person?
 * Accounts made with Register all share the test account's user id (DummyJSON
 * doesn't really create users), so we match on username instead. Orders saved
 * before this rule have no owner: only real (non-registered) accounts see those.
 */
export function belongsToUser(
  order: Pick<Order, 'owner' | 'userId'>,
  user: { id: number; username: string; isSimulated?: boolean }
): boolean {
  if (order.owner) return order.owner === user.username;
  return !user.isSimulated && order.userId === user.id;
}