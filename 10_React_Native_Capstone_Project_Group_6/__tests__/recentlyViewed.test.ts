import {
  MAX_RECENTLY_VIEWED,
  RecentlyViewedItem,
  RecentlyViewedState,
  addRecentlyViewed,
  initialRecentlyViewedState,
  recentlyViewedReducer,
  removeRecentlyViewed,
  sanitizeRecentlyViewed,
  toRecentItem,
} from '@/utils/recentlyViewed';

const item = (id: number, overrides: Partial<RecentlyViewedItem> = {}): RecentlyViewedItem => ({
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
const ids = (list: RecentlyViewedItem[]) => list.map((i) => i.id);
const ready = (...items: RecentlyViewedItem[]): RecentlyViewedState => ({ items, isHydrated: true });

describe('toRecentItem', () => {
  it('keeps only the fields the history row needs', () => {
    const full = { ...item(1), description: 'long text', reviews: [], images: ['a'] };
    expect(toRecentItem(full as never)).toEqual(item(1));
  });
});

describe('addRecentlyViewed', () => {
  it('puts the newest product first', () => {
    expect(ids(addRecentlyViewed([item(1), item(2)], item(3)))).toEqual([3, 1, 2]);
  });

  it('moves a product you open again to the front instead of listing it twice', () => {
    expect(ids(addRecentlyViewed([item(1), item(2), item(3)], item(3)))).toEqual([3, 1, 2]);
  });

  it('keeps only the most recent products', () => {
    const full = Array.from({ length: MAX_RECENTLY_VIEWED }, (_, i) => item(i + 1));
    const next = addRecentlyViewed(full, item(99));
    expect(next).toHaveLength(MAX_RECENTLY_VIEWED);
    expect(next[0].id).toBe(99);
    expect(ids(next)).not.toContain(MAX_RECENTLY_VIEWED); // the oldest one dropped off
  });

  it('refreshes the saved details (e.g. a new price) when seen again', () => {
    expect(addRecentlyViewed([item(1, { price: 10 })], item(1, { price: 8 }))[0].price).toBe(8);
  });

  it('does not change the list it is given', () => {
    const list = [item(1)];
    addRecentlyViewed(list, item(2));
    expect(ids(list)).toEqual([1]);
  });
});

describe('removeRecentlyViewed', () => {
  it('removes one product', () => {
    expect(ids(removeRecentlyViewed([item(1), item(2)], 1))).toEqual([2]);
  });
});

describe('sanitizeRecentlyViewed', () => {
  it('keeps good items', () => {
    expect(sanitizeRecentlyViewed([item(1), item(2)])).toEqual([item(1), item(2)]);
  });

  it('returns an empty list for anything that is not a list', () => {
    expect(sanitizeRecentlyViewed(null)).toEqual([]);
    expect(sanitizeRecentlyViewed({ id: 1 })).toEqual([]);
    expect(sanitizeRecentlyViewed('oops')).toEqual([]);
  });

  it('drops damaged entries and repeats', () => {
    const raw = [item(1), null, 'x', { id: 'two', title: 'T', thumbnail: 't', price: 1 }, { id: 3 }, item(1)];
    expect(ids(sanitizeRecentlyViewed(raw))).toEqual([1]);
  });

  it('fills in missing optional fields', () => {
    const [clean] = sanitizeRecentlyViewed([{ id: 5, title: 'T', thumbnail: 't.png', price: 9 }]);
    expect(clean).toEqual({
      id: 5,
      title: 'T',
      thumbnail: 't.png',
      category: '',
      price: 9,
      discountPercentage: 0,
      rating: 0,
      stock: 0,
    });
  });

  it('caps the list', () => {
    const many = Array.from({ length: 25 }, (_, i) => item(i + 1));
    expect(sanitizeRecentlyViewed(many)).toHaveLength(MAX_RECENTLY_VIEWED);
  });
});

describe('recentlyViewedReducer', () => {
  it('starts empty and not loaded', () => {
    expect(initialRecentlyViewedState).toEqual({ items: [], isHydrated: false });
  });

  it('RECENT_HYDRATE loads the saved history and marks it loaded', () => {
    const next = recentlyViewedReducer(initialRecentlyViewedState, { type: 'RECENT_HYDRATE', payload: [item(1)] });
    expect(next).toEqual({ items: [item(1)], isHydrated: true });
  });

  it('RECENT_VIEW adds a product to the front', () => {
    const next = recentlyViewedReducer(ready(item(1)), { type: 'RECENT_VIEW', payload: item(2) });
    expect(ids(next.items)).toEqual([2, 1]);
  });

  it('RECENT_VIEW is ignored until the saved history has loaded (it would be overwritten)', () => {
    const state = recentlyViewedReducer(initialRecentlyViewedState, { type: 'RECENT_VIEW', payload: item(2) });
    expect(state).toBe(initialRecentlyViewedState);
  });

  it('RECENT_REMOVE removes one product', () => {
    const next = recentlyViewedReducer(ready(item(1), item(2)), { type: 'RECENT_REMOVE', payload: 2 });
    expect(ids(next.items)).toEqual([1]);
  });

  it('RECENT_CLEAR empties the history but stays loaded', () => {
    const next = recentlyViewedReducer(ready(item(1)), { type: 'RECENT_CLEAR' });
    expect(next).toEqual({ items: [], isHydrated: true });
  });

  it('RECENT_RESET goes back to the not-loaded start (account changed)', () => {
    expect(recentlyViewedReducer(ready(item(1)), { type: 'RECENT_RESET' })).toEqual(initialRecentlyViewedState);
  });
});
