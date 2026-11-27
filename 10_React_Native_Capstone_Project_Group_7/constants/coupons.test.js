import { describe, expect, it } from '@jest/globals';
import { getCoupon } from './coupons';

describe('getCoupon', () => {
  it('matches codes case-insensitively and trims whitespace', () => {
    expect(getCoupon(' green10 ', 25)).toEqual({
      code: 'GREEN10',
      discountPercentage: 10,
      minimumSubtotal: 0,
    });
  });

  it('rejects unknown codes and codes below their minimum subtotal', () => {
    expect(getCoupon('NOTREAL', 500)).toBeNull();
    expect(getCoupon('WELCOME15', 99.99)).toBeNull();
    expect(getCoupon('WELCOME15', 100)?.discountPercentage).toBe(15);
  });
});
