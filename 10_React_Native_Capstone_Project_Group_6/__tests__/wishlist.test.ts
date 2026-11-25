import {
  initialWishlistState,
  toWishlistItem,
  wishlistReducer,
  WishlistState,
} from '@/context/WishlistContext';
import { WishlistItem } from '@/types/product';

const heart = (id: number, overrides: Partial<WishlistItem> = {}): WishlistItem => ({
  id,
  title: `Item ${id}`,
  thumbnail: `${id}.png`,
  category: 'beauty',
  price: 10,
  discountPercentage: 0,
  rating: 4,
  stock: 5,
  ...overrides,
});

const stateWith = (...items: WishlistItem[]): WishlistState => ({ items, isHydrated: true });

describe('toWishlistItem', () => {
  it('keeps only the fields the wishlist needs', () => {
    const full = { ...heart(1), description: 'long text', reviews: [], images: ['a'] };
    expect(toWishlistItem(full as never)).toEqual(heart(1));
  });
});

describe('wishlistReducer', () => {
  it('starts empty and not loaded', () => {
    expect(initialWishlistState).toEqual({ items: [], isHydrated: false });
  });

  it('WISHLIST_HYDRATE loads the saved list', () => {
    const next = wishlistReducer(initialWishlistState, { type: 'WISHLIST_HYDRATE', payload: [heart(1)] });
    expect(next).toEqual({ items: [heart(1)], isHydrated: true });
  });

  it('WISHLIST_TOGGLE adds a product at the front (newest first)', () => {
    const next = wishlistReducer(stateWith(heart(1)), { type: 'WISHLIST_TOGGLE', payload: heart(2) });
    expect(next.items.map((i) => i.id)).toEqual([2, 1]);
  });

  it('WISHLIST_TOGGLE removes a product that is already saved', () => {
    const next = wishlistReducer(stateWith(heart(1), heart(2)), { type: 'WISHLIST_TOGGLE', payload: heart(1) });
    expect(next.items.map((i) => i.id)).toEqual([2]);
  });

  it('WISHLIST_REMOVE removes only that product', () => {
    const next = wishlistReducer(stateWith(heart(1), heart(2)), { type: 'WISHLIST_REMOVE', payload: 2 });
    expect(next.items.map((i) => i.id)).toEqual([1]);
    expect(wishlistReducer(next, { type: 'WISHLIST_REMOVE', payload: 99 }).items).toHaveLength(1);
  });

  it('ignores unknown actions and never changes the old state', () => {
    const state = stateWith(heart(1));
    expect(wishlistReducer(state, { type: 'NOPE' } as never)).toBe(state);
    wishlistReducer(state, { type: 'WISHLIST_TOGGLE', payload: heart(2) });
    expect(state.items).toHaveLength(1);
  });
});
