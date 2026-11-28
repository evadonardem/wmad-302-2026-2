/**
 * Coupons (pure functions, easy to unit test)
 * DummyJSON has no coupon endpoint, so the codes live here in the app.
 * A coupon takes money off the price AFTER the product discounts.
 */

export interface Coupon {
  code: string;
  description: string;
  type: 'percent' | 'fixed';
  value: number; // percent (10 = 10%) or dollars
  minSpend: number; // the cart must be at least this much (after product discounts)
}

export const COUPONS: Coupon[] = [
  { code: 'WELCOME10', description: '10% off your order (min. $20)', type: 'percent', value: 10, minSpend: 20 },
  { code: 'SAVE5', description: '$5 off (min. $30)', type: 'fixed', value: 5, minSpend: 30 },
  { code: 'BIGSPENDER', description: '15% off (min. $100)', type: 'percent', value: 15, minSpend: 100 },
];

export interface CouponResult {
  coupon: Coupon | null; // null when there is no code or the code is unknown
  discount: number; // dollars taken off (0 when the coupon can't be used)
  error: string | null; // why it can't be used, ready to show to the person
}

const round2 = (n: number): number => Math.round(n * 100) / 100;

/** Codes are not case sensitive and spaces around them are ignored. */
export function findCoupon(code: string): Coupon | undefined {
  const normalized = code.trim().toUpperCase();
  return COUPONS.find((c) => c.code === normalized);
}

/** How much the coupon takes off a given amount (never more than the amount). */
export function calculateCouponDiscount(coupon: Coupon, amount: number): number {
  const raw = coupon.type === 'percent' ? (amount * coupon.value) / 100 : coupon.value;
  return round2(Math.min(Math.max(raw, 0), Math.max(amount, 0)));
}

/** Check a code against the cart amount and work out the discount. */
export function evaluateCoupon(code: string | null | undefined, amount: number): CouponResult {
  if (!code || !code.trim()) return { coupon: null, discount: 0, error: null };

  const coupon = findCoupon(code);
  if (!coupon) return { coupon: null, discount: 0, error: 'That coupon code is not valid' };

  if (amount < coupon.minSpend) {
    const missing = round2(coupon.minSpend - amount);
    return { coupon, discount: 0, error: `Spend $${missing.toFixed(2)} more to use ${coupon.code}` };
  }

  return { coupon, discount: calculateCouponDiscount(coupon, amount), error: null };
}
