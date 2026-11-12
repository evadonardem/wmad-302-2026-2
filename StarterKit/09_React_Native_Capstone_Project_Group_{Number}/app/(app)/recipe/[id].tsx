/**
 * Recipe Detail Screen - full recipe view
 * Route: /(app)/recipe/[id]
 * API: GET /recipes/{id}
 */
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Image, ActivityIndicator, StyleSheet } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Button, Chip, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { recipeApi } from '@/services/recipeApi';
import { useFavorites } from '@/context/FavoritesContext';
import type { Recipe } from '@/types/recipe';

type StarName = 'star' | 'star-half-full' | 'star-outline';

// 5 stars from a 0-5 rating
function getStars(rating: number): StarName[] {
  return Array.from({ length: 5 }, (_, index): StarName => {
    if (rating >= index + 1) return 'star';
    if (rating >= index + 0.5) return 'star-half-full';
    return 'star-outline';
  });
}

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRecipe = useCallback(async () => {
    const recipeId = Number(id);
    if (!Number.isInteger(recipeId)) {
      setError('Invalid recipe');
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
    loadRecipe();
  }, [loadRecipe]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <Stack.Screen options={{ title: 'Recipe' }} />
        <ActivityIndicator size="large" color="#E85D04" />
        <Text style={styles.mutedText}>Loading recipe...</Text>
      </View>
    );
  }

  if (error || !recipe) {
    return (
      <View style={styles.centered}>
        <Stack.Screen options={{ title: 'Recipe' }} />
        <MaterialCommunityIcons name="alert-circle-outline" size={64} color="#BCAAA4" />
        <Text style={styles.errorText}>{error ?? 'Recipe not found'}</Text>
        <Button mode="contained" onPress={loadRecipe}>
          Retry
        </Button>
      </View>
    );
  }

  const favorite = isFavorite(recipe.id);
  const totalMinutes = recipe.prepTimeMinutes + recipe.cookTimeMinutes;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: recipe.name }} />

      <Image source={{ uri: recipe.image }} style={styles.heroImage} resizeMode="cover" />

      <View style={styles.body}>
        {/* Title + rating */}
        <Text style={styles.title}>{recipe.name}</Text>
        <View style={styles.ratingRow}>
          {getStars(recipe.rating).map((star, index) => (
            <MaterialCommunityIcons key={index} name={star} size={20} color="#F9A825" />
          ))}
          <Text style={styles.ratingText}>
            {recipe.rating.toFixed(1)} ({recipe.reviewCount} reviews)
          </Text>
        </View>

        {/* Favorite */}
        <Button
          mode={favorite ? 'contained' : 'outlined'}
          icon={favorite ? 'heart' : 'heart-outline'}
          onPress={() => toggleFavorite(recipe.id)}
          style={styles.favoriteButton}
        >
          {favorite ? 'Saved to favorites' : 'Add to favorites'}
        </Button>

        {/* Quick facts */}
        <View style={styles.factsRow}>
          <View style={styles.fact}>
            <Text style={styles.factValue}>{recipe.prepTimeMinutes} min</Text>
            <Text style={styles.factLabel}>Prep</Text>
          </View>
          <View style={styles.fact}>
            <Text style={styles.factValue}>{recipe.cookTimeMinutes} min</Text>
            <Text style={styles.factLabel}>Cook</Text>
          </View>
          <View style={styles.fact}>
            <Text style={styles.factValue}>{totalMinutes} min</Text>
            <Text style={styles.factLabel}>Total</Text>
          </View>
          <View style={styles.fact}>
            <Text style={styles.factValue}>{recipe.servings}</Text>
            <Text style={styles.factLabel}>Servings</Text>
          </View>
        </View>

        <View style={styles.chipRow}>
          <Chip style={styles.chip}>{recipe.difficulty}</Chip>
          <Chip style={styles.chip}>{recipe.cuisine}</Chip>
          {recipe.mealType.map((meal) => (
            <Chip key={meal} style={styles.chip}>{meal}</Chip>
          ))}
        </View>

        <Divider style={styles.divider} />

        {/* Ingredients */}
        <Text style={styles.sectionTitle}>Ingredients</Text>
        {recipe.ingredients.map((ingredient, index) => (
          <View key={`${ingredient}-${index}`} style={styles.ingredientRow}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bodyText}>{ingredient}</Text>
          </View>
        ))}

        <Divider style={styles.divider} />

        {/* Instructions */}
        <Text style={styles.sectionTitle}>Instructions</Text>
        {recipe.instructions.map((step, index) => (
          <View key={`step-${index}`} style={styles.stepRow}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>{index + 1}</Text>
            </View>
            <Text style={[styles.bodyText, styles.stepText]}>{step}</Text>
          </View>
        ))}

        <Divider style={styles.divider} />

        {/* Nutrition (the API only provides calories) */}
        <Text style={styles.sectionTitle}>Nutrition</Text>
        <View style={styles.nutritionCard}>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>{recipe.caloriesPerServing}</Text>
            <Text style={styles.factLabel}>cal per serving</Text>
          </View>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>
              {recipe.caloriesPerServing * recipe.servings}
            </Text>
            <Text style={styles.factLabel}>cal whole recipe</Text>
          </View>
        </View>

        <Divider style={styles.divider} />

        {/* Tags */}
        <Text style={styles.sectionTitle}>Tags</Text>
        <View style={styles.chipRow}>
          {recipe.tags.map((tag) => (
            <Chip key={tag} style={styles.chip}>{tag}</Chip>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFDF8' },
  content: { paddingBottom: 48 },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#FFFDF8',
  },
  mutedText: { marginTop: 12, fontSize: 14, color: '#8D6E63' },
  errorText: { marginVertical: 16, fontSize: 16, color: '#C62828', textAlign: 'center' },
  heroImage: { width: '100%', height: 260, backgroundColor: '#EFEBE9' },
  body: { padding: 20 },
  title: { fontSize: 26, fontWeight: '700', color: '#3E2723', marginBottom: 8 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  ratingText: { marginLeft: 8, fontSize: 14, color: '#8D6E63' },
  favoriteButton: { marginBottom: 20, borderRadius: 12 },
  factsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  fact: { alignItems: 'center', flex: 1 },
  factValue: { fontSize: 16, fontWeight: '700', color: '#3E2723' },
  factLabel: { fontSize: 12, color: '#8D6E63', marginTop: 2 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { backgroundColor: '#FFF3E0' },
  divider: { marginVertical: 20 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#3E2723', marginBottom: 12 },
  ingredientRow: { flexDirection: 'row', marginBottom: 8 },
  bullet: { fontSize: 16, color: '#E85D04', marginRight: 8 },
  bodyText: { flex: 1, fontSize: 15, lineHeight: 22, color: '#3E2723' },
  stepRow: { flexDirection: 'row', marginBottom: 14 },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E85D04',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepNumberText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  stepText: { marginTop: 3 },
  nutritionCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 16,
  },
  nutritionItem: { alignItems: 'center' },
  nutritionValue: { fontSize: 24, fontWeight: '700', color: '#E85D04' },
});