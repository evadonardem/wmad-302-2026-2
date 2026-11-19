export interface CouponDefinition {
  code: string;
  type: 'percent' | 'fixed';
  value: number;
}

export const availableCoupons: CouponDefinition[] = [
  { code: 'KARTORA10', type: 'percent', value: 10 },
  { code: 'WELCOME5', type: 'fixed', value: 5 },
];

export function getCouponByCode(code: string): CouponDefinition | undefined {
  const normalizedCode = code.trim().toUpperCase();
  return availableCoupons.find((coupon) => coupon.code === normalizedCode);
}

export function calculateCouponDiscount(
  coupon: CouponDefinition | null,
  total: number
): number {
  if (!coupon || total <= 0) return 0;
  const discount = coupon.type === 'percent'
    ? total * (coupon.value / 100)
    : coupon.value;
  return Math.min(total, Math.round(discount * 100) / 100);
}
