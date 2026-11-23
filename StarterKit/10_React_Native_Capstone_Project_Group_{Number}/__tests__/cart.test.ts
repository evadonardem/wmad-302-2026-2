import { calculateTotals, cartReducer, getDiscountedPrice, initialCartState, productToCartItem } from '@/utils/cart';
import type { CartState } from '@/types/product';
import { makeProduct } from './fixtures';

const hydrated: CartState = { items: [], hydrated: true };

describe('getDiscountedPrice', () => {
  it('applies the percentage discount', () => {
    expect(getDiscountedPrice(200, 25)).toBe(150);
  });
  it('returns the price unchanged with no discount', () => {
    expect(getDiscountedPrice(80, 0)).toBe(80);
  });
});

describe('productToCartItem', () => {
  it('copies the fields the cart needs', () => {
    const item = productToCartItem(makeProduct({ id: 7, stock: 3 }), 2);
    expect(item).toMatchObject({ productId: 7, quantity: 2, stock: 3, price: 100 });
  });
});

describe('cartReducer', () => {
  const phone = productToCartItem(makeProduct({ id: 1, stock: 5 }));
  const shoe = productToCartItem(makeProduct({ id: 2, title: 'Shoe', stock: 2 }));

  it('starts empty and not hydrated', () => {
    expect(initialCartState).toEqual({ items: [], hydrated: false });
  });

  it('hydrates saved items', () => {
    const state = cartReducer(initialCartState, { type: 'CART_HYDRATE', payload: [phone] });
    expect(state.hydrated).toBe(true);
    expect(state.items).toHaveLength(1);
  });

  it('adds a new product', () => {
    const state = cartReducer(hydrated, { type: 'CART_ADD', payload: phone });
    expect(state.items).toEqual([phone]);
  });

  it('merges quantity when the product is already in the cart', () => {
    let state = cartReducer(hydrated, { type: 'CART_ADD', payload: { ...phone, quantity: 2 } });
    state = cartReducer(state, { type: 'CART_ADD', payload: { ...phone, quantity: 1 } });
    expect(state.items).toHaveLength(1);
    expect(state.items[0].quantity).toBe(3);
  });

  it('never exceeds stock when adding', () => {
    let state = cartReducer(hydrated, { type: 'CART_ADD', payload: { ...shoe, quantity: 2 } });
    state = cartReducer(state, { type: 'CART_ADD', payload: { ...shoe, quantity: 5 } });
    expect(state.items[0].quantity).toBe(2);
  });

  it('ignores adding an out-of-stock product', () => {
    const state = cartReducer(hydrated, { type: 'CART_ADD', payload: { ...phone, stock: 0 } });
    expect(state.items).toHaveLength(0);
  });

  it('removes a product', () => {
    const start: CartState = { items: [phone, shoe], hydrated: true };
    const state = cartReducer(start, { type: 'CART_REMOVE', payload: { productId: 1 } });
    expect(state.items.map((i) => i.productId)).toEqual([2]);
  });

  it('sets a quantity, clamped to stock', () => {
    const start: CartState = { items: [shoe], hydrated: true };
    const state = cartReducer(start, { type: 'CART_SET_QUANTITY', payload: { productId: 2, quantity: 99 } });
    expect(state.items[0].quantity).toBe(2);
  });

  it('removes the product when quantity is set to 0', () => {
    const start: CartState = { items: [phone], hydrated: true };
    const state = cartReducer(start, { type: 'CART_SET_QUANTITY', payload: { productId: 1, quantity: 0 } });
    expect(state.items).toHaveLength(0);
  });

  it('clears all items but stays hydrated', () => {
    const start: CartState = { items: [phone, shoe], hydrated: true };
    const state = cartReducer(start, { type: 'CART_CLEAR' });
    expect(state).toEqual({ items: [], hydrated: true });
  });
});

describe('calculateTotals', () => {
  it('returns zeros for an empty cart', () => {
    expect(calculateTotals([])).toEqual({
      subtotal: 0,
      discount: 0,
      total: 0,
      totalProducts: 0,
      totalQuantity: 0,
    });
  });

  it('sums subtotal, discount, total and quantities', () => {
    const a = { ...productToCartItem(makeProduct({ id: 1, price: 100, discountPercentage: 10 })), quantity: 2 };
    const b = { ...productToCartItem(makeProduct({ id: 2, price: 50, discountPercentage: 0 })), quantity: 1 };
    const totals = calculateTotals([a, b]);
    expect(totals.subtotal).toBe(250);
    expect(totals.total).toBeCloseTo(230);
    expect(totals.discount).toBeCloseTo(20);
    expect(totals.totalProducts).toBe(2);
    expect(totals.totalQuantity).toBe(3);
  });
});
