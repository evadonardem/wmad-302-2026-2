import { initialOrdersState, ordersReducer } from '@/context/ordersReducer';
import { Order } from '@/types/order';

const order = (id: string): Order => ({
  id,
  userId: 1,
  cartId: 1,
  source: 'local',
  status: 'processing',
  items: [],
  subtotal: 10,
  discountedTotal: 9,
  totalQuantity: 1,
});

describe('ordersReducer', () => {
  it('hydrates', () => {
    const state = ordersReducer(initialOrdersState, { type: 'ORDERS_HYDRATE', payload: [order('a')] });
    expect(state).toEqual({ orders: [order('a')], isHydrated: true });
  });

  it('adds new orders first', () => {
    const start = { orders: [order('a')], isHydrated: true };
    expect(ordersReducer(start, { type: 'ORDER_ADD', payload: order('b') }).orders.map((o) => o.id)).toEqual(['b', 'a']);
  });

  it('cancels a processing order and records when', () => {
    const start = { orders: [order('a'), order('b')], isHydrated: true };
    const state = ordersReducer(start, { type: 'ORDER_CANCEL', payload: { id: 'a', cancelledAt: '2026-12-01T00:00:00.000Z' } });
    expect(state.orders[0]).toMatchObject({ id: 'a', status: 'cancelled', cancelledAt: '2026-12-01T00:00:00.000Z' });
    expect(state.orders[1].status).toBe('processing');
  });

  it('does not cancel an order that is already completed or cancelled', () => {
    const done: Order = { ...order('a'), status: 'completed' };
    const start = { orders: [done], isHydrated: true };
    const state = ordersReducer(start, { type: 'ORDER_CANCEL', payload: { id: 'a', cancelledAt: 'x' } });
    expect(state.orders[0]).toEqual(done);
  });
});