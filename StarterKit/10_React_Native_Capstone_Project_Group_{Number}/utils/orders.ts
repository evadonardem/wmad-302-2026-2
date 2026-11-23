/**
 * Map orders and API carts into one OrderSummary shape for the history screens.
 */
import type { Cart } from '@/types/product';
import type { Order, OrderSummary } from '@/types/order';

export const SERVER_ID_PREFIX = 'CART-';

export function orderToSummary(order: Order): OrderSummary {
  return {
    id: order.id,
    source: 'device',
    createdAt: order.createdAt,
    lines: order.items,
    subtotal: order.subtotal,
    discount: order.discount,
    total: order.total,
    totalQuantity: order.totalQuantity,
    shipping: order.shipping,
    paymentMethod: order.paymentMethod,
  };
}

export function cartToSummary(cart: Cart): OrderSummary {
  return {
    id: `${SERVER_ID_PREFIX}${cart.id}`,
    source: 'server',
    createdAt: null,
    lines: cart.products.map((p) => ({
      productId: p.id,
      title: p.title,
      thumbnail: p.thumbnail,
      price: p.price,
      discountPercentage: p.discountPercentage,
      quantity: p.quantity,
    })),
    subtotal: cart.total,
    discount: cart.total - cart.discountedTotal,
    total: cart.discountedTotal,
    totalQuantity: cart.totalQuantity,
  };
}

export function formatOrderDate(iso: string | null): string {
  if (!iso) return 'Previous order';
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
