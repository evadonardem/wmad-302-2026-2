import { calculateOrderStats, canCancelOrder, cartToOrder, createLocalOrder, mergeOrders } from '@/utils/orders';
import { calculateCartTotals } from '@/utils/pricing';
import { makeCartItem } from '@/test-utils/fixtures';
import { Cart } from '@/types/product';

const cart: Cart = {
  id: 5,
  userId: 1,
  total: 200,
  discountedTotal: 180,
  totalProducts: 1,
  totalQuantity: 2,
  products: [
    { id: 9, title: 'Thing', price: 100, quantity: 2, total: 200, discountPercentage: 10, discountedTotal: 180, thumbnail: 't' },
  ],
};

describe('orders utils', () => {
  it('converts a DummyJSON cart to a completed remote order', () => {
    const order = cartToOrder(cart, 1);
    expect(order).toMatchObject({
      id: 'CART-5',
      cartId: 5,
      source: 'remote',
      status: 'completed',
      subtotal: 200,
      discountedTotal: 180,
      totalQuantity: 2,
    });
    expect(order.items[0]).toMatchObject({ productId: 9, quantity: 2 });
  });

  it('creates a local order with totals and a timestamp id', () => {
    const items = [makeCartItem({ quantity: 2 })];
    const now = new Date('2026-01-02T03:04:05.000Z');
    const order = createLocalOrder({
      userId: 3,
      cartId: 51,
      items,
      totals: calculateCartTotals(items),
      shipping: { fullName: 'A', phone: '1234567', line1: 'x', city: 'y', postalCode: '2600' },
      paymentMethod: 'cod',
      now,
    });
    expect(order).toMatchObject({
      id: `ORD-${now.getTime()}`,
      source: 'local',
      status: 'processing',
      createdAt: now.toISOString(),
      subtotal: 200,
      discountedTotal: 180,
      totalQuantity: 2,
    });
  });

  it('puts newest local orders before remote ones', () => {
    const remote = cartToOrder(cart, 1);
    const older = { ...remote, id: 'o1', source: 'local' as const, createdAt: '2026-01-01T00:00:00.000Z' };
    const newer = { ...remote, id: 'o2', source: 'local' as const, createdAt: '2026-02-01T00:00:00.000Z' };
    expect(mergeOrders([older, newer], [remote]).map((o) => o.id)).toEqual(['o2', 'o1', 'CART-5']);
  });

  it('calculates stats', () => {
    expect(calculateOrderStats([cartToOrder(cart, 1), cartToOrder(cart, 1)])).toEqual({ count: 2, spent: 360 });
    expect(calculateOrderStats([])).toEqual({ count: 0, spent: 0 });
  });

  it('ignores cancelled orders in the stats', () => {
    const remote = cartToOrder(cart, 1);
    const cancelled = { ...remote, status: 'cancelled' as const };
    expect(calculateOrderStats([remote, cancelled])).toEqual({ count: 1, spent: 180 });
  });

  it('only lets local processing orders be cancelled', () => {
    const remote = cartToOrder(cart, 1);
    const local = { ...remote, source: 'local' as const, status: 'processing' as const };
    expect(canCancelOrder(local)).toBe(true);
    expect(canCancelOrder(remote)).toBe(false);
    expect(canCancelOrder({ ...local, status: 'cancelled' })).toBe(false);
  });
});