/**
 * Recipe Detail Screen
 * Hero image, rating, ingredients (checklist), instructions, nutrition, tags, reviews,
 * favorite toggle and native share.
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  View,
} from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import {
  Button,
  Card,
  Checkbox,
  Chip,
  Divider,
  IconButton,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';
import { contentWidth } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useFavorites } from '@/context/FavoritesContext';
import { useRecipe } from '@/hooks';
import { reviewsStorage } from '@/utils/storage';
import { averageRating, totalTime } from '@/utils/recipeFilters';
import {
  DifficultyBadge,
  ErrorState,
  Skeleton,
  StarRating,
} from '@/components/CommonComponents';
import type { Review } from '@/types/recipe';

function InfoTile({ icon, label, value }: { icon: string; label: string; value: string }) {
  const theme = useTheme();
  return (
    <View style={[styles.tile, { backgroundColor: theme.colors.surfaceVariant }]}>
      <IconButton icon={icon} size={22} iconColor={theme.colors.primary} style={styles.tileIcon} />
      <Text variant="titleSmall" style={{ color: theme.colors.onSurface }}>
        {value}
      </Text>
      <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
        {label}
      </Text>
    </View>
  );
}

function SectionTitle({ children }: { children: string }) {
  const theme = useTheme();
  return (
    <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
      {children}
    </Text>
  );
}

export default function RecipeDetailScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const recipeId = id ? Number(id) : null;
  const { recipe, loading, error, retry } = useRecipe(recipeId);
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Load locally stored reviews for this recipe
  useEffect(() => {
    if (recipeId !== null && !Number.isNaN(recipeId)) {
      reviewsStorage.getForRecipe(recipeId).then(setReviews).catch(() => undefined);
    }
  }, [recipeId]);

  const combinedRating = useMemo(
    () =>
      recipe
        ? averageRating(
            recipe.rating,
            recipe.reviewCount,
            reviews.map((review) => review.rating)
          )
        : 0,
    [recipe, reviews]
  );

  const handleShare = useCallback(async () => {
    if (!recipe) return;
    try {
      await Share.share({
        message: `${recipe.name} (${recipe.cuisine}, ${totalTime(recipe)} min)\n\nIngredients:\n${recipe.ingredients
          .map((item) => `- ${item}`)
          .join('\n')}`,
      });
    } catch {
      // The user dismissed the share sheet or sharing isn't available
    }
  }, [recipe]);

  const submitReview = async () => {
    if (!recipe || !user || rating === 0 || comment.trim().length < 3) return;
    setSubmitting(true);
    try {
      const next = await reviewsStorage.add({
        id: `${Date.now()}`,
        recipeId: recipe.id,
        userId: user.id,
        author: `${user.firstName} ${user.lastName}`,
        rating,
        comment: comment.trim(),
        createdAt: new Date().toISOString(),
      });
      setReviews(next);
      setRating(0);
      setComment('');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Stack.Screen options={{ title: 'Recipe' }} />
        <Skeleton height={260} borderRadius={0} />
        <View style={styles.padded}>
          <Skeleton height={28} width="70%" />
          <Skeleton height={16} width="40%" style={styles.gap} />
          <Skeleton height={80} style={styles.gap} />
          <Skeleton height={120} style={styles.gap} />
        </View>
      </View>
    );
  }

  if (error || !recipe) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Stack.Screen options={{ title: 'Recipe' }} />
        <ErrorState message={error ?? 'Recipe not found'} onRetry={retry} />
      </View>
    );
  }

  const favorite = isFavorite(recipe.id);
  const reviewTotal = recipe.reviewCount + reviews.length;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ title: recipe.name }} />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Hero */}
        <View>
          <Image source={{ uri: recipe.image }} style={styles.hero} resizeMode="contain" />
          <View style={styles.heroActions}>
            <IconButton
              icon={favorite ? 'heart' : 'heart-outline'}
              iconColor={favorite ? '#E53935' : theme.colors.onSurface}
              containerColor={theme.colors.surface}
              onPress={() => toggleFavorite(recipe.id)}
              accessibilityLabel={favorite ? 'Remove from favorites' : 'Add to favorites'}
              testID="detail-favorite"
            />
            <IconButton
              icon="share-variant"
              iconColor={theme.colors.onSurface}
              containerColor={theme.colors.surface}
              onPress={handleShare}
              accessibilityLabel="Share recipe"
              testID="detail-share"
            />
          </View>
        </View>

        <View style={styles.padded}>
          {/* Title + rating */}
          <Text variant="headlineSmall" style={{ color: theme.colors.onSurface, fontWeight: '700' }}>
            {recipe.name}
          </Text>
          <View style={styles.ratingRow}>
            <StarRating rating={combinedRating} />
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              {combinedRating.toFixed(1)} ({reviewTotal} reviews)
            </Text>
          </View>
          <View style={styles.chipRow}>
            <DifficultyBadge difficulty={recipe.difficulty} />
            <Chip compact>{recipe.cuisine}</Chip>
            {recipe.mealType.map((meal) => (
              <Chip key={meal} compact icon="silverware-fork-knife">
                {meal}
              </Chip>
            ))}
          </View>

          {/* Quick info */}
          <View style={styles.tiles}>
            <InfoTile icon="clock-outline" label="Prep" value={`${recipe.prepTimeMinutes} min`} />
            <InfoTile icon="fire" label="Cook" value={`${recipe.cookTimeMinutes} min`} />
            <InfoTile icon="timer-sand" label="Total" value={`${totalTime(recipe)} min`} />
            <InfoTile icon="account-group-outline" label="Serves" value={`${recipe.servings}`} />
          </View>

          {/* Ingredients */}
          <SectionTitle>Ingredients</SectionTitle>
          <Card style={{ backgroundColor: theme.colors.surface }} elevation={1}>
            {recipe.ingredients.map((ingredient, index) => (
              <Checkbox.Item
                key={`${ingredient}-${index}`}
                label={ingredient}
                status={checked[index] ? 'checked' : 'unchecked'}
                onPress={() => setChecked((prev) => ({ ...prev, [index]: !prev[index] }))}
                position="leading"
                labelStyle={[
                  styles.ingredientLabel,
                  checked[index] && { textDecorationLine: 'line-through', opacity: 0.55 },
                ]}
              />
            ))}
          </Card>

          {/* Instructions */}
          <SectionTitle>Instructions</SectionTitle>
          {recipe.instructions.map((step, index) => (
            <View key={`${index}-${step.slice(0, 12)}`} style={styles.step}>
              <View style={[styles.stepNumber, { backgroundColor: theme.colors.primary }]}>
                <Text style={{ color: theme.colors.onPrimary, fontWeight: '700' }}>{index + 1}</Text>
              </View>
              <Text variant="bodyMedium" style={[styles.stepText, { color: theme.colors.onSurface }]}>
                {step}
              </Text>
            </View>
          ))}

          {/* Nutrition */}
          <SectionTitle>Nutrition</SectionTitle>
          <Card style={{ backgroundColor: theme.colors.surface }} elevation={1}>
            <Card.Content style={styles.nutrition}>
              <View style={styles.nutritionItem}>
                <Text variant="headlineSmall" style={{ color: theme.colors.primary, fontWeight: '700' }}>
                  {recipe.caloriesPerServing}
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  kcal per serving
                </Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text variant="headlineSmall" style={{ color: theme.colors.onSurface, fontWeight: '700' }}>
                  {recipe.servings}
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  servings
                </Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text variant="headlineSmall" style={{ color: theme.colors.onSurface, fontWeight: '700' }}>
                  {recipe.caloriesPerServing * recipe.servings}
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  kcal whole recipe
                </Text>
              </View>
            </Card.Content>
          </Card>

          {/* Tags */}
          {recipe.tags.length > 0 && (
            <>
              <SectionTitle>Tags</SectionTitle>
              <View style={styles.chipRow}>
                {recipe.tags.map((tag) => (
                  <Chip key={tag} compact>
                    {tag}
                  </Chip>
                ))}
              </View>
            </>
          )}

          {/* Reviews */}
          <SectionTitle>Reviews</SectionTitle>
          <Card style={{ backgroundColor: theme.colors.surface }} elevation={1}>
            <Card.Content>
              <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
                Write a review
              </Text>
              <View style={styles.pickRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <IconButton
                    key={star}
                    icon={star <= rating ? 'star' : 'star-outline'}
                    iconColor="#F9A825"
                    size={28}
                    onPress={() => setRating(star)}
                    accessibilityLabel={`Rate ${star} star${star > 1 ? 's' : ''}`}
                    testID={`review-star-${star}`}
                  />
                ))}
              </View>
              <TextInput
                mode="outlined"
                label="Share your thoughts"
                value={comment}
                onChangeText={setComment}
                multiline
                numberOfLines={3}
                testID="review-comment"
              />
              <Button
                mode="contained"
                onPress={submitReview}
                disabled={rating === 0 || comment.trim().length < 3 || submitting}
                loading={submitting}
                style={styles.submit}
                testID="review-submit"
              >
                Post review
              </Button>
            </Card.Content>
          </Card>

          {reviews.length === 0 ? (
            <Text
              variant="bodyMedium"
              style={[styles.noReviews, { color: theme.colors.onSurfaceVariant }]}
            >
              {recipe.reviewCount} people have rated this recipe. Be the first to leave a written
              review!
            </Text>
          ) : (
            reviews.map((review) => (
              <View key={review.id} style={styles.review} testID={`review-${review.id}`}>
                <View style={styles.reviewHeader}>
                  <Text variant="titleSmall" style={{ color: theme.colors.onSurface }}>
                    {review.author}
                  </Text>
                  <StarRating rating={review.rating} size={14} />
                </View>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
                  {review.comment}
                </Text>
                <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  {new Date(review.createdAt).toLocaleDateString()}
                </Text>
                <Divider style={styles.reviewDivider} />
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingBottom: 40, ...contentWidth },
  padded: { padding: 16 },
  gap: { marginTop: 12 },
  hero: { width: '100%', aspectRatio: 4 / 3, backgroundColor: '#EFEBE9' },
  heroActions: { position: 'absolute', top: 8, right: 8, flexDirection: 'row' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12, alignItems: 'center' },
  tiles: { flexDirection: 'row', gap: 8, marginTop: 16 },
  tile: { flex: 1, alignItems: 'center', borderRadius: 14, paddingBottom: 10 },
  tileIcon: { margin: 0 },
  sectionTitle: { fontWeight: '700', marginTop: 24, marginBottom: 10 },
  ingredientLabel: { textAlign: 'left' },
  step: { flexDirection: 'row', marginBottom: 14, gap: 12 },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: { flex: 1, lineHeight: 22 },
  nutrition: { flexDirection: 'row', paddingVertical: 12 },
  nutritionItem: { flex: 1, alignItems: 'center' },
  pickRow: { flexDirection: 'row', marginVertical: 4, marginLeft: -8 },
  submit: { marginTop: 12 },
  noReviews: { marginTop: 14 },
  review: { marginTop: 14 },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  reviewDivider: { marginTop: 10 },
});