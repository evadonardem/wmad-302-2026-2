/**
 * Order tracking helpers (pure functions, easy to unit test)
 *
 * DummyJSON has no shipping API, so tracking is simulated on the device: an order moves
 * through its steps as time passes after `placedAt`. Change TRACKING_SCHEDULE to make
 * orders move faster or slower (the values are in milliseconds after the order was placed).
 *
 * - getTracking: the timeline steps, the current status and the estimated delivery
 * - resolveOrderStatus: the same order, with `status` brought up to date
 */

import type { Order } from '@/types/product';

export type TrackingStepKey = 'placed' | 'processing' | 'shipped' | 'delivered';
export type TrackingStepState = 'done' | 'current' | 'upcoming';

export interface TrackingStep {
  key: TrackingStepKey;
  label: string;
  description: string;
  state: TrackingStepState;
  /** ISO time the step was reached; null if it has not happened yet or the order has no date */
  at: string | null;
}

export interface Tracking {
  status: Order['status'];
  steps: TrackingStep[];
  /** ISO time the order should arrive; null once delivered or when the order has no date */
  estimatedDelivery: string | null;
  isDelivered: boolean;
}

const SECOND = 1000;
const MINUTE = 60 * SECOND;

/** Demo timings: a new order is delivered 5 minutes after it is placed. */
export const TRACKING_SCHEDULE: Record<TrackingStepKey, number> = {
  placed: 0,
  processing: 30 * SECOND,
  shipped: 2 * MINUTE,
  delivered: 5 * MINUTE,
};

const STEP_DEFINITIONS: { key: TrackingStepKey; label: string; description: string }[] = [
  { key: 'placed', label: 'Order placed', description: 'We received your order' },
  { key: 'processing', label: 'Processing', description: 'Your items are being packed' },
  { key: 'shipped', label: 'Shipped', description: 'Your order is on its way' },
  { key: 'delivered', label: 'Delivered', description: 'Your order has arrived' },
];

/** The furthest step an order has already reached when we only know its saved status. */
const STATUS_FLOOR_INDEX: Record<Order['status'], number> = {
  Processing: 0,
  Shipped: 2,
  Delivered: 3,
};

function parseDate(iso: string | null | undefined): Date | null {
  if (!iso) return null;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date;
}

function statusForIndex(index: number): Order['status'] {
  if (index >= 3) return 'Delivered';
  if (index >= 2) return 'Shipped';
  return 'Processing';
}

export function getTracking(order: Pick<Order, 'status' | 'placedAt'>, now: Date = new Date()): Tracking {
  const placed = parseDate(order.placedAt);
  const lastIndex = STEP_DEFINITIONS.length - 1;

  // How far has the clock taken this order? (Orders with no date can only use their saved status.)
  let reachedIndex = STATUS_FLOOR_INDEX[order.status] ?? 0;
  if (placed) {
    const elapsed = now.getTime() - placed.getTime();
    STEP_DEFINITIONS.forEach((step, index) => {
      if (elapsed >= TRACKING_SCHEDULE[step.key]) reachedIndex = Math.max(reachedIndex, index);
    });
  }

  const steps: TrackingStep[] = STEP_DEFINITIONS.map((step, index) => {
    // The last step has nothing after it, so reaching it means it is done
    const state: TrackingStepState =
      index < reachedIndex || (index === reachedIndex && index === lastIndex)
        ? 'done'
        : index === reachedIndex
          ? 'current'
          : 'upcoming';
    const at =
      placed && index <= reachedIndex
        ? new Date(placed.getTime() + TRACKING_SCHEDULE[step.key]).toISOString()
        : null;
    return { ...step, state, at };
  });

  const isDelivered = reachedIndex >= lastIndex;
  const estimatedDelivery =
    placed && !isDelivered ? new Date(placed.getTime() + TRACKING_SCHEDULE.delivered).toISOString() : null;

  return { status: statusForIndex(reachedIndex), steps, estimatedDelivery, isDelivered };
}

/** Same order, with `status` brought up to date for the current time. */
export function resolveOrderStatus<T extends Pick<Order, 'status' | 'placedAt'>>(order: T, now: Date = new Date()): T {
  const { status } = getTracking(order, now);
  return status === order.status ? order : { ...order, status };
}

/** "Nov 20, 9:41 AM" - date and time, because orders move in minutes/hours. */
export function formatTrackingTime(iso: string | null): string {
  const date = parseDate(iso);
  return date
    ? date.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
    : '';
}
