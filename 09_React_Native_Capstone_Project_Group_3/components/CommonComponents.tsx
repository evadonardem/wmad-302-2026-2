/**
 * Reusable UI Components
 */

import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Image,
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
  ActivityIndicator,
} from 'react-native';
import { Button, Card, IconButton, Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { difficultyColors } from '@/constants/theme';
import type { Recipe } from '@/types/recipe';

export type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

// ---------------------------------------------------------------------------
// Recipe card
// ---------------------------------------------------------------------------

export type RecipeSummary = Pick<
  Recipe,
  | 'id'
  | 'name'
  | 'image'
  | 'difficulty'
  | 'cuisine'
  | 'prepTimeMinutes'
  | 'cookTimeMinutes'
  | 'servings'
  | 'rating'
  | 'reviewCount'
  | 'caloriesPerServing'
>;

interface RecipeCardProps {
  recipe: RecipeSummary;
  onPress: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  variant?: 'full' | 'compact';
  style?: StyleProp<ViewStyle>;
}

export function DifficultyBadge({ difficulty }: { difficulty: Recipe['difficulty'] }) {
  const colors = difficultyColors[difficulty] ?? difficultyColors.Medium;
  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }]}>
      <Text style={[styles.badgeText, { color: colors.fg }]}>{difficulty}</Text>
    </View>
  );
}

export function RecipeCard({
  recipe,
  onPress,
  isFavorite = false,
  onToggleFavorite,
  variant = 'full',
  style,
}: RecipeCardProps) {
  const theme = useTheme();
  const minutes = recipe.prepTimeMinutes + recipe.cookTimeMinutes;
  const favoriteButton = onToggleFavorite ? (
    <IconButton
      icon={isFavorite ? 'heart' : 'heart-outline'}
      iconColor={isFavorite ? '#E53935' : theme.colors.onSurfaceVariant}
      size={22}
      onPress={onToggleFavorite}
      accessibilityLabel={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      testID={`favorite-button-${recipe.id}`}
    />
  ) : null;

  if (variant === 'compact') {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
        style={style}
        testID={`recipe-card-${recipe.id}`}
      >
        <Card style={{ backgroundColor: theme.colors.surface }} elevation={1}>
          <View style={styles.compactRow}>
            <Image source={{ uri: recipe.image }} style={styles.compactImage} resizeMode="cover" />
            <View style={styles.compactInfo}>
              <Text variant="titleMedium" numberOfLines={1} style={{ color: theme.colors.onSurface }}>
                {recipe.name}
              </Text>
              <View style={styles.compactMeta}>
                <DifficultyBadge difficulty={recipe.difficulty} />
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  {recipe.cuisine}
                </Text>
              </View>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                ⏱️ {minutes} min · 👥 {recipe.servings} · ⭐ {recipe.rating.toFixed(1)}
              </Text>
            </View>
            {favoriteButton}
          </View>
        </Card>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={style}
      testID={`recipe-card-${recipe.id}`}
    >
      <Card style={{ backgroundColor: theme.colors.surface }} elevation={2}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: recipe.image }} style={styles.recipeImage} resizeMode="contain" />
          <View style={styles.difficultyOverlay}>
            <DifficultyBadge difficulty={recipe.difficulty} />
          </View>
          {favoriteButton && (
            <View style={[styles.favoriteOverlay, { backgroundColor: theme.colors.surface }]}>
              {favoriteButton}
            </View>
          )}
        </View>
        <Card.Content style={styles.cardContent}>
          <Text variant="titleMedium" numberOfLines={1} style={{ color: theme.colors.onSurface }}>
            {recipe.name}
          </Text>
          <View style={styles.metaRow}>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              ⏱️ {minutes} min
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              👥 {recipe.servings} servings
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              🔥 {recipe.caloriesPerServing} cal
            </Text>
          </View>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {recipe.cuisine} · ⭐ {recipe.rating.toFixed(1)} ({recipe.reviewCount} reviews)
          </Text>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
}

// ---------------------------------------------------------------------------
// Category chip
// ---------------------------------------------------------------------------

interface CategoryChipProps {
  label: string;
  selected?: boolean;
  onPress: () => void;
  icon?: string;
  style?: StyleProp<ViewStyle>;
}

