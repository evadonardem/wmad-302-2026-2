import { TRACKING_SCHEDULE, formatTrackingTime, getTracking, resolveOrderStatus } from '@/utils/tracking';

const placedAt = '2026-11-20T01:00:00.000Z';
const at = (ms: number) => new Date(new Date(placedAt).getTime() + ms);
const order = (overrides = {}) => ({ status: 'Processing' as const, placedAt, ...overrides });

describe('getTracking', () => {
  it('starts at "Order placed" right after the order is made', () => {
    const t = getTracking(order(), at(0));
    expect(t.status).toBe('Processing');
    expect(t.steps.map((s) => s.state)).toEqual(['current', 'upcoming', 'upcoming', 'upcoming']);
    expect(t.isDelivered).toBe(false);
  });

  it('moves to Processing, then Shipped, then Delivered as time passes', () => {
    expect(getTracking(order(), at(TRACKING_SCHEDULE.processing)).steps.map((s) => s.state)).toEqual([
      'done',
      'current',
      'upcoming',
      'upcoming',
    ]);

    const shipped = getTracking(order(), at(TRACKING_SCHEDULE.shipped));
    expect(shipped.status).toBe('Shipped');
    expect(shipped.steps.map((s) => s.state)).toEqual(['done', 'done', 'current', 'upcoming']);

    const delivered = getTracking(order(), at(TRACKING_SCHEDULE.delivered));
    expect(delivered.status).toBe('Delivered');
    expect(delivered.isDelivered).toBe(true);
    expect(delivered.steps.every((s) => s.state === 'done')).toBe(true);
  });

  it('stamps reached steps with a time and leaves upcoming ones empty', () => {
    const t = getTracking(order(), at(TRACKING_SCHEDULE.shipped + 1000));
    expect(t.steps[0].at).toBe(placedAt);
    expect(t.steps[2].at).toBe(at(TRACKING_SCHEDULE.shipped).toISOString());
    expect(t.steps[3].at).toBeNull();
  });

  it('gives an estimated delivery until the order arrives', () => {
    expect(getTracking(order(), at(1000)).estimatedDelivery).toBe(at(TRACKING_SCHEDULE.delivered).toISOString());
    expect(getTracking(order(), at(TRACKING_SCHEDULE.delivered)).estimatedDelivery).toBeNull();
  });

  it('never moves an order backwards from its saved status', () => {
    expect(getTracking(order({ status: 'Delivered' }), at(0)).status).toBe('Delivered');
    expect(getTracking(order({ status: 'Shipped' }), at(0)).status).toBe('Shipped');
  });

  it('treats a clock set before the order was placed as "just placed"', () => {
    expect(getTracking(order(), at(-60000)).status).toBe('Processing');
  });

  it('uses the saved status for past orders with no date', () => {
    const t = getTracking({ status: 'Delivered', placedAt: null }, new Date());
    expect(t.isDelivered).toBe(true);
    expect(t.steps.every((s) => s.state === 'done' && s.at === null)).toBe(true);
    expect(t.estimatedDelivery).toBeNull();
  });

  it('copes with an invalid date', () => {
    const t = getTracking({ status: 'Processing', placedAt: 'not a date' }, new Date());
    expect(t.status).toBe('Processing');
    expect(t.estimatedDelivery).toBeNull();
  });
});

describe('resolveOrderStatus', () => {
  it('updates the status for the current time', () => {
    expect(resolveOrderStatus(order(), at(TRACKING_SCHEDULE.shipped)).status).toBe('Shipped');
  });

  it('returns the same object when nothing changed', () => {
    const o = order();
    expect(resolveOrderStatus(o, at(0))).toBe(o);
  });

  it('keeps the rest of the order untouched', () => {
    const o = { ...order(), id: 'ORD-1', total: 50 };
    expect(resolveOrderStatus(o, at(TRACKING_SCHEDULE.delivered))).toEqual({ ...o, status: 'Delivered' });
  });
});

describe('formatTrackingTime', () => {
  it('returns an empty string for missing or invalid dates', () => {
    expect(formatTrackingTime(null)).toBe('');
    expect(formatTrackingTime('nope')).toBe('');
  });

  it('formats a real date', () => {
    expect(formatTrackingTime(placedAt)).not.toBe('');
  });
});
