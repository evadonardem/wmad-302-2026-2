import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { recipeApi } from '@/services/recipeApi';
import { favoritesStorage } from '@/utils/storage';
import type { Recipe } from '@/types/recipe';

export default function RecipeDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savingFavorite, setSavingFavorite] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRecipe = useCallback(async () => {
    const recipeId = Number(id);
    if (!Number.isInteger(recipeId) || recipeId <= 0) {
      setError('This recipe could not be found.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [loadedRecipe, favoriteIds] = await Promise.all([
        recipeApi.getRecipeById(recipeId),
        favoritesStorage.getIds(),
      ]);
      setRecipe(loadedRecipe);
      setIsFavorite(favoriteIds.includes(recipeId));
    } catch {
      setError('Unable to load this recipe. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadRecipe();
  }, [loadRecipe]);

  const toggleFavorite = async () => {
    if (!recipe || savingFavorite) return;
    setSavingFavorite(true);
    try {
      const added = await favoritesStorage.toggleId(recipe.id);
      setIsFavorite(added);
    } finally {
      setSavingFavorite(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#E85D04" />
      </View>
    );
  }

  if (error || !recipe) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error ?? 'Recipe not found.'}</Text>
        <Button mode="contained" onPress={() => void loadRecipe()}>Try again</Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.imageWrap}>
        <Image source={{ uri: recipe.image }} style={styles.image} resizeMode="cover" />
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#3E2723" />
        </TouchableOpacity>
      </View>

      <View style={styles.details}>
        <Text style={styles.title}>{recipe.name}</Text>
        <View style={styles.chips}>
          <Chip>{recipe.cuisine}</Chip>
          <Chip>{recipe.difficulty}</Chip>
          <Chip>⭐ {recipe.rating.toFixed(1)}</Chip>
        </View>

        <View style={styles.stats}>
          <Text style={styles.stat}>⏱ {recipe.prepTimeMinutes + recipe.cookTimeMinutes} min</Text>
          <Text style={styles.stat}>Serves {recipe.servings}</Text>
          <Text style={styles.stat}>{recipe.caloriesPerServing} cal</Text>
        </View>

        <Button
          mode={isFavorite ? 'outlined' : 'contained'}
          icon={isFavorite ? 'heart' : 'heart-outline'}
          onPress={() => void toggleFavorite()}
          loading={savingFavorite}
          disabled={savingFavorite}
          style={styles.favoriteButton}
        >
          {isFavorite ? 'Saved to Favorites' : 'Add to Favorites'}
        </Button>

        <Text style={styles.sectionTitle}>Ingredients</Text>
        {recipe.ingredients.map((ingredient, index) => (
          <View key={`${ingredient}-${index}`} style={styles.listRow}>
            <MaterialCommunityIcons name="circle-small" size={22} color="#E85D04" />
            <Text style={styles.listText}>{ingredient}</Text>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Instructions</Text>
        {recipe.instructions.map((instruction, index) => (
          <View key={`${index}-${instruction}`} style={styles.instructionRow}>
            <Text style={styles.instructionNumber}>{index + 1}</Text>
            <Text style={styles.listText}>{instruction}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFDF8' },
  content: { paddingBottom: 40 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16 },
  errorText: { color: '#C62828', fontSize: 16, textAlign: 'center' },
  imageWrap: { height: 280, position: 'relative' },
  image: { width: '100%', height: '100%' },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  details: { padding: 20 },
  title: { color: '#3E2723', fontSize: 26, fontWeight: '700', marginBottom: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  stats: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  stat: { color: '#6D4C41', fontSize: 13, fontWeight: '600' },
  favoriteButton: { marginVertical: 8 },
  sectionTitle: { color: '#3E2723', fontSize: 20, fontWeight: '700', marginTop: 24, marginBottom: 10 },
  listRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  instructionRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14, gap: 10 },
  instructionNumber: {
    width: 26,
    height: 26,
    textAlign: 'center',
    textAlignVertical: 'center',
    overflow: 'hidden',
    borderRadius: 13,
    backgroundColor: '#FFF3E0',
    color: '#E85D04',
    fontWeight: '700',
  },
  listText: { flex: 1, color: '#5D4037', fontSize: 15, lineHeight: 22 },
});