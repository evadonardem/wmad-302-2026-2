/**
 * Favorites Screen - Cookbook
 * Lists the recipes the user has saved (IDs come from FavoritesContext, recipe
 * details are fetched from the API and cached). Remove with the heart; an
 * "Undo" snackbar appears after removing.
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Card, Title, Chip, Button, IconButton, Snackbar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFavorites } from '@/context/FavoritesContext';
import { recipeApi } from '@/services/recipeApi';
import { Recipe } from '@/types/recipe';
import { styles } from './favoritesStyles';

const local = StyleSheet.create({
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FDEDED',
    borderRadius: 8,
    paddingLeft: 12,
    marginHorizontal: 16,
    marginTop: 8,
  },
  errorText: { flex: 1, color: '#C62828', fontSize: 13 },
});

export default function FavoritesScreen() {
  const router = useRouter();
  const { ids, isLoading: idsLoading, toggleFavorite, removeFavorite } = useFavorites();

  // Recipe details we've downloaded, keyed by id
  const [recipesById, setRecipesById] = useState<Record<number, Recipe>>({});
  const [fetching, setFetching] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  // Last removed recipe, so the snackbar can offer Undo
  const [removed, setRemoved] = useState<Recipe | null>(null);
  // IDs we've already tried to download, so we don't fetch them twice
  const attempted = useRef<Set<number>>(new Set());
  // Don't update state after the screen has been closed
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  // Download details for any favorite we don't have yet
  useEffect(() => {
    if (idsLoading) return;
    const missing = ids.filter((id) => !attempted.current.has(id));
    if (missing.length === 0) return;
    missing.forEach((id) => attempted.current.add(id));

    const load = async () => {
      setFetching(true);
      const results = await Promise.allSettled(missing.map((id) => recipeApi.getRecipeById(id)));
      if (!mounted.current) return;

      const loaded: Record<number, Recipe> = {};
      let failed = 0;
      results.forEach((result) => {
        if (result.status === 'fulfilled') loaded[result.value.id] = result.value;
        else failed += 1;
      });
      setRecipesById((prev) => ({ ...prev, ...loaded }));
      setLoadError(
        failed > 0 ? `${failed} recipe${failed > 1 ? 's' : ''} couldn't be loaded.` : null,
      );
      setFetching(false);
    };
    load();
  }, [ids, idsLoading, retryKey]);

  const retry = () => {
    // Forget the failed attempts and run the effect again
    attempted.current = new Set(Object.keys(recipesById).map(Number));
    setLoadError(null);
    setRetryKey((k) => k + 1);
  };

  const handleRemove = (recipe: Recipe) => {
    removeFavorite(recipe.id);
    setRemoved(recipe);
  };

  const handleUndo = () => {
    if (removed) toggleFavorite(removed.id); // it's not a favorite now, so this adds it back
    setRemoved(null);
  };

  // Newest favorite first; skip any whose details haven't arrived
  const recipes = [...ids]
    .reverse()
    .map((id) => recipesById[id])
    .filter((recipe): recipe is Recipe => recipe !== undefined);

  const renderFavorite = ({ item }: { item: Recipe }) => (
    <TouchableOpacity style={styles.favoriteCard} onPress={() => router.push(`/recipe/${item.id}`)}>
      <Card style={styles.card} elevation={1}>
        <View style={styles.cardContent}>
          <Image source={{ uri: item.image }} style={styles.recipeImage} resizeMode="cover" />
          <View style={styles.info}>
            <Title style={styles.title} numberOfLines={1}>
              {item.name}
            </Title>
            <View style={styles.meta}>
              <Chip style={styles.difficultyChip}>{item.difficulty}</Chip>
              <Chip style={styles.cuisineChip}>{item.cuisine}</Chip>
            </View>
            <Text style={styles.details}>
              ⏱️ {item.prepTimeMinutes + item.cookTimeMinutes}min · 👥 {item.servings} · ⭐{' '}
              {item.rating.toFixed(1)}
            </Text>
          </View>
          <IconButton
            icon="heart"
            size={24}
            iconColor="#C62828"
            onPress={() => handleRemove(item)}
            accessibilityLabel="Remove from favorites"
          />
        </View>
      </Card>
    </TouchableOpacity>
  );

  // Still reading the saved list, or downloading the first batch of recipes
  if (idsLoading || (fetching && recipes.length === 0)) {
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
          <Text style={styles.emptyText}>Tap the heart on a recipe to save it here</Text>
          <Button
            mode="contained"
            onPress={() => router.push('/(app)/(tabs)/home')}
            style={styles.browseButton}
            contentStyle={styles.buttonContent}
          >
            Browse Recipes
          </Button>
        </View>
      ) : (
        <FlatList
          data={recipes}
          renderItem={renderFavorite}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListHeaderComponent={
            <View>
              <View style={styles.header}>
                <Title style={styles.headerTitle}>Your Favorites ({ids.length})</Title>
              </View>
              {loadError && (
                <View style={local.errorBanner}>
                  <Text style={local.errorText}>{loadError}</Text>
                  <Button onPress={retry}>Retry</Button>
                </View>
              )}
            </View>
          }
        />
      )}

      <Snackbar
        visible={removed !== null}
        onDismiss={() => setRemoved(null)}
        duration={4000}
        action={{ label: 'Undo', onPress: handleUndo }}
      >
        Removed from favorites
      </Snackbar>
    </View>
  );
}
