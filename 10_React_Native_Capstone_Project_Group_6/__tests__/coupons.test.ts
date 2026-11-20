import { COUPONS, calculateCouponDiscount, evaluateCoupon, findCoupon } from '@/utils/coupons';

describe('findCoupon', () => {
  it('finds a code ignoring case and spaces', () => {
    expect(findCoupon('welcome10')?.code).toBe('WELCOME10');
    expect(findCoupon('  Save5 ')?.code).toBe('SAVE5');
  });

  it('returns nothing for an unknown code', () => {
    expect(findCoupon('FREEMONEY')).toBeUndefined();
    expect(findCoupon('')).toBeUndefined();
  });

  it('has unique codes', () => {
    const codes = COUPONS.map((c) => c.code);
    expect(new Set(codes).size).toBe(codes.length);
  });
});

describe('calculateCouponDiscount', () => {
  const percent = { code: 'P', description: '', type: 'percent' as const, value: 10, minSpend: 0 };
  const fixed = { code: 'F', description: '', type: 'fixed' as const, value: 5, minSpend: 0 };

  it('takes a percentage off, rounded to cents', () => {
    expect(calculateCouponDiscount(percent, 50)).toBe(5);
    expect(calculateCouponDiscount(percent, 33.33)).toBe(3.33);
  });

  it('takes a fixed amount off', () => {
    expect(calculateCouponDiscount(fixed, 50)).toBe(5);
  });

  it('never takes off more than the amount', () => {
    expect(calculateCouponDiscount(fixed, 3)).toBe(3);
    expect(calculateCouponDiscount(fixed, 0)).toBe(0);
    expect(calculateCouponDiscount(percent, -10)).toBe(0);
  });
});

describe('evaluateCoupon', () => {
  it('does nothing when there is no code', () => {
    expect(evaluateCoupon(null, 100)).toEqual({ coupon: null, discount: 0, error: null });
    expect(evaluateCoupon('  ', 100)).toEqual({ coupon: null, discount: 0, error: null });
    expect(evaluateCoupon(undefined, 100).discount).toBe(0);
  });

  it('rejects an unknown code', () => {
    const result = evaluateCoupon('NOPE', 100);
    expect(result.coupon).toBeNull();
    expect(result.discount).toBe(0);
    expect(result.error).toMatch(/not valid/i);
  });

  it('asks the person to spend more when the cart is too small', () => {
    const result = evaluateCoupon('SAVE5', 24.5); // needs $30
    expect(result.coupon?.code).toBe('SAVE5');
    expect(result.discount).toBe(0);
    expect(result.error).toBe('Spend $5.50 more to use SAVE5');
  });

  it('applies a percentage coupon', () => {
    const result = evaluateCoupon('welcome10', 80);
    expect(result).toMatchObject({ discount: 8, error: null });
    expect(result.coupon?.code).toBe('WELCOME10');
  });

  it('applies a fixed coupon exactly at the minimum spend', () => {
    expect(evaluateCoupon('SAVE5', 30)).toMatchObject({ discount: 5, error: null });
  });

  it('applies the big-spender coupon', () => {
    expect(evaluateCoupon('BIGSPENDER', 200).discount).toBe(30);
    expect(evaluateCoupon('BIGSPENDER', 99.99).error).toMatch(/Spend \$0\.01 more/);
  });
});
