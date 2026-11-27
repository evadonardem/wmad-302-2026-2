/**
 * Reusable UI Components
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Platform,
} from 'react-native';
import type { DimensionValue, ImageSourcePropType, ImageStyle, StyleProp, ViewStyle } from 'react-native';
import { Card, Title, Chip, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { Recipe } from '@/types/recipe';
import { colors } from '@/constants/colors';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

// The croc chef logo (assets/croc-logo.png)
export const crocLogo: ImageSourcePropType = require('../assets/croc-logo.png');

interface LogoProps {
  size?: number;
  style?: StyleProp<ImageStyle>;
}

// Croc Book logo, used on the login/register screens, Home header and error screen
export function Logo({ size = 96, style }: LogoProps) {
  return (
    <Image
      source={crocLogo}
      style={[{ width: size, height: size }, style]}
      resizeMode="contain"
      accessibilityLabel="Croc Book logo"
    />
  );
}

interface RecipeCardProps {
  recipe: Recipe;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

// Large card with a big photo (Home screen)
export function RecipeCard({ recipe, onPress, style }: RecipeCardProps) {
  return (
    <TouchableOpacity
      style={[styles.cardWrapper, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Card style={styles.card} elevation={2}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: recipe.image }}
            style={styles.recipeImage}
            resizeMode="cover"
          />
          <View style={styles.difficultyBadge}>
            <Chip style={[
              styles.difficultyChip,
              recipe.difficulty === 'Easy' && styles.easy,
              recipe.difficulty === 'Medium' && styles.medium,
              recipe.difficulty === 'Hard' && styles.hard,
            ]}>
              {recipe.difficulty}
            </Chip>
          </View>
        </View>
        <Card.Content style={styles.cardContent}>
          <Title style={styles.recipeTitle} numberOfLines={1}>
            {recipe.name}
          </Title>
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>
              ⏱️ {recipe.prepTimeMinutes + recipe.cookTimeMinutes} min
            </Text>
            <Text style={styles.metaText}>👥 {recipe.servings} servings</Text>
            <Text style={styles.metaText}>🔥 {recipe.caloriesPerServing} cal</Text>
          </View>
          <View style={styles.cuisineRow}>
            <Chip style={styles.cuisineChip}>{recipe.cuisine}</Chip>
            {recipe.mealType.slice(0, 2).map((meal) => (
              <Chip key={meal} style={styles.cuisineChip}>{meal}</Chip>
            ))}
          </View>
          <View style={styles.ratingRow}>
            <Text style={styles.ratingText}>
              ⭐ {recipe.rating.toFixed(1)} ({recipe.reviewCount} reviews)
            </Text>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
}

interface RecipeListItemProps {
  recipe: Recipe;
  onPress: () => void;
  // Optional element on the right (e.g. a remove button)
  right?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

// Compact row with a small photo (Search results and Favorites)
export function RecipeListItem({ recipe, onPress, right, style }: RecipeListItemProps) {
  return (
    <TouchableOpacity style={[styles.listWrapper, style]} onPress={onPress} activeOpacity={0.8}>
      <Card style={styles.card} elevation={1}>
        <View style={styles.listRow}>
          <Image source={{ uri: recipe.image }} style={styles.listImage} resizeMode="cover" />
          <View style={styles.listInfo}>
            <Title style={styles.listTitle} numberOfLines={1}>{recipe.name}</Title>
            <View style={styles.listMeta}>
              <Chip style={styles.cuisineChip}>{recipe.difficulty}</Chip>
              <Chip style={styles.cuisineChip}>{recipe.cuisine}</Chip>
            </View>
            <Text style={styles.metaText}>
              ⏱️ {recipe.prepTimeMinutes + recipe.cookTimeMinutes}min · 👥 {recipe.servings} · ⭐ {recipe.rating}
            </Text>
          </View>
          {right}
        </View>
      </Card>
    </TouchableOpacity>
  );
}

interface CategoryChipProps {
  label: string;
  selected?: boolean;
  onPress: () => void;
  icon?: IconName;
  style?: StyleProp<ViewStyle>;
}

export function CategoryChip({ label, selected, onPress, icon, style }: CategoryChipProps) {
  return (
    <TouchableOpacity
      style={[
        styles.categoryChip,
        selected && styles.categoryChipSelected,
        style,
      ]}
      onPress={onPress}
    >
      {icon && (
        <MaterialCommunityIcons
          name={icon}
          size={16}
          color={selected ? colors.onPrimary : colors.primary}
          style={styles.chipIcon}
        />
      )}
      <Text style={[
        styles.categoryChipText,
        selected && styles.categoryChipTextSelected,
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

export function LoadingOverlay({ visible, message = 'Loading...' }: LoadingOverlayProps) {
  if (!visible) return null;

  return (
    <View style={styles.loadingOverlay}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.loadingText}>{message}</Text>
    </View>
  );
}

interface EmptyStateProps {
  icon: IconName;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons name={icon} size={80} color={colors.icon} />
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyMessage}>{message}</Text>
      {actionLabel && onAction && (
        <Button mode="contained" onPress={onAction} style={styles.actionButton}>
          {actionLabel}
        </Button>
      )}
    </View>
  );
}

interface SkeletonProps {
  height?: number;
  width?: DimensionValue;
  borderRadius?: number;
}

// Grey placeholder block that gently pulses while content loads
export function Skeleton({ height = 20, width = '100%', borderRadius = 8 }: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const useNativeDriver = Platform.OS !== 'web';
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver }),
        Animated.timing(opacity, { toValue: 0.5, duration: 700, useNativeDriver }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { height, width, borderRadius, opacity },
      ]}
    />
  );
}

// Placeholder shaped like a RecipeCard
export function RecipeCardSkeleton() {
  return (
    <View style={styles.skeletonCard}>
      <Skeleton height={180} borderRadius={16} />
      <View style={styles.skeletonLines}>
        <Skeleton height={18} width="70%" />
        <Skeleton height={14} width="90%" />
        <Skeleton height={14} width="40%" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    marginBottom: 12,
  },
  card: {
    borderRadius: 16,
    backgroundColor: colors.surface,
  },
  imageContainer: {
    position: 'relative',
    height: 180,
    // Round the photo's top corners here (overflow hidden on the card would hide its shadow)
    overflow: 'hidden',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  recipeImage: {
    width: '100%',
    height: '100%',
  },
  difficultyBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 1,
  },
  difficultyChip: {
    borderRadius: 12,
  },
  easy: {
    backgroundColor: colors.easy,
  },
  medium: {
    backgroundColor: colors.medium,
  },
  hard: {
    backgroundColor: colors.hard,
  },
  cardContent: {
    padding: 16,
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metaText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500',
  },
  cuisineRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  cuisineChip: {
    backgroundColor: colors.primaryLight,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '500',
  },
  listWrapper: {
    marginBottom: 8,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  listImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  listInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  listTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  listMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 4,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipIcon: {
    marginRight: 4,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.primary,
  },
  categoryChipTextSelected: {
    color: colors.onPrimary,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    zIndex: 100,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.textMuted,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginTop: 20,
  },
  emptyMessage: {
    fontSize: 16,
    color: colors.textMuted,
    marginTop: 8,
    textAlign: 'center',
  },
  actionButton: {
    marginTop: 24,
    borderRadius: 12,
    height: 52,
  },
  skeleton: {
    backgroundColor: colors.border,
    borderRadius: 8,
  },
  skeletonCard: {
    marginBottom: 16,
  },
  skeletonLines: {
    paddingTop: 12,
    gap: 8,
  },
});