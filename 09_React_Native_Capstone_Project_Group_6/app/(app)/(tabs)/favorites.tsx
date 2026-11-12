/**
 * Favorites Screen - Cookbook
 * Lists the recipes the user has saved (IDs come from FavoritesContext, recipe
 * details are fetched from the API and cached). Remove with the heart; an
 * "Undo" snackbar appears after removing.
 */
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Title, Button, Snackbar } from 'react-native-paper';
import { useFavorites } from '@/context/FavoritesContext';
import { recipeApi } from '@/services/recipeApi';
import { Recipe } from '@/types/recipe';
import { EmptyState, LoadingState, RecipeListItem } from '@/components/CommonComponents';
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
      setLoadError(failed > 0 ? `${failed} recipe${failed > 1 ? 's' : ''} could not be loaded.` : null);
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
    <RecipeListItem
      recipe={item}
      style={styles.favoriteCard}
      onPress={() => router.push(`/recipe/${item.id}`)}
      isFavorite
      onToggleFavorite={() => handleRemove(item)}
    />
  );

  // Still reading the saved list, or downloading the first batch of recipes
  if (idsLoading || (fetching && recipes.length === 0)) {
    return <LoadingState message="Loading favorites..." />;
  }

  return (
    <View style={styles.container}>
      {ids.length === 0 ? (
        <EmptyState
          icon="heart-outline"
          title="No Favorites Yet"
          message="Tap the heart on a recipe to save it here"
          actionLabel="Browse Recipes"
          onAction={() => router.push('/(app)/(tabs)/home')}
        />
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