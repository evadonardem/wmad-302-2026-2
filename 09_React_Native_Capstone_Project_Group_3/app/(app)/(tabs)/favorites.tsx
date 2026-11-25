/**
 * Favorites Screen - Cookbook
 * Favorite ids live in FavoritesContext (persisted to AsyncStorage); the recipes themselves
 * are resolved from the cached recipe list.
 */
import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Snackbar, Text, useTheme } from 'react-native-paper';
import { useFavorites } from '@/context/FavoritesContext';
import { useAllRecipes } from '@/hooks';
import { contentWidth } from '@/constants/theme';
import {
  EmptyState,
  ErrorState,
  RecipeCard,
  RecipeCardSkeleton,
} from '@/components/CommonComponents';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import type { Recipe } from '@/types/recipe';

export default function FavoritesScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { ids, hydrated, removeFavorite } = useFavorites();
  const { recipes, loading, error, reload } = useAllRecipes();
  const [pending, setPending] = useState<Recipe | null>(null);
  const [snackbar, setSnackbar] = useState<string | null>(null);

  const favorites = useMemo(
    () =>
      ids
        .map((id) => recipes.find((recipe) => recipe.id === id))
        .filter((recipe): recipe is Recipe => recipe !== undefined),
    [ids, recipes]
  );

  const confirmRemove = () => {
    if (pending) {
      removeFavorite(pending.id);
      setSnackbar(`Removed "${pending.name}" from favorites`);
    }
    setPending(null);
  };

  if (!hydrated || (loading && ids.length > 0)) {
    return (
      <View style={[styles.container, styles.padded, { backgroundColor: theme.colors.background }]}>
        {[1, 2, 3].map((n) => (
          <RecipeCardSkeleton key={n} variant="compact" />
        ))}
      </View>
    );
  }

  if (error && ids.length > 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ErrorState message={error} onRetry={reload} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {favorites.length === 0 ? (
        <EmptyState
          icon="heart-outline"
          title="No Favorites Yet"
          message="Tap the heart on any recipe to save it here."
          actionLabel="Browse Recipes"
          onAction={() => router.push('/(app)/(tabs)/search')}
        />
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <RecipeCard
              variant="compact"
              recipe={item}
              style={styles.card}
              isFavorite
              onToggleFavorite={() => setPending(item)}
              onPress={() => router.push(`/recipe/${item.id}`)}
            />
          )}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <View style={styles.header}>
              <Text variant="headlineSmall" style={{ color: theme.colors.onSurface, fontWeight: '700' }}>
                Your Favorites ({favorites.length})
              </Text>
            </View>
          }
        />
      )}

      <ConfirmDialog
        visible={pending !== null}
        title="Remove from Favorites"
        message={`Remove "${pending?.name ?? ''}" from your favorites?`}
        confirmLabel="Remove"
        destructive
        onConfirm={confirmRemove}
        onCancel={() => setPending(null)}
      />
      <Snackbar visible={snackbar !== null} onDismiss={() => setSnackbar(null)} duration={2500}>
        {snackbar ?? ''}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  padded: { padding: 16 },
  list: { padding: 16, paddingBottom: 32, ...contentWidth },
  card: { marginBottom: 10 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
});