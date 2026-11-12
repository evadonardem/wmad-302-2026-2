/**
 * Reusable UI Components
 * Shared by Home, Search, Favorites and the error boundary so the screens look
 * consistent and the markup lives in one place.
 */

import React, { ComponentProps, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  StyleProp,
  TouchableOpacity,
  ActivityIndicator,
  ViewStyle,
} from 'react-native';
import { Button, Card, Chip, IconButton, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Recipe, RecipeDifficulty } from '@/types/recipe';
import { totalTime } from '@/utils/recipeFilters';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

const DIFFICULTY_COLORS: Record<RecipeDifficulty, { background: string; text: string }> = {
  Easy: { background: '#E8F5E9', text: '#2E7D32' },
  Medium: { background: '#FFF3E0', text: '#EF6C00' },
  Hard: { background: '#FFEBEE', text: '#C62828' },
};

/* ------------------------------------------------------------------ */
/* Recipe card (large) - used on Home                                  */
/* ------------------------------------------------------------------ */

interface RecipeCardProps {
  recipe: Recipe;
  onPress: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  style?: StyleProp<ViewStyle>;
}

export function RecipeCard({ recipe, onPress, isFavorite, onToggleFavorite, style }: RecipeCardProps) {
  const theme = useTheme();
  const difficulty = DIFFICULTY_COLORS[recipe.difficulty];

  return (
    <TouchableOpacity style={style} onPress={onPress} activeOpacity={0.8}>
      <Card style={cardStyles.card} elevation={2}>
        <View>
          <Image source={{ uri: recipe.image }} style={cardStyles.image} resizeMode="cover" />
          <IconButton
            icon={isFavorite ? 'heart' : 'heart-outline'}
            mode="contained"
            containerColor="rgba(255,255,255,0.92)"
            iconColor={theme.colors.error}
            size={20}
            onPress={onToggleFavorite}
            accessibilityLabel={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            style={cardStyles.heart}
          />
          <Chip
            compact
            style={[cardStyles.difficulty, { backgroundColor: difficulty.background }]}
            textStyle={{ color: difficulty.text }}
          >
            {recipe.difficulty}
          </Chip>
        </View>
        <Card.Content style={cardStyles.content}>
          <Text style={[cardStyles.title, { color: theme.colors.onSurface }]} numberOfLines={1}>
            {recipe.name}
          </Text>
          <View style={cardStyles.metaRow}>
            <Text style={[cardStyles.meta, { color: theme.colors.onSurfaceVariant }]}>
              ⏱️ {totalTime(recipe)} min
            </Text>
            <Text style={[cardStyles.meta, { color: theme.colors.onSurfaceVariant }]}>
              👥 {recipe.servings} servings
            </Text>
            <Text style={[cardStyles.meta, { color: theme.colors.onSurfaceVariant }]}>
              🔥 {recipe.caloriesPerServing} cal
            </Text>
          </View>
          <View style={cardStyles.chips}>
            <Chip compact>{recipe.cuisine}</Chip>
            {recipe.mealType.slice(0, 2).map((meal) => (
              <Chip key={meal} compact>
                {meal}
              </Chip>
            ))}
          </View>
          <Text style={[cardStyles.rating, { color: theme.colors.onSurfaceVariant }]}>
            ⭐ {recipe.rating.toFixed(1)} ({recipe.reviewCount} reviews)
          </Text>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
}

/* ------------------------------------------------------------------ */
/* Recipe list item (row) - used on Search and Favorites               */
/* ------------------------------------------------------------------ */

interface RecipeListItemProps {
  recipe: Recipe;
  onPress: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  style?: StyleProp<ViewStyle>;
}

export function RecipeListItem({ recipe, onPress, isFavorite, onToggleFavorite, style }: RecipeListItemProps) {
  const theme = useTheme();

  return (
    <TouchableOpacity style={style} onPress={onPress} activeOpacity={0.8}>
      <Card elevation={1}>
        <View style={rowStyles.row}>
          <Image source={{ uri: recipe.image }} style={rowStyles.image} resizeMode="cover" />
          <View style={rowStyles.info}>
            <Text style={[rowStyles.title, { color: theme.colors.onSurface }]} numberOfLines={1}>
              {recipe.name}
            </Text>
            <View style={rowStyles.chips}>
              <Chip compact>{recipe.difficulty}</Chip>
              <Chip compact>{recipe.cuisine}</Chip>
            </View>
            <Text style={[rowStyles.details, { color: theme.colors.onSurfaceVariant }]}>
              ⏱️ {totalTime(recipe)}min · 🔥 {recipe.caloriesPerServing} cal · ⭐ {recipe.rating.toFixed(1)}
            </Text>
          </View>
          <IconButton
            icon={isFavorite ? 'heart' : 'heart-outline'}
            iconColor={theme.colors.error}
            size={22}
            onPress={onToggleFavorite}
            accessibilityLabel={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          />
        </View>
      </Card>
    </TouchableOpacity>
  );
}

/* ------------------------------------------------------------------ */
/* Loading / empty / error states                                      */
/* ------------------------------------------------------------------ */

export function LoadingState({ message = 'Loading...' }: { message?: string }) {
  const theme = useTheme();
  return (
    <View style={stateStyles.center}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text style={[stateStyles.message, { color: theme.colors.onSurfaceVariant }]}>{message}</Text>
    </View>
  );
}

interface EmptyStateProps {
  icon: IconName;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, message, actionLabel, onAction }: EmptyStateProps) {
  const theme = useTheme();
  return (
    <View style={stateStyles.center}>
      <MaterialCommunityIcons name={icon} size={72} color={theme.colors.outline} />
      <Text style={[stateStyles.title, { color: theme.colors.onSurface }]}>{title}</Text>
      {message ? (
        <Text style={[stateStyles.message, { color: theme.colors.onSurfaceVariant }]}>{message}</Text>
      ) : null}
      {actionLabel && onAction ? (
        <Button mode="contained" onPress={onAction} style={stateStyles.action}>
          {actionLabel}
        </Button>
      ) : null}
    </View>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <EmptyState
      icon="alert-circle-outline"
      title="Something went wrong"
      message={message}
      actionLabel={onRetry ? 'Try again' : undefined}
      onAction={onRetry}
    />
  );
}

/**
 * Friendly full-screen message shown by the error boundaries in the root and
 * (app) layouts when a screen crashes while rendering.
 */
export function ErrorFallback({ error, onRetry }: { error: Error; onRetry: () => void }) {
  useEffect(() => {
    console.error('Unhandled screen error:', error);
  }, [error]);

  return (
    <EmptyState
      icon="emoticon-sad-outline"
      title="Oops, something broke"
      message="This screen ran into a problem. Please try again."
      actionLabel="Try again"
      onAction={onRetry}
    />
  );
}

/* ------------------------------------------------------------------ */

const cardStyles = StyleSheet.create({
  card: { borderRadius: 16, overflow: 'hidden' },
  image: { width: '100%', height: 180 },
  heart: { position: 'absolute', top: 4, left: 4 },
  difficulty: { position: 'absolute', top: 12, right: 12 },
  content: { paddingTop: 12, paddingBottom: 14 },
  title: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 8 },
  meta: { fontSize: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  rating: { fontSize: 13 },
});

const rowStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', padding: 10 },
  image: { width: 80, height: 80, borderRadius: 10 },
  info: { flex: 1, marginLeft: 12 },
  title: { fontSize: 15, fontWeight: '700', marginBottom: 6 },
  chips: { flexDirection: 'row', gap: 6, marginBottom: 6 },
  details: { fontSize: 12 },
});

const stateStyles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  title: { fontSize: 20, fontWeight: '700', marginTop: 16, textAlign: 'center' },
  message: { fontSize: 14, marginTop: 8, textAlign: 'center' },
  action: { marginTop: 20 },
});