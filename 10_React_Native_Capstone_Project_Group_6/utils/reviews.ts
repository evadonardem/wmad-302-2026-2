/**
 * Product review helpers (pure functions, easy to unit test)
 * DummyJSON returns reviews inside each product but has no endpoint to add one, so the
 * review a person writes is kept on the device (see utils/reviewsStorage.ts).
 *
 * - validateReview / buildReview: the "Write a review" form
 * - getRatingStats: average + how many 5-star, 4-star... reviews (the bars)
 * - mergeReviews: the person's own review first, then the ones from the API
 */

export const MIN_COMMENT_LENGTH = 5;
export const MAX_COMMENT_LENGTH = 500;

/** A review the person wrote (one per product, per account). */
export interface UserReview {
  productId: number;
  rating: number; // whole number, 1-5
  comment: string;
  date: string; // ISO
  reviewerName: string;
}

/** A review as the list shows it (API reviews have an email too, we never display it). */
export interface ReviewLine {
  rating: number;
  comment: string;
  date: string;
  reviewerName: string;
  reviewerEmail?: string;
  isMine?: boolean;
}

export type ReviewErrors = Partial<Record<'rating' | 'comment', string>>;

/** Returns an error message for each invalid field. An empty object means the form is valid. */
export function validateReview(form: { rating: number; comment: string }): ReviewErrors {
  const errors: ReviewErrors = {};
  if (!Number.isInteger(form.rating) || form.rating < 1 || form.rating > 5) {
    errors.rating = 'Tap a star to rate this product';
  }
  const length = form.comment.trim().length;
  if (length < MIN_COMMENT_LENGTH) errors.comment = `Write at least ${MIN_COMMENT_LENGTH} characters`;
  else if (length > MAX_COMMENT_LENGTH) errors.comment = `Keep it under ${MAX_COMMENT_LENGTH} characters`;
  return errors;
}

export function buildReview(params: {
  productId: number;
  rating: number;
  comment: string;
  reviewerName: string;
  now?: Date;
}): UserReview {
  const { productId, rating, comment, reviewerName, now = new Date() } = params;
  return {
    productId,
    rating,
    comment: comment.trim(),
    date: now.toISOString(),
    reviewerName: reviewerName.trim() || 'You',
  };
}

export interface RatingStats {
  count: number;
  average: number; // one decimal, 0 when there are no reviews
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
}

export function getRatingStats(reviews: { rating: number }[]): RatingStats {
  const distribution: RatingStats['distribution'] = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let sum = 0;
  let count = 0;
  for (const { rating } of reviews) {
    const stars = Math.round(rating);
    if (!Number.isFinite(rating) || stars < 1 || stars > 5) continue; // ignore damaged ratings
    distribution[stars as 1 | 2 | 3 | 4 | 5] += 1;
    sum += rating;
    count += 1;
  }
  return { count, average: count === 0 ? 0 : Math.round((sum / count) * 10) / 10, distribution };
}

/** The person's own review goes first (marked isMine), then the API's reviews as they came. */
export function mergeReviews(apiReviews: ReviewLine[], mine: UserReview | null): ReviewLine[] {
  if (!mine) return apiReviews;
  const own: ReviewLine = {
    rating: mine.rating,
    comment: mine.comment,
    date: mine.date,
    reviewerName: mine.reviewerName,
    isMine: true,
  };
  return [own, ...apiReviews];
}

/** Anything read back from storage may be old or damaged: returns a proper review or null. */
export function sanitizeUserReview(raw: unknown): UserReview | null {
  const r = raw as Partial<UserReview> | null;
  if (
    !r ||
    typeof r !== 'object' ||
    typeof r.productId !== 'number' ||
    typeof r.rating !== 'number' ||
    !Number.isInteger(r.rating) ||
    r.rating < 1 ||
    r.rating > 5 ||
    typeof r.comment !== 'string' ||
    typeof r.date !== 'string'
  ) {
    return null;
  }
  return {
    productId: r.productId,
    rating: r.rating,
    comment: r.comment,
    date: r.date,
    reviewerName: typeof r.reviewerName === 'string' && r.reviewerName ? r.reviewerName : 'You',
  };
}
