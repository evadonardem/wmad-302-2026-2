import { HOME_PAGE_SIZE, LOAD_MORE_THRESHOLD, hasMore, isNearBottom, mergeById } from '@/utils/pagination';

const p = (id: number) => ({ id, title: `Product ${id}` });

describe('hasMore', () => {
  it('is true while the server has products we have not loaded', () => {
    expect(hasMore(20, 194)).toBe(true);
  });

  it('is false once everything is loaded', () => {
    expect(hasMore(194, 194)).toBe(false);
    expect(hasMore(0, 0)).toBe(false);
  });
});

describe('mergeById', () => {
  it('adds a new page to the end, keeping the order', () => {
    expect(mergeById([p(1), p(2)], [p(3), p(4)]).map((x) => x.id)).toEqual([1, 2, 3, 4]);
  });

  it('skips products that are already in the list', () => {
    expect(mergeById([p(1), p(2)], [p(2), p(3)]).map((x) => x.id)).toEqual([1, 2, 3]);
  });

  it('skips duplicates inside the new page itself', () => {
    expect(mergeById([p(1)], [p(2), p(2)]).map((x) => x.id)).toEqual([1, 2]);
  });

  it('returns the same array when nothing is new', () => {
    const list = [p(1), p(2)];
    expect(mergeById(list, [p(1)])).toBe(list);
    expect(mergeById(list, [])).toBe(list);
  });

  it('does not change the lists it is given', () => {
    const list = [p(1)];
    const page = [p(2)];
    mergeById(list, page);
    expect(list).toEqual([p(1)]);
    expect(page).toEqual([p(2)]);
  });
});

describe('isNearBottom', () => {
  const screen = 800;
  const content = 5000;

  it('is false near the top', () => {
    expect(isNearBottom({ layoutHeight: screen, contentHeight: content, offsetY: 0 })).toBe(false);
  });

  it('turns true once the end is within the threshold', () => {
    const justBefore = content - screen - LOAD_MORE_THRESHOLD - 1;
    expect(isNearBottom({ layoutHeight: screen, contentHeight: content, offsetY: justBefore })).toBe(false);
    expect(isNearBottom({ layoutHeight: screen, contentHeight: content, offsetY: justBefore + 1 })).toBe(true);
  });

  it('is true at the very bottom', () => {
    expect(isNearBottom({ layoutHeight: screen, contentHeight: content, offsetY: content - screen })).toBe(true);
  });

  it('is false before anything has been laid out', () => {
    expect(isNearBottom({ layoutHeight: 0, contentHeight: 0, offsetY: 0 })).toBe(false);
  });

  it('accepts a custom threshold', () => {
    expect(isNearBottom({ layoutHeight: screen, contentHeight: content, offsetY: 3000 }, 1500)).toBe(true);
  });
});

describe('HOME_PAGE_SIZE', () => {
  it('is a sensible positive page size', () => {
    expect(HOME_PAGE_SIZE).toBeGreaterThan(0);
  });
});