export function CategoryChip({ label, selected = false, onPress, icon, style }: CategoryChipProps) {
  const theme = useTheme();
  const foreground = selected ? theme.colors.onPrimary : theme.colors.primary;
  return (
    <TouchableOpacity
      style={[
        styles.categoryChip,
        {
          backgroundColor: selected ? theme.colors.primary : theme.colors.surface,
          borderColor: selected ? theme.colors.primary : theme.colors.outlineVariant,
        },
        style,
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      {icon ? (
        <MaterialCommunityIcons
          name={icon as IconName}
          size={16}
          color={foreground}
          style={styles.chipIcon}
        />
      ) : null}
      <Text style={[styles.categoryChipText, { color: foreground }]}>{label}</Text>
    </TouchableOpacity>
  );
}

// ---------------------------------------------------------------------------
// Loading / empty / error states
// ---------------------------------------------------------------------------

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

export function LoadingOverlay({ visible, message = 'Loading...' }: LoadingOverlayProps) {
  const theme = useTheme();
  if (!visible) return null;

  return (
    <View style={[styles.loadingOverlay, { backgroundColor: theme.colors.background + 'CC' }]}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text variant="bodyLarge" style={styles.loadingText}>
        {message}
      </Text>
    </View>
  );
}

interface EmptyStateProps {
  icon: string;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, message, actionLabel, onAction }: EmptyStateProps) {
  const theme = useTheme();
  return (
    <View style={styles.stateContainer}>
      <MaterialCommunityIcons name={icon as IconName} size={80} color={theme.colors.outline} />
      <Text variant="titleLarge" style={[styles.stateTitle, { color: theme.colors.onSurface }]}>
        {title}
      </Text>
      <Text
        variant="bodyMedium"
        style={[styles.stateMessage, { color: theme.colors.onSurfaceVariant }]}
      >
        {message}
      </Text>
      {actionLabel && onAction ? (
        <Button mode="contained" onPress={onAction} style={styles.actionButton}>
          {actionLabel}
        </Button>
      ) : null}
    </View>
  );
}

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  const theme = useTheme();
  return (
    <View style={styles.stateContainer} testID="error-state">
      <MaterialCommunityIcons name="alert-circle-outline" size={64} color={theme.colors.error} />
      <Text variant="titleMedium" style={[styles.stateTitle, { color: theme.colors.onSurface }]}>
        Something went wrong
      </Text>
      <Text
        variant="bodyMedium"
        style={[styles.stateMessage, { color: theme.colors.onSurfaceVariant }]}
      >
        {message}
      </Text>
      {onRetry ? (
        <Button mode="contained" onPress={onRetry} style={styles.actionButton} icon="refresh">
          Try again
        </Button>
      ) : null}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Skeletons
// ---------------------------------------------------------------------------

interface SkeletonProps {
  height?: number;
  width?: number | `${number}%`;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

export function Skeleton({ height = 20, width = '100%', borderRadius = 8, style }: SkeletonProps) {
  const theme = useTheme();
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        { height, width, borderRadius, opacity, backgroundColor: theme.colors.outlineVariant },
        style,
      ]}
    />
  );
}

export function RecipeCardSkeleton({ variant = 'full' }: { variant?: 'full' | 'compact' }) {
  if (variant === 'compact') {
    return (
      <View style={styles.compactSkeleton}>
        <Skeleton width={96} height={96} borderRadius={12} />
        <View style={styles.compactSkeletonText}>
          <Skeleton height={18} width="70%" />
          <Skeleton height={14} width="40%" style={styles.skeletonGap} />
          <Skeleton height={14} width="55%" style={styles.skeletonGap} />
        </View>
      </View>
    );
  }
  return (
    <View style={styles.fullSkeleton}>
      <Skeleton height={220} borderRadius={16} />
      <Skeleton height={18} width="60%" style={styles.skeletonGap} />
      <Skeleton height={14} width="80%" style={styles.skeletonGap} />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Star rating (display only)
// ---------------------------------------------------------------------------

export function StarRating({ rating, size = 18 }: { rating: number; size?: number }) {
  return (
    <View style={styles.stars} accessibilityLabel={`Rated ${rating.toFixed(1)} out of 5`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const name: IconName =
          rating >= star ? 'star' : rating >= star - 0.5 ? 'star-half-full' : 'star-outline';
        return <MaterialCommunityIcons key={star} name={name} size={size} color="#F9A825" />;
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  imageContainer: { position: 'relative', width: '100%', aspectRatio: 4 / 3 },
  recipeImage: { width: '100%', height: '100%', backgroundColor: '#EFEBE9' },
  difficultyOverlay: { position: 'absolute', bottom: 10, left: 12 },
  favoriteOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    borderRadius: 20,
    opacity: 0.95,
  },
  cardContent: { paddingVertical: 14 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 8 },
  compactRow: { flexDirection: 'row', alignItems: 'center', padding: 8 },
  compactImage: { width: 96, height: 96, borderRadius: 12 },
  compactInfo: { flex: 1, marginLeft: 12, gap: 4 },
  compactMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chipIcon: { marginRight: 4 },
  categoryChipText: { fontSize: 13, fontWeight: '500' },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  loadingText: { marginTop: 12 },
  stateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  stateTitle: { marginTop: 16, fontWeight: '700', textAlign: 'center' },
  stateMessage: { marginTop: 8, textAlign: 'center' },
  actionButton: { marginTop: 24, borderRadius: 12 },
  compactSkeleton: { flexDirection: 'row', padding: 8, marginBottom: 8 },
  compactSkeletonText: { flex: 1, marginLeft: 12, justifyContent: 'center' },
  fullSkeleton: { marginBottom: 20 },
  skeletonGap: { marginTop: 8 },
  stars: { flexDirection: 'row' },
});