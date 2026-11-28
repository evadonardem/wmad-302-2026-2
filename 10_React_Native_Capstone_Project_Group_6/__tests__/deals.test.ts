import {
  FLASH_DEAL_MIN_DISCOUNT,
  LOW_STOCK_THRESHOLD,
  formatCountdown,
  getFlashDeals,
  getMaxDiscount,
  getMsUntilMidnight,
  getStockLabel,
} from '@/utils/deals';

describe('getMsUntilMidnight', () => {
  it('counts the time left in the day', () => {
    expect(getMsUntilMidnight(new Date(2026, 10, 21, 23, 0, 0))).toBe(60 * 60 * 1000);
    expect(getMsUntilMidnight(new Date(2026, 10, 21, 18, 30, 15))).toBe(((5 * 60 + 29) * 60 + 45) * 1000);
  });

  it('is a full day at midnight itself', () => {
    expect(getMsUntilMidnight(new Date(2026, 10, 21, 0, 0, 0))).toBe(24 * 60 * 60 * 1000);
  });

  it('never goes negative', () => {
    expect(getMsUntilMidnight(new Date(2026, 10, 21, 23, 59, 59, 999))).toBeGreaterThan(0);
  });
});

describe('formatCountdown', () => {
  it('shows hours, minutes and seconds with two digits', () => {
    expect(formatCountdown(((5 * 60 + 3) * 60 + 9) * 1000)).toBe('05:03:09');
    expect(formatCountdown(0)).toBe('00:00:00');
    expect(formatCountdown(24 * 60 * 60 * 1000)).toBe('24:00:00');
  });

  it('rounds down to whole seconds and never shows negative time', () => {
    expect(formatCountdown(1999)).toBe('00:00:01');
    expect(formatCountdown(-5000)).toBe('00:00:00');
  });
});

describe('getFlashDeals', () => {
  const p = (id: number, discountPercentage: number, stock = 5) => ({ id, discountPercentage, stock });

  it('keeps discounted, in-stock products, biggest discount first', () => {
    const deals = getFlashDeals([p(1, 10), p(2, 18), p(3, 19.5), p(4, 40, 0), p(5, 0)]);
    expect(deals.map((d) => d.id)).toEqual([3, 2, 1]);
  });

  it('still shows deals when every discount is under 20% (the old bug)', () => {
    expect(getFlashDeals([p(1, 12), p(2, 18)]).length).toBe(2);
  });

  it('can still use a custom minimum: needs MORE than it', () => {
    expect(getFlashDeals([p(1, 15)], 5, 15)).toEqual([]);
    expect(FLASH_DEAL_MIN_DISCOUNT).toBe(0);
  });

  it('respects the limit and does not change the input', () => {
    const input = [p(1, 30), p(2, 40), p(3, 50)];
    expect(getFlashDeals(input, 2).map((d) => d.id)).toEqual([3, 2]);
    expect(input.map((d) => d.id)).toEqual([1, 2, 3]);
  });
});

describe('getStockLabel', () => {
  it('warns only when stock is low', () => {
    expect(getStockLabel(7)).toBe('Only 7 left');
    expect(getStockLabel(LOW_STOCK_THRESHOLD)).toBe('Only 20 left');
    expect(getStockLabel(LOW_STOCK_THRESHOLD + 1)).toBeNull();
    expect(getStockLabel(0)).toBe('Sold out');
  });
});

describe('getMaxDiscount', () => {
  it('returns the biggest rounded discount, or 0 for no deals', () => {
    expect(getMaxDiscount([{ discountPercentage: 12.4 }, { discountPercentage: 18.6 }])).toBe(19);
    expect(getMaxDiscount([])).toBe(0);
  });
});
