import type { DeliveryStatus, DeliveryTracking } from '@/types/product';

export const DELIVERY_STATUSES: DeliveryStatus[] = [
  'processing',
  'shipped',
  'outForDelivery',
  'delivered',
];

export function createOrderTracking(
  userId: number,
  orderId: number,
  now = new Date()
): DeliveryTracking {
  const placedAt = now.toISOString();
  const estimatedDelivery = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString();
  return {
    trackingNumber: `MP-${userId}-${orderId}`,
    status: 'processing',
    placedAt,
    estimatedDelivery,
    updates: [{ status: 'processing', timestamp: placedAt }],
  };
}

export function createDeliveredOrderTracking(
  userId: number,
  orderId: number,
  now = new Date()
): DeliveryTracking {
  const placedAt = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000);
  let tracking = createOrderTracking(userId, orderId, placedAt);
  for (let day = 3; day >= 1; day -= 1) {
    tracking = advanceOrderTracking(
      tracking,
      new Date(now.getTime() - day * 24 * 60 * 60 * 1000)
    );
  }
  return tracking;
}

export function advanceOrderTracking(
  tracking: DeliveryTracking,
  now = new Date()
): DeliveryTracking {
  const currentIndex = DELIVERY_STATUSES.indexOf(tracking.status);
  const nextStatus = DELIVERY_STATUSES[Math.min(currentIndex + 1, DELIVERY_STATUSES.length - 1)];
  if (nextStatus === tracking.status) return tracking;

  return {
    ...tracking,
    status: nextStatus,
    updates: [...tracking.updates, { status: nextStatus, timestamp: now.toISOString() }],
  };
}
