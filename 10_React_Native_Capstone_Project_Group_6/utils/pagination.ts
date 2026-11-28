/**
 * Scroll-on-demand helpers (pure functions, easy to unit test)
 * - hasMore: are there products on the server we have not loaded yet?
 * - mergeById: add a freshly loaded page to the list without showing anything twice
 * - isNearBottom: has the person scrolled close enough to the end to load the next page?
 */

/** How many products the home screen asks for each time (DummyJSON: ?limit=20&skip=40). */
export const HOME_PAGE_SIZE = 20;

/** Start loading when the end of the list is this many pixels below the screen. */
export const LOAD_MORE_THRESHOLD = 400;

export function hasMore(loaded: number, total: number): boolean {
  return loaded < total;
}

/** Keeps the existing order, appends only items whose id is new. */
export function mergeById<T extends { id: number }>(existing: T[], incoming: T[]): T[] {
  const seen = new Set(existing.map((item) => item.id));
  const fresh = incoming.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id); // also drops duplicates inside the incoming page itself
    return true;
  });
  return fresh.length === 0 ? existing : [...existing, ...fresh];
}

export function isNearBottom(
  scroll: { layoutHeight: number; contentHeight: number; offsetY: number },
  threshold: number = LOAD_MORE_THRESHOLD
): boolean {
  const { layoutHeight, contentHeight, offsetY } = scroll;
  if (contentHeight <= 0) return false; // nothing has been laid out yet
  return offsetY + layoutHeight >= contentHeight - threshold;
}
