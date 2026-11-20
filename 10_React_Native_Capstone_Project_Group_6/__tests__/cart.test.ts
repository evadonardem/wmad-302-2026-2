import {
  CartState,
  calculateTotals,
  cartReducer,
  getDiscountedPrice,
  initialCartState,
} from '@/context/CartContext';
import { CartItem } from '@/types/product';

const item = (overrides: Partial<CartItem> = {}): CartItem => ({
  productId: 1,
  title: 'Phone',
  thumbnail: 'x.png',
  price: 100,
  discountPercentage: 10,
  stock: 5,
  quantity: 1,
  ...overrides,
});

const stateWith = (...items: CartItem[]): CartState => ({ items, isHydrated: true });

describe('getDiscountedPrice / calculateTotals', () => {
  it('applies the discount to one unit', () => {
    expect(getDiscountedPrice({ price: 200, discountPercentage: 25 })).toBeCloseTo(150);
  });

  it('adds up an empty cart as zeros', () => {
    expect(calculateTotals([])).toEqual({ total: 0, discountedTotal: 0, totalProducts: 0, totalQuantity: 0 });
  });

  it('adds up prices, discounted prices, products and units', () => {
    const totals = calculateTotals([item({ quantity: 2 }), item({ productId: 2, price: 50, discountPercentage: 0, quantity: 1 })]);
    expect(totals.total).toBeCloseTo(250);
    expect(totals.discountedTotal).toBeCloseTo(230); // 2 x 90 + 50
    expect(totals.totalProducts).toBe(2);
    expect(totals.totalQuantity).toBe(3);
  });
});

describe('cartReducer', () => {
  it('starts empty and not hydrated', () => {
    expect(initialCartState).toEqual({ items: [], isHydrated: false });
  });

  it('CART_HYDRATE loads saved items and marks the cart as loaded', () => {
    const next = cartReducer(initialCartState, { type: 'CART_HYDRATE', payload: [item()] });
    expect(next.items).toHaveLength(1);
    expect(next.isHydrated).toBe(true);
  });

  it('CART_ADD adds a new product', () => {
    const next = cartReducer(stateWith(), { type: 'CART_ADD', payload: item() });
    expect(next.items).toHaveLength(1);
  });

  it('CART_ADD of the same product increases its quantity', () => {
    const next = cartReducer(stateWith(item({ quantity: 2 })), { type: 'CART_ADD', payload: item({ quantity: 1 }) });
    expect(next.items).toHaveLength(1);
    expect(next.items[0].quantity).toBe(3);
  });

  it('CART_ADD never goes above the stock', () => {
    const more = cartReducer(stateWith(item({ quantity: 4 })), { type: 'CART_ADD', payload: item({ quantity: 3 }) });
    expect(more.items[0].quantity).toBe(5);
    const fresh = cartReducer(stateWith(), { type: 'CART_ADD', payload: item({ quantity: 99 }) });
    expect(fresh.items[0].quantity).toBe(5);
  });

  it('CART_SET_QUANTITY changes the quantity, capped at stock', () => {
    const state = stateWith(item());
    expect(cartReducer(state, { type: 'CART_SET_QUANTITY', payload: { productId: 1, quantity: 3 } }).items[0].quantity).toBe(3);
    expect(cartReducer(state, { type: 'CART_SET_QUANTITY', payload: { productId: 1, quantity: 50 } }).items[0].quantity).toBe(5);
  });

  it('CART_SET_QUANTITY of 0 removes the product', () => {
    const next = cartReducer(stateWith(item()), { type: 'CART_SET_QUANTITY', payload: { productId: 1, quantity: 0 } });
    expect(next.items).toHaveLength(0);
  });

  it('CART_REMOVE removes only that product', () => {
    const next = cartReducer(stateWith(item(), item({ productId: 2 })), { type: 'CART_REMOVE', payload: 1 });
    expect(next.items.map((i) => i.productId)).toEqual([2]);
  });

  it('CART_CLEAR empties the cart but keeps it marked as loaded', () => {
    const next = cartReducer(stateWith(item()), { type: 'CART_CLEAR' });
    expect(next.items).toHaveLength(0);
    expect(next.isHydrated).toBe(true);
  });

  it('ignores unknown actions', () => {
    const state = stateWith(item());
    expect(cartReducer(state, { type: 'NOPE' } as never)).toBe(state);
  });

  it('never changes the previous state (pure)', () => {
    const state = stateWith(item({ quantity: 1 }));
    cartReducer(state, { type: 'CART_ADD', payload: item() });
    expect(state.items[0].quantity).toBe(1);
  });
});
