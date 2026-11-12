/**
 * Recipe Detail Screen  -  route: /recipe/{id}
 * Shows the full recipe: image, quick facts, rating, nutrition, ingredients
 * (tick them off as you cook), step-by-step instructions and tags.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { View, ScrollView, Image, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ActivityIndicator,
  Button,
  Checkbox,
  Chip,
  Divider,
  IconButton,
  Text,
  useTheme,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { recipeApi } from '@/services/recipeApi';
import { useFavorites } from '@/context/FavoritesContext';
import { Recipe } from '@/types/recipe';

/** Five stars, filled according to the rating (supports half stars). */
function Stars({ rating }: { rating: number }) {
  return (
    <View style={styles.starsRow}>
      {[1, 2, 3, 4, 5].map((i) => {
        const name = rating >= i ? 'star' : rating >= i - 0.5 ? 'star-half-full' : 'star-outline';
        return <MaterialCommunityIcons key={i} name={name} size={18} color="#F9A825" />;
      })}
    </View>
  );
}

/** One small "icon + label" fact, e.g. clock + "35 min". */
function Fact({
  icon,
  label,
}: {
  icon: 'clock-outline' | 'account-group-outline' | 'silverware-fork-knife';
  label: string;
}) {
  const theme = useTheme();
  return (
    <View style={styles.fact}>
      <MaterialCommunityIcons name={icon} size={20} color={theme.colors.primary} />
      <Text variant="labelLarge" style={{ color: theme.colors.onSurface }}>
        {label}
      </Text>
    </View>
  );
}

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Indexes of ingredients the user has ticked off
  const [checked, setChecked] = useState<Set<number>>(new Set());

  const load = useCallback(async () => {
    const recipeId = Number(id);
    if (!Number.isInteger(recipeId)) {
      setError('Recipe not found');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setRecipe(await recipeApi.getRecipeById(recipeId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recipe');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  // If the page was opened directly there's nothing to go back to, so go Home.
  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(app)/(tabs)/home');
  };

  const toggleIngredient = (index: number) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const backButton = (
    <IconButton
      icon="arrow-left"
      mode="contained"
      containerColor="rgba(255,255,255,0.92)"
      iconColor={theme.colors.onSurface}
      onPress={goBack}
      accessibilityLabel="Go back"
      style={[styles.backButton, { top: insets.top + 8 }]}
    />
  );

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        {backButton}
        <ActivityIndicator size="large" />
        <Text variant="bodyMedium" style={styles.centerText}>
          Loading recipe...
        </Text>
      </View>
    );
  }

  if (error || !recipe) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        {backButton}
        <MaterialCommunityIcons
          name="alert-circle-outline"
          size={64}
          color={theme.colors.outline}
        />
        <Text variant="titleMedium" style={styles.centerText}>
          {error ?? 'Recipe not found'}
        </Text>
        <Button mode="contained" onPress={load} style={styles.retry}>
          Try again
        </Button>
      </View>
    );
  }

  const totalTime = recipe.prepTimeMinutes + recipe.cookTimeMinutes;
  const difficultyColor =
    recipe.difficulty === 'Easy'
      ? theme.colors.tertiary
      : recipe.difficulty === 'Hard'
        ? theme.colors.error
        : theme.colors.primary;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>
        {/* Hero image */}
        <Image source={{ uri: recipe.image }} style={styles.heroImage} resizeMode="cover" />

        <View style={styles.body}>
          {/* Title + cuisine / difficulty */}
          <Text variant="headlineSmall" style={{ color: theme.colors.onSurface }}>
            {recipe.name}
          </Text>
          <View style={styles.chipRow}>
            <Chip icon="earth" compact>
              {recipe.cuisine}
            </Chip>
            <Chip
              icon="speedometer"
              compact
              textStyle={{ color: difficultyColor }}
              style={{ backgroundColor: theme.colors.surfaceVariant }}
            >
              {recipe.difficulty}
            </Chip>
            {recipe.mealType.map((meal) => (
              <Chip key={meal} compact>
                {meal}
              </Chip>
            ))}
          </View>

          {/* Rating */}
          <View style={styles.ratingRow}>
            <Stars rating={recipe.rating} />
            <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
              {recipe.rating.toFixed(1)}
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              ({recipe.reviewCount} reviews)
            </Text>
          </View>

          {/* Quick facts */}
          <View style={[styles.factsCard, { backgroundColor: theme.colors.primaryContainer }]}>
            <Fact icon="clock-outline" label={`${totalTime} min total`} />
            <Fact
              icon="silverware-fork-knife"
              label={`Prep ${recipe.prepTimeMinutes} · Cook ${recipe.cookTimeMinutes}`}
            />
            <Fact icon="account-group-outline" label={`${recipe.servings} servings`} />
          </View>

          {/* Nutrition */}
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Nutrition
          </Text>
          <View style={styles.nutritionRow}>
            <View style={[styles.nutritionTile, { backgroundColor: theme.colors.surfaceVariant }]}>
              <Text variant="headlineSmall" style={{ color: theme.colors.primary }}>
                {recipe.caloriesPerServing}
              </Text>
              <Text variant="labelMedium">kcal / serving</Text>
            </View>
            <View style={[styles.nutritionTile, { backgroundColor: theme.colors.surfaceVariant }]}>
              <Text variant="headlineSmall" style={{ color: theme.colors.primary }}>
                {recipe.caloriesPerServing * recipe.servings}
              </Text>
              <Text variant="labelMedium">kcal / whole recipe</Text>
            </View>
          </View>

          {/* Ingredients */}
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Ingredients ({recipe.ingredients.length})
          </Text>
          {recipe.ingredients.map((ingredient, index) => (
            <View key={`${ingredient}-${index}`} style={styles.ingredientRow}>
              <Checkbox
                status={checked.has(index) ? 'checked' : 'unchecked'}
                onPress={() => toggleIngredient(index)}
              />
              <Text
                variant="bodyLarge"
                onPress={() => toggleIngredient(index)}
                style={[
                  styles.ingredientText,
                  { color: theme.colors.onSurface },
                  checked.has(index) && styles.strike,
                ]}
              >
                {ingredient}
              </Text>
            </View>
          ))}

          <Divider style={styles.divider} />

          {/* Instructions */}
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Instructions
          </Text>
          {recipe.instructions.map((step, index) => (
            <View key={`${index}-${step.slice(0, 12)}`} style={styles.stepRow}>
              <View style={[styles.stepNumber, { backgroundColor: theme.colors.primary }]}>
                <Text variant="labelLarge" style={{ color: theme.colors.onPrimary }}>
                  {index + 1}
                </Text>
              </View>
              <Text
                variant="bodyLarge"
                style={[styles.stepText, { color: theme.colors.onSurface }]}
              >
                {step}
              </Text>
            </View>
          ))}

          <Divider style={styles.divider} />

          {/* Tags */}
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Tags
          </Text>
          <View style={styles.chipRow}>
            {recipe.tags.map((tag) => (
              <Chip key={tag} compact>
                {tag}
              </Chip>
            ))}
          </View>
        </View>
      </ScrollView>

      {backButton}
      <IconButton
        icon={isFavorite(recipe.id) ? 'heart' : 'heart-outline'}
        mode="contained"
        containerColor="rgba(255,255,255,0.92)"
        iconColor="#C62828"
        onPress={() => toggleFavorite(recipe.id)}
        accessibilityLabel={isFavorite(recipe.id) ? 'Remove from favorites' : 'Add to favorites'}
        style={[styles.heartButton, { top: insets.top + 8 }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  centerText: { marginTop: 16, textAlign: 'center' },
  retry: { marginTop: 16 },
  backButton: { position: 'absolute', left: 12 },
  heartButton: { position: 'absolute', right: 12 },
  heroImage: { width: '100%', height: 280 },
  body: { padding: 20 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  starsRow: { flexDirection: 'row' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14 },
  factsCard: { borderRadius: 12, padding: 14, marginTop: 18, gap: 10 },
  fact: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sectionTitle: { marginTop: 24, marginBottom: 10 },
  nutritionRow: { flexDirection: 'row', gap: 12 },
  nutritionTile: { flex: 1, borderRadius: 12, padding: 14, alignItems: 'center' },
  ingredientRow: { flexDirection: 'row', alignItems: 'center' },
  ingredientText: { flex: 1 },
  strike: { textDecorationLine: 'line-through', opacity: 0.5 },
  divider: { marginTop: 20 },
  stepRow: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: { flex: 1 },
});
