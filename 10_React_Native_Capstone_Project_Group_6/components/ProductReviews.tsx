/**
 * ProductReviews - the "Customer reviews" part of the product page
 * - rating summary: average + bars for 5, 4, 3, 2, 1 stars
 * - write, edit or delete your own review (one per product, saved on the device)
 * - the reviews that come with the product from DummyJSON
 *
 * useMyReview loads/saves the signed-in person's review for one product. The product page
 * calls it so the header ("4.2 (13 reviews)") and this section stay in step.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { useAppTheme, useThemedStyles } from '@/context/ThemeContext';
import type { ThemeColors } from '@/constants/colors';
import { reviewsStorage } from '@/utils/reviewsStorage';
import {
  MAX_COMMENT_LENGTH,
  ReviewErrors,
  ReviewLine,
  UserReview,
  buildReview,
  getRatingStats,
  mergeReviews,
  validateReview,
} from '@/utils/reviews';

// ---------- Hook ----------

export function useMyReview(productId: number | undefined) {
  const { user } = useAuth();
  const owner = user?.username ?? null;
  const [review, setReview] = useState<UserReview | null>(null);
  const [loading, setLoading] = useState(false);
  const reviewerName = user ? `${user.firstName} ${user.lastName}`.trim() : '';

  // Load this account's review for this product (again when either changes)
  useEffect(() => {
    let cancelled = false;
    setReview(null);
    if (!owner || productId === undefined) return;
    setLoading(true);
    reviewsStorage
      .get(owner, productId)
      .then((saved) => {
        if (!cancelled) setReview(saved);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [owner, productId]);

  /** Saves a new review, or replaces the old one. Throws if it can't be saved. */
  const save = useCallback(
    async (rating: number, comment: string) => {
      if (!owner || productId === undefined) throw new Error('Please log in to write a review.');
      const next = buildReview({ productId, rating, comment, reviewerName });
      await reviewsStorage.set(owner, next);
      setReview(next);
    },
    [owner, productId, reviewerName]
  );

  const remove = useCallback(async () => {
    if (!owner || productId === undefined) return;
    await reviewsStorage.remove(owner, productId);
    setReview(null);
  }, [owner, productId]);

  return { review, loading, save, remove };
}

// ---------- Small pieces ----------

function StarsRow({ rating, size = 14 }: { rating: number; size?: number }) {
  const { colors } = useAppTheme();
  return (
    <View style={{ flexDirection: 'row' }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <MaterialCommunityIcons
          key={n}
          name={rating >= n ? 'star' : rating >= n - 0.5 ? 'star-half-full' : 'star-outline'}
          size={size}
          color={colors.star}
        />
      ))}
    </View>
  );
}

