/**
 * Favorites Screen - Cookbook
 * TODO: Students implement
 * - Store favorite recipe IDs in AsyncStorage or context
 * - Fetch favorite recipes by IDs (GET /recipes/{id})
 * - Remove from favorites
 * - Add notes to favorites
 * - Create collections/folders
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Card, Title, Chip, Button, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from './favoritesStyles';
import { recipeApi } from '@/services/recipeApi';
import { useFavorites } from '@/context/FavoritesContext';
import type { Recipe } from '@/types/recipe';

export default function FavoritesScreen() {
  const router = useRouter();
  // Favorite ids live in FavoritesContext (saved in AsyncStorage)
  const { ids, isLoading: idsLoading, removeFavorite: removeSavedFavorite } = useFavorites();

  // Recipes already fetched, so removing/adding a favorite never refetches the whole list
  const [recipesById, setRecipesById] = useState<Record<number, Recipe>>({});
  const [failedIds, setFailedIds] = useState<number[]>([]);

  // Fetch the recipes we don't have yet: GET /recipes/{id}
  useEffect(() => {
    if (idsLoading) return;

    const missing = ids.filter((id) => !recipesById[id] && !failedIds.includes(id));
    if (missing.length === 0) return;

    let cancelled = false;

    const loadMissing = async () => {
      const results = await Promise.all(
        missing.map((id) => recipeApi.getRecipeById(id).catch(() => null))
      );
      if (cancelled) return;

      const loaded = results.filter((recipe): recipe is Recipe => recipe !== null);
      const loadedIds = loaded.map((recipe) => recipe.id);

      setRecipesById((prev) => {
        const next = { ...prev };
        loaded.forEach((recipe) => {
          next[recipe.id] = recipe;
        });
        return next;
      });
      setFailedIds((prev) => [...prev, ...missing.filter((id) => !loadedIds.includes(id))]);
    };

    loadMissing();

    return () => {
      cancelled = true;
    };
  }, [ids, idsLoading, recipesById, failedIds]);

  // Newest favorite first (same order as the saved ids)
  const favorites = ids
    .map((id) => recipesById[id])
    .filter((recipe): recipe is Recipe => Boolean(recipe));
  const failedCount = failedIds.filter((id) => ids.includes(id)).length;
  const pending = ids.some((id) => !recipesById[id] && !failedIds.includes(id));
  const loading = idsLoading || pending;

  const retryFailed = () => setFailedIds([]);

  const removeFavorite = (recipeId: number) => {
    Alert.alert(
      'Remove from Favorites',
      'Are you sure you want to remove this recipe?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeSavedFavorite(recipeId),
        },
      ]
    );
  };

  const renderFavorite = ({ item }: { item: Recipe }) => (
    <TouchableOpacity
      style={styles.favoriteCard}
      onPress={() => router.push(`/(app)/recipe/${item.id}`)}
    >
      <Card style={styles.card} elevation={1}>
        <View style={styles.cardContent}>
          <Image source={{ uri: item.image }} style={styles.recipeImage} resizeMode="cover" />
          <View style={styles.info}>
            <Title style={styles.title} numberOfLines={1}>{item.name}</Title>
            <View style={styles.meta}>
              <Chip style={styles.difficultyChip}>{item.difficulty}</Chip>
              <Chip style={styles.cuisineChip}>{item.cuisine}</Chip>
            </View>
            <Text style={styles.details}>
              ⏱️ {item.prepTimeMinutes + item.cookTimeMinutes}min · 👥 {item.servings} · ⭐ {item.rating}
            </Text>
          </View>
          <IconButton
            icon="heart"
            size={24}
            iconColor="#C62828"
            onPress={() => removeFavorite(item.id)}
            accessibilityLabel="Remove from favorites"
          />
        </View>
      </Card>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E85D04" />
        <Text style={styles.loadingText}>Loading favorites...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {ids.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="heart-outline" size={80} color="#BCAAA4" />
          <Text style={styles.emptyTitle}>No Favorites Yet</Text>
          <Text style={styles.emptyText}>Recipes you love will appear here</Text>
          <Button
            mode="contained"
            onPress={() => router.push('/(app)/(tabs)/search')}
            style={styles.browseButton}
            contentStyle={styles.buttonContent}
          >
            <Text style={styles.buttonText}>Browse Recipes</Text>
          </Button>
        </View>
      ) : (
        <FlatList
          data={favorites}
          renderItem={renderFavorite}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListHeaderComponent={
            <View style={styles.header}>
              <Title style={styles.headerTitle}>Your Favorites ({ids.length})</Title>
              {failedCount > 0 && favorites.length > 0 && (
                <View>
                  <Text style={styles.emptyText}>
                    {failedCount} favorite{failedCount > 1 ? 's' : ''} couldn't be loaded
                  </Text>
                  <Button mode="text" onPress={retryFailed}>
                    Retry
                  </Button>
                </View>
              )}
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="alert-circle-outline" size={64} color="#BCAAA4" />
              <Text style={styles.emptyText}>Couldn't load your favorites</Text>
              <Button mode="contained" onPress={retryFailed} style={styles.browseButton}>
                Retry
              </Button>
            </View>
          }
        />
      )}

      {/* Student Guide */}
      <View style={styles.guideContainer}>
        <Text style={styles.guideTitle}>📝 Student Implementation Guide</Text>
        <Text style={styles.guideText}>
          Complete the favorites functionality:{'\n'}
          1. Store favorite IDs in AsyncStorage{'\n'}
          2. Fetch recipes by ID on load{'\n'}
          3. Add/remove with persistence{'\n'}
          4. Add "Add to Favorites" on recipe detail{'\n'}
          5. Create collections (Breakfast, Dinner, etc.)
        </Text>
      </View>
    </View>
  );
}
