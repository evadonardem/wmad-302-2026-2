import {
  MAX_COMMENT_LENGTH,
  MIN_COMMENT_LENGTH,
  ReviewLine,
  UserReview,
  buildReview,
  getRatingStats,
  mergeReviews,
  sanitizeUserReview,
  validateReview,
} from '@/utils/reviews';

const mine: UserReview = {
  productId: 7,
  rating: 4,
  comment: 'Works well',
  date: '2026-11-20T01:00:00.000Z',
  reviewerName: 'Emily J',
};
const apiReview = (rating: number, name = 'Sam'): ReviewLine => ({
  rating,
  comment: 'ok',
  date: '2026-01-01T00:00:00.000Z',
  reviewerName: name,
  reviewerEmail: 'sam@x.com',
});

describe('validateReview', () => {
  it('accepts a rating with a long enough comment', () => {
    expect(validateReview({ rating: 5, comment: 'Great product' })).toEqual({});
  });

  it('asks for a rating', () => {
    expect(validateReview({ rating: 0, comment: 'Great product' }).rating).toBeDefined();
    expect(validateReview({ rating: 6, comment: 'Great product' }).rating).toBeDefined();
    expect(validateReview({ rating: 3.5, comment: 'Great product' }).rating).toBeDefined();
  });

  it('checks the comment length after trimming', () => {
    expect(validateReview({ rating: 5, comment: '   ok   ' }).comment).toBeDefined();
    expect(validateReview({ rating: 5, comment: 'a'.repeat(MIN_COMMENT_LENGTH) }).comment).toBeUndefined();
    expect(validateReview({ rating: 5, comment: 'a'.repeat(MAX_COMMENT_LENGTH) }).comment).toBeUndefined();
    expect(validateReview({ rating: 5, comment: 'a'.repeat(MAX_COMMENT_LENGTH + 1) }).comment).toBeDefined();
  });

  it('reports both problems at once', () => {
    expect(Object.keys(validateReview({ rating: 0, comment: '' })).sort()).toEqual(['comment', 'rating']);
  });
});

describe('buildReview', () => {
  const now = new Date('2026-11-20T01:00:00.000Z');

  it('trims the comment and name and stamps the date', () => {
    expect(buildReview({ productId: 7, rating: 4, comment: '  Works well  ', reviewerName: ' Emily J ', now })).toEqual(
      mine
    );
  });

  it('falls back to "You" when there is no name', () => {
    expect(buildReview({ productId: 7, rating: 4, comment: 'Works well', reviewerName: '  ', now }).reviewerName).toBe('You');
  });
});

describe('getRatingStats', () => {
  it('counts each star level and averages to one decimal', () => {
    const stats = getRatingStats([{ rating: 5 }, { rating: 5 }, { rating: 4 }, { rating: 1 }]);
    expect(stats.count).toBe(4);
    expect(stats.average).toBe(3.8);
    expect(stats.distribution).toEqual({ 1: 1, 2: 0, 3: 0, 4: 1, 5: 2 });
  });

  it('handles no reviews', () => {
    expect(getRatingStats([])).toEqual({ count: 0, average: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } });
  });

  it('ignores damaged ratings', () => {
    const stats = getRatingStats([{ rating: 5 }, { rating: NaN }, { rating: 0 }, { rating: 9 }]);
    expect(stats.count).toBe(1);
    expect(stats.average).toBe(5);
  });
});

describe('mergeReviews', () => {
  it('puts the person\'s own review first and marks it', () => {
    const merged = mergeReviews([apiReview(5), apiReview(3)], mine);
    expect(merged).toHaveLength(3);
    expect(merged[0]).toEqual({
      rating: 4,
      comment: 'Works well',
      date: mine.date,
      reviewerName: 'Emily J',
      isMine: true,
    });
    expect(merged[1].reviewerName).toBe('Sam');
  });

  it('returns the API reviews untouched when there is no own review', () => {
    const api = [apiReview(5)];
    expect(mergeReviews(api, null)).toBe(api);
  });
});

describe('sanitizeUserReview', () => {
  it('keeps a good review', () => {
    expect(sanitizeUserReview(mine)).toEqual(mine);
  });

  it('rejects damaged data', () => {
    expect(sanitizeUserReview(null)).toBe(null);
    expect(sanitizeUserReview('x')).toBe(null);
    expect(sanitizeUserReview({ ...mine, rating: 9 })).toBe(null);
    expect(sanitizeUserReview({ ...mine, rating: 2.5 })).toBe(null);
    expect(sanitizeUserReview({ ...mine, comment: 5 })).toBe(null);
    expect(sanitizeUserReview({ ...mine, productId: '7' })).toBe(null);
  });

  it('fills in a missing name', () => {
    expect(sanitizeUserReview({ ...mine, reviewerName: undefined })?.reviewerName).toBe('You');
  });
});
