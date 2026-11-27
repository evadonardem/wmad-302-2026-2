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
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Title, Button, IconButton } from 'react-native-paper';
import { styles } from './favoritesStyles';
import { recipeApi } from '@/services/recipeApi';
import { useFavorites } from '@/context/FavoritesContext';
import { RecipeListItem, EmptyState } from '@/components/CommonComponents';
import { confirmAction } from '@/utils/alerts';
import type { Recipe } from '@/types/recipe';
import { colors } from '@/constants/colors';

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
    confirmAction({
      title: 'Remove from Favorites',
      message: 'Are you sure you want to remove this recipe?',
      confirmText: 'Remove',
      destructive: true,
      onConfirm: () => removeSavedFavorite(recipeId),
    });
  };

  const renderFavorite = ({ item }: { item: Recipe }) => (
    <RecipeListItem
      recipe={item}
      onPress={() => router.push(`/(app)/recipe/${item.id}`)}
      right={
        <IconButton
          icon="heart"
          size={24}
          iconColor={colors.accent}
          onPress={() => removeFavorite(item.id)}
          accessibilityLabel="Remove from favorites"
        />
      }
    />
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading favorites...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {ids.length === 0 ? (
        <EmptyState
          icon="heart-outline"
          title="No Favorites Yet"
          message="Recipes you love will appear here"
          actionLabel="Browse Recipes"
          onAction={() => router.push('/(app)/(tabs)/search')}
        />
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
                    {failedCount} favorite{failedCount > 1 ? 's' : ''} couldn&apos;t be loaded
                  </Text>
                  <Button mode="text" onPress={retryFailed}>
                    Retry
                  </Button>
                </View>
              )}
            </View>
          }
          ListEmptyComponent={
            <EmptyState
              icon="alert-circle-outline"
              title="Couldn't load your favorites"
              message="Check your connection and try again"
              actionLabel="Retry"
              onAction={retryFailed}
            />
          }
        />
      )}

    </View>
  );
}