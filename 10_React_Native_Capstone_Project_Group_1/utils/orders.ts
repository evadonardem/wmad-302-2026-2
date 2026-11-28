/**
 * Order helpers (pure): convert DummyJSON carts to orders and build new orders.
 */
import { Cart, CartItem } from '@/types/product';
import { Order, PaymentMethod, ShippingInfo } from '@/types/order';
import { CartTotals } from '@/types/cart';

/** A cart returned by GET /carts/user/{id} is treated as a completed order. */
export function cartToOrder(cart: Cart, userId: number): Order {
  const items: CartItem[] = cart.products.map((p) => ({
    productId: p.id,
    title: p.title,
    thumbnail: p.thumbnail,
    price: p.price,
    discountPercentage: p.discountPercentage,
    quantity: p.quantity,
    stock: 0,
  }));
  return {
    id: `CART-${cart.id}`,
    userId,
    cartId: cart.id,
    source: 'remote',
    status: 'completed',
    items,
    subtotal: cart.total,
    discountedTotal: cart.discountedTotal,
    totalQuantity: cart.totalQuantity,
  };
}

interface NewOrderInput {
  userId: number;
  cartId: number;
  items: CartItem[];
  totals: CartTotals;
  shipping: ShippingInfo;
  paymentMethod: PaymentMethod;
  now?: Date;
}

export function createLocalOrder({
  userId,
  cartId,
  items,
  totals,
  shipping,
  paymentMethod,
  now = new Date(),
}: NewOrderInput): Order {
  return {
    id: `ORD-${now.getTime()}`,
    userId,
    cartId,
    source: 'local',
    status: 'processing',
    createdAt: now.toISOString(),
    items,
    subtotal: totals.subtotal,
    discountedTotal: totals.discountedTotal,
    totalQuantity: totals.totalQuantity,
    shipping,
    paymentMethod,
  };
}

/** Local (newest first) followed by remote orders. */
export function mergeOrders(local: Order[], remote: Order[]): Order[] {
  const sortedLocal = [...local].sort(
    (a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
  );
  return [...sortedLocal, ...remote];
}

/** Cancelled orders don't count towards the order total or the amount spent. */
export function calculateOrderStats(orders: Order[]): { count: number; spent: number } {
  const active = orders.filter((o) => o.status !== 'cancelled');
  return {
    count: active.length,
    spent: active.reduce((sum, o) => sum + o.discountedTotal, 0),
  };
}

/** Only orders placed on this device and still processing can be cancelled. */
export function canCancelOrder(order: Order): boolean {
  return order.source === 'local' && order.status === 'processing';
}