function StarPicker({ value, onChange }: { value: number; onChange: (rating: number) => void }) {
  const { colors } = useAppTheme();
  return (
    <View style={{ flexDirection: 'row', gap: 4 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <TouchableOpacity
          key={n}
          onPress={() => onChange(n)}
          accessibilityRole="button"
          accessibilityLabel={`${n} ${n === 1 ? 'star' : 'stars'}`}
          accessibilityState={{ selected: value === n }}
          hitSlop={{ top: 6, bottom: 6, left: 2, right: 2 }}
        >
          <MaterialCommunityIcons name={value >= n ? 'star' : 'star-outline'} size={34} color={colors.star} />
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ---------- Section ----------

interface Props {
  /** reviews that come with the product from DummyJSON */
  apiReviews: ReviewLine[];
  myReview: UserReview | null;
  loadingMine?: boolean;
  onSave: (rating: number, comment: string) => Promise<void>;
  onRemove: () => Promise<void>;
}

export function ProductReviews({ apiReviews, myReview, loadingMine = false, onSave, onRemove }: Props) {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(createStyles);

  const [formOpen, setFormOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [errors, setErrors] = useState<ReviewErrors>({});
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const all = mergeReviews(apiReviews, myReview);
  const stats = getRatingStats(all);

  const openForm = () => {
    setRating(myReview?.rating ?? 0);
    setComment(myReview?.comment ?? '');
    setErrors({});
    setSubmitError(null);
    setConfirmDelete(false);
    setFormOpen(true);
  };

  const handleSubmit = async () => {
    if (saving) return; // ignore double taps
    const found = validateReview({ rating, comment });
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSaving(true);
    setSubmitError(null);
    try {
      await onSave(rating, comment);
      setFormOpen(false);
    } catch (error: unknown) {
      setSubmitError(error instanceof Error ? error.message : 'Could not save your review');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await onRemove();
      setConfirmDelete(false);
    } catch {
      setSubmitError('Could not delete your review');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View>
      <Text style={styles.title}>Customer reviews ({stats.count})</Text>

      {/* Summary */}
      {stats.count > 0 && (
        <View style={styles.summary}>
          <View style={styles.average}>
            <Text style={styles.averageNumber}>{stats.average.toFixed(1)}</Text>
            <StarsRow rating={stats.average} size={16} />
            <Text style={styles.muted}>{stats.count} {stats.count === 1 ? 'review' : 'reviews'}</Text>
          </View>
          <View style={styles.bars}>
            {([5, 4, 3, 2, 1] as const).map((stars) => (
              <View key={stars} style={styles.barRow} accessible accessibilityLabel={`${stars} stars: ${stats.distribution[stars]} reviews`}>
                <Text style={styles.barLabel}>{stars}</Text>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { width: `${(stats.distribution[stars] / stats.count) * 100}%` }]} />
                </View>
                <Text style={styles.barCount}>{stats.distribution[stars]}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Write / edit form */}
      {formOpen ? (
        <View style={styles.form}>
          <Text style={styles.formTitle}>{myReview ? 'Edit your review' : 'Write a review'}</Text>
          <StarPicker
            value={rating}
            onChange={(n) => {
              setRating(n);
              if (errors.rating) setErrors((prev) => ({ ...prev, rating: undefined }));
            }}
          />
          {errors.rating ? <Text style={styles.error}>{errors.rating}</Text> : null}
          <TextInput
            mode="outlined"
            label="Your review"
            value={comment}
            onChangeText={(text) => {
              setComment(text);
              if (errors.comment) setErrors((prev) => ({ ...prev, comment: undefined }));
            }}
            multiline
            numberOfLines={4}
            maxLength={MAX_COMMENT_LENGTH + 50} // lets people go a little over and see the message
            error={!!errors.comment}
            style={styles.input}
          />
          <View style={styles.row}>
            <Text style={errors.comment ? styles.error : styles.muted}>{errors.comment ?? ' '}</Text>
            <Text style={styles.muted}>
              {comment.trim().length}/{MAX_COMMENT_LENGTH}
            </Text>
          </View>
          {submitError ? <Text style={styles.error}>{submitError}</Text> : null}
          <View style={styles.formActions}>
            <Button mode="contained" onPress={handleSubmit} loading={saving} disabled={saving}>
              {myReview ? 'Save changes' : 'Submit review'}
            </Button>
            <Button textColor={colors.primaryText} mode="text" onPress={() => setFormOpen(false)} disabled={saving}>
              Cancel
            </Button>
          </View>
        </View>
      ) : !myReview ? (
        <Button textColor={colors.primaryText}
          mode="outlined"
          icon="pencil-outline"
          onPress={openForm}
          disabled={loadingMine}
          style={styles.writeButton}
        >
          Write a review
        </Button>
      ) : null}

      {/* The list: yours first */}
      {all.length === 0 ? (
        <Text style={styles.muted}>No reviews yet. Be the first to write one!</Text>
      ) : (
        all.map((review, index) => (
          <View key={review.isMine ? 'mine' : `${review.reviewerEmail ?? review.reviewerName}-${index}`} style={styles.review}>
            <View style={styles.row}>
              <Text style={styles.reviewer}>
                {review.reviewerName}
                {review.isMine ? '  (you)' : ''}
              </Text>
              <Text style={styles.muted}>{new Date(review.date).toLocaleDateString()}</Text>
            </View>
            <StarsRow rating={review.rating} />
            <Text style={styles.comment}>{review.comment}</Text>

            {review.isMine && !formOpen && (
              <View style={styles.myActions}>
                {confirmDelete ? (
                  <>
                    <Text style={styles.muted}>Delete your review?</Text>
                    <Button compact mode="text" textColor={colors.error} onPress={handleDelete} disabled={saving}>
                      Delete
                    </Button>
                    <Button textColor={colors.primaryText} compact mode="text" onPress={() => setConfirmDelete(false)} disabled={saving}>
                      Keep
                    </Button>
                  </>
                ) : (
                  <>
                    <Button textColor={colors.primaryText} compact mode="text" icon="pencil-outline" onPress={openForm}>
                      Edit
                    </Button>
                    <Button textColor={colors.primaryText} compact mode="text" icon="delete-outline" onPress={() => setConfirmDelete(true)}>
                      Delete
                    </Button>
                  </>
                )}
              </View>
            )}
          </View>
        ))
      )}
      {loadingMine && <ActivityIndicator size="small" color={colors.primary} style={styles.loader} />}
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    title: { fontSize: 16, fontWeight: '700', color: colors.text, marginTop: 16, marginBottom: 8 },
    muted: { fontSize: 13, color: colors.textMuted },
    error: { fontSize: 13, color: colors.errorText, marginTop: 4 },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    summary: { flexDirection: 'row', alignItems: 'center', gap: 20, marginBottom: 12 },
    average: { alignItems: 'center', gap: 2 },
    averageNumber: { fontSize: 36, fontWeight: '700', color: colors.text },
    bars: { flex: 1, gap: 4 },
    barRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    barLabel: { width: 12, fontSize: 12, color: colors.textMuted, textAlign: 'right' },
    barTrack: { flex: 1, height: 8, borderRadius: 4, backgroundColor: colors.surfaceMuted, overflow: 'hidden' },
    barFill: { height: 8, borderRadius: 4, backgroundColor: colors.star },
    barCount: { width: 24, fontSize: 12, color: colors.textMuted },
    writeButton: { marginBottom: 8 },
    form: {
      borderWidth: 1,
      borderColor: colors.primaryBorder,
      backgroundColor: colors.primaryContainer,
      borderRadius: 12,
      padding: 12,
      marginBottom: 8,
    },
    formTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 8 },
    input: { marginTop: 10, backgroundColor: colors.surface },
    formActions: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
    review: { paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
    reviewer: { fontSize: 14, fontWeight: '600', color: colors.text },
    comment: { fontSize: 14, color: colors.textBody, marginTop: 4 },
    myActions: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
    loader: { marginTop: 8 },
  });
