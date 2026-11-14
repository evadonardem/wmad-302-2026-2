/**
 * Recipe Detail Screen - Botanical Sage & Terracotta Theme
 */
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Image, StyleSheet, ActivityIndicator, Share } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Card, Title, IconButton, Divider } from 'react-native-paper';
import { recipeApi } from '@/services/recipeApi';
import { favoritesStorage } from '@/utils/storage';
import { Recipe } from '@/types/recipe';
import { APP_COLORS } from '@/constants/theme';

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadRecipe = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const numericId = Number(id);
      const [recipeData, favIds] = await Promise.all([
        recipeApi.getRecipeById(numericId),
        favoritesStorage.getIds(),
      ]);
      setRecipe(recipeData);
      setIsFavorite((favIds || []).includes(numericId));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadRecipe();
  }, [loadRecipe]);

  const handleToggleFavorite = async () => {
    if (!recipe) return;
    const updatedState = await favoritesStorage.toggleId(recipe.id);
    setIsFavorite(updatedState);
  };

  const handleShare = async () => {
    if (!recipe) return;
    try {
      await Share.share({
        message: `Check out this recipe for ${recipe.name}! Prep time: ${recipe.prepTimeMinutes} mins.`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  if (loading || !recipe) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={APP_COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <IconButton icon="arrow-left" size={24} iconColor={APP_COLORS.primary} onPress={() => router.back()} />
        <Text style={styles.headerTitle} numberOfLines={1}>{recipe.name}</Text>
        <IconButton icon="share-variant" size={22} iconColor={APP_COLORS.primary} onPress={handleShare} />
        <IconButton
          icon={isFavorite ? 'heart' : 'heart-outline'}
          size={24}
          iconColor={isFavorite ? APP_COLORS.accent : APP_COLORS.primary}
          onPress={handleToggleFavorite}
        />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Image source={{ uri: recipe.image }} style={styles.heroImage} resizeMode="cover" />
        <View style={styles.section}>
          <Text style={styles.cuisineTag}>{recipe.cuisine} · {recipe.difficulty}</Text>
          <Title style={styles.recipeTitle}>{recipe.name}</Title>
          <Text style={styles.ratingText}>★ {recipe.rating.toFixed(1)} ({recipe.reviewCount} reviews)</Text>
        </View>

        <Card style={styles.statsCard} elevation={0}>
          <Card.Content style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{recipe.prepTimeMinutes + recipe.cookTimeMinutes}m</Text>
              <Text style={styles.statLabel}>Total Time</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{recipe.servings}</Text>
              <Text style={styles.statLabel}>Servings</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{recipe.caloriesPerServing}</Text>
              <Text style={styles.statLabel}>Calories</Text>
            </View>
          </Card.Content>
        </Card>

        <View style={styles.section}>
          <Title style={styles.sectionHeading}>Ingredients</Title>
          <Card style={styles.contentCard} elevation={0}>
            <Card.Content>
              {recipe.ingredients.map((ing, idx) => (
                <View key={idx} style={styles.ingredientRow}>
                  <View style={styles.bulletDot} />
                  <Text style={styles.bodyText}>{ing}</Text>
                </View>
              ))}
            </Card.Content>
          </Card>
        </View>

        {recipe.instructions && recipe.instructions.length > 0 && (
          <View style={styles.section}>
            <Title style={styles.sectionHeading}>Preparation</Title>
            <Card style={styles.contentCard} elevation={0}>
              <Card.Content>
                {recipe.instructions.map((step, idx) => (
                  <View key={idx} style={styles.stepRow}>
                    <View style={styles.stepBadge}>
                      <Text style={styles.stepNumber}>{idx + 1}</Text>
                    </View>
                    <Text style={styles.stepText}>{step}</Text>
                  </View>
                ))}
              </Card.Content>
            </Card>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: APP_COLORS.background },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: APP_COLORS.background },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: APP_COLORS.border,
    backgroundColor: APP_COLORS.surface,
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: APP_COLORS.textPrimary,
    textAlign: 'center',
  },
  scrollContent: { paddingBottom: 100 },
  heroImage: { width: '100%', height: 250 },
  section: { paddingHorizontal: 16, marginTop: 18 },
  cuisineTag: {
    fontSize: 12,
    fontWeight: '700',
    color: APP_COLORS.primaryLight,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  recipeTitle: { fontSize: 24, fontWeight: '800', color: APP_COLORS.textPrimary },
  ratingText: { fontSize: 14, color: APP_COLORS.accent, fontWeight: '700', marginTop: 4 },
  statsCard: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: APP_COLORS.primary,
    borderRadius: 16,
  },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 6 },
  statBox: { alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '800', color: '#FAF9F5' },
  statLabel: { fontSize: 11, color: '#D8F3DC', marginTop: 2, fontWeight: '600' },
  sectionHeading: { fontSize: 18, fontWeight: '800', color: APP_COLORS.textPrimary, marginBottom: 10 },
  contentCard: {
    backgroundColor: APP_COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
  },
  ingredientRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  bulletDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: APP_COLORS.accent,
    marginRight: 10,
  },
  bodyText: { fontSize: 15, color: APP_COLORS.textPrimary, lineHeight: 22, flex: 1 },
  stepRow: { flexDirection: 'row', marginBottom: 14, alignItems: 'flex-start' },
  stepBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: APP_COLORS.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepNumber: { fontSize: 12, fontWeight: '800', color: APP_COLORS.primary },
  stepText: { flex: 1, fontSize: 14, color: APP_COLORS.textPrimary, lineHeight: 21 },
});