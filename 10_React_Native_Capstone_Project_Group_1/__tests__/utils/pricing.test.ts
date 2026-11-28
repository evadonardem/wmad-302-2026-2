import {
  calculateCartTotals,
  formatCategoryName,
  formatCurrency,
  getDiscountedPrice,
  productToCartItem,
  roundMoney,
} from '@/utils/pricing';
import { makeCartItem, makeProduct } from '@/test-utils/fixtures';

describe('pricing', () => {
  it('rounds money safely', () => {
    expect(roundMoney(1.005)).toBe(1.01);
    expect(roundMoney(0.1 + 0.2)).toBe(0.3);
  });

  it('applies discounts', () => {
    expect(getDiscountedPrice(100, 10)).toBe(90);
    expect(getDiscountedPrice(19.99, 0)).toBe(19.99);
    expect(getDiscountedPrice(49.99, 15.5)).toBe(42.24);
  });

  it('formats currency', () => {
    expect(formatCurrency(5)).toBe('$5.00');
    expect(formatCurrency(1234.5)).toBe('$1234.50');
  });

  it('formats category slugs', () => {
    expect(formatCategoryName('home-decoration')).toBe('Home decoration');
    expect(formatCategoryName('mens_shirts')).toBe('Mens shirts');
  });

  it('builds cart items and clamps quantity to stock', () => {
    const product = makeProduct({ id: 7, stock: 3 });
    expect(productToCartItem(product, 2)).toMatchObject({ productId: 7, quantity: 2, stock: 3 });
    expect(productToCartItem(product, 10).quantity).toBe(3);
    expect(productToCartItem(product, 0).quantity).toBe(1);
  });

  it('calculates cart totals', () => {
    const totals = calculateCartTotals([
      makeCartItem({ productId: 1, price: 100, discountPercentage: 10, quantity: 2 }),
      makeCartItem({ productId: 2, price: 50, discountPercentage: 0, quantity: 1 }),
    ]);
    expect(totals).toEqual({
      subtotal: 250,
      discountedTotal: 230,
      savings: 20,
      totalQuantity: 3,
      totalProducts: 2,
    });
  });

  it('returns zeros for an empty cart', () => {
    expect(calculateCartTotals([])).toEqual({
      subtotal: 0,
      discountedTotal: 0,
      savings: 0,
      totalQuantity: 0,
      totalProducts: 0,
    });
  });
});
