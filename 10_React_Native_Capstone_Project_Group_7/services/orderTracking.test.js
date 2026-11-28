import { describe, expect, it } from '@jest/globals';
import { advanceOrderTracking, createDeliveredOrderTracking, createOrderTracking } from './orderTracking';

describe('order tracking', () => {
  const placedAt = new Date('2026-01-01T10:00:00.000Z');

  it('creates a tracking number, initial status, and estimated delivery', () => {
    const tracking = createOrderTracking(7, 42, placedAt);
    expect(tracking.trackingNumber).toBe('MP-7-42');
    expect(tracking.status).toBe('processing');
    expect(tracking.estimatedDelivery).toBe('2026-01-04T10:00:00.000Z');
  });

  it('advances one stage and stops at delivered', () => {
    let tracking = createOrderTracking(7, 42, placedAt);
    tracking = advanceOrderTracking(tracking, placedAt);
    expect(tracking.status).toBe('shipped');
    expect(tracking.updates).toHaveLength(2);
    tracking = advanceOrderTracking(tracking, placedAt);
    tracking = advanceOrderTracking(tracking, placedAt);
    const delivered = advanceOrderTracking(tracking, placedAt);
    expect(delivered.status).toBe('delivered');
    expect(advanceOrderTracking(delivered, placedAt)).toBe(delivered);
  });

  it('creates a completed timeline for historical remote carts', () => {
    const tracking = createDeliveredOrderTracking(7, 42, new Date('2026-01-10T10:00:00.000Z'));
    expect(tracking.status).toBe('delivered');
    expect(tracking.updates.map((update) => update.status)).toEqual([
      'processing',
      'shipped',
      'outForDelivery',
      'delivered',
    ]);
  });
});
