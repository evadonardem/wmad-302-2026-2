export interface Coupon {
  code: string;
  discountPercentage: number;
  minimumSubtotal: number;
}

const COUPONS: Record<string, Coupon> = {
  GREEN10: { code: 'GREEN10', discountPercentage: 10, minimumSubtotal: 0 },
  WELCOME15: { code: 'WELCOME15', discountPercentage: 15, minimumSubtotal: 100 },
  SAVE20: { code: 'SAVE20', discountPercentage: 20, minimumSubtotal: 200 },
};

export function getCoupon(code: string, subtotal: number): Coupon | null {
  const coupon = COUPONS[code.trim().toUpperCase()];
  return coupon && subtotal >= coupon.minimumSubtotal ? coupon : null;
}
