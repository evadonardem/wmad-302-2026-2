import { cartToSummary, formatOrderDate, orderToSummary } from '@/utils/orders';
import type { Cart } from '@/types/product';
import type { Order } from '@/types/order';

const cart: Cart = {
  id: 5,
  userId: 1,
  total: 200,
  discountedTotal: 180,
  totalProducts: 1,
  totalQuantity: 2,
  products: [
    { id: 9, title: 'Lamp', price: 100, quantity: 2, total: 200, discountPercentage: 10, discountedTotal: 180, thumbnail: 't.png' },
  ],
};

describe('cartToSummary', () => {
  it('maps an API cart to a server order summary', () => {
    const summary = cartToSummary(cart);
    expect(summary.id).toBe('CART-5');
    expect(summary.source).toBe('server');
    expect(summary.createdAt).toBeNull();
    expect(summary.total).toBe(180);
    expect(summary.discount).toBe(20);
    expect(summary.lines[0]).toMatchObject({ productId: 9, quantity: 2 });
  });
});

describe('orderToSummary', () => {
  it('keeps shipping and payment details for device orders', () => {
    const order: Order = {
      id: 'ORD-1',
      cartId: 1,
      userId: 1,
      createdAt: '2026-01-15T10:00:00.000Z',
      items: [],
      subtotal: 10,
      discount: 1,
      total: 9,
      totalQuantity: 1,
      shipping: { fullName: 'A', phone: '1234567', address: 'Street 1', city: 'X', postalCode: '1000' },
      paymentMethod: 'cod',
    };
    const summary = orderToSummary(order);
    expect(summary.source).toBe('device');
    expect(summary.shipping?.city).toBe('X');
    expect(summary.paymentMethod).toBe('cod');
  });
});

describe('formatOrderDate', () => {
  it('labels orders without a date', () => {
    expect(formatOrderDate(null)).toBe('Previous order');
  });
  it('formats a real date', () => {
    expect(formatOrderDate('2026-01-15T10:00:00.000Z')).toMatch(/2026/);
  });
});
