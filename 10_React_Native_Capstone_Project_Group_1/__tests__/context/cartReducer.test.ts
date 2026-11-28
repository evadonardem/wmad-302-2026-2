import { cartReducer, initialCartState } from '@/context/cartReducer';
import { makeCartItem } from '@/test-utils/fixtures';

describe('cartReducer', () => {
  it('hydrates and marks the cart as loaded', () => {
    const items = [makeCartItem()];
    expect(cartReducer(initialCartState, { type: 'CART_HYDRATE', payload: items })).toEqual({
      items,
      isHydrated: true,
    });
  });

  it('adds a new item', () => {
    const state = cartReducer(initialCartState, { type: 'CART_ADD_ITEM', payload: makeCartItem({ quantity: 2 }) });
    expect(state.items).toHaveLength(1);
    expect(state.items[0].quantity).toBe(2);
  });

  it('merges quantities when the product is already in the cart', () => {
    const start = { ...initialCartState, items: [makeCartItem({ quantity: 2 })] };
    const state = cartReducer(start, { type: 'CART_ADD_ITEM', payload: makeCartItem({ quantity: 1 }) });
    expect(state.items).toHaveLength(1);
    expect(state.items[0].quantity).toBe(3);
  });

  it('never exceeds stock when adding', () => {
    const start = { ...initialCartState, items: [makeCartItem({ quantity: 4, stock: 5 })] };
    const merged = cartReducer(start, { type: 'CART_ADD_ITEM', payload: makeCartItem({ quantity: 3, stock: 5 }) });
    expect(merged.items[0].quantity).toBe(5);

    const fresh = cartReducer(initialCartState, { type: 'CART_ADD_ITEM', payload: makeCartItem({ quantity: 9, stock: 5 }) });
    expect(fresh.items[0].quantity).toBe(5);
  });

  it('ignores out-of-stock products and zero quantities', () => {
    expect(cartReducer(initialCartState, { type: 'CART_ADD_ITEM', payload: makeCartItem({ stock: 0 }) })).toBe(
      initialCartState
    );
    expect(cartReducer(initialCartState, { type: 'CART_ADD_ITEM', payload: makeCartItem({ quantity: 0 }) })).toBe(
      initialCartState
    );
  });

  it('updates quantity, clamped to stock', () => {
    const start = { ...initialCartState, items: [makeCartItem({ quantity: 1, stock: 5 })] };
    expect(
      cartReducer(start, { type: 'CART_UPDATE_QUANTITY', payload: { productId: 1, quantity: 3 } }).items[0].quantity
    ).toBe(3);
    expect(
      cartReducer(start, { type: 'CART_UPDATE_QUANTITY', payload: { productId: 1, quantity: 99 } }).items[0].quantity
    ).toBe(5);
  });

  it('removes the item when quantity drops to 0', () => {
    const start = { ...initialCartState, items: [makeCartItem()] };
    expect(
      cartReducer(start, { type: 'CART_UPDATE_QUANTITY', payload: { productId: 1, quantity: 0 } }).items
    ).toHaveLength(0);
  });

  it('removes and clears', () => {
    const start = { ...initialCartState, items: [makeCartItem({ productId: 1 }), makeCartItem({ productId: 2 })] };
    expect(cartReducer(start, { type: 'CART_REMOVE_ITEM', payload: { productId: 1 } }).items.map((i) => i.productId)).toEqual([2]);
    expect(cartReducer(start, { type: 'CART_CLEAR' }).items).toEqual([]);
  });
});
