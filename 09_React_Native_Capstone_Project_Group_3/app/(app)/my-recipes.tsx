/**
 * My Recipes - recipes authored by the signed-in user (matched on recipe.userId)
 */
import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { useAuth } from '@/context/AuthContext';
import { useFavorites } from '@/context/FavoritesContext';
import { useAllRecipes } from '@/hooks';
import {
  EmptyState,
  ErrorState,
  RecipeCard,
  RecipeCardSkeleton,
} from '@/components/CommonComponents';

export default function MyRecipesScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { recipes, loading, error, reload } = useAllRecipes();

  const mine = recipes.filter((recipe) => recipe.userId === user?.id);

  if (loading) {
    return (
      <View style={[styles.container, styles.padded, { backgroundColor: theme.colors.background }]}>
        {[1, 2, 3].map((n) => (
          <RecipeCardSkeleton key={n} variant="compact" />
        ))}
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ErrorState message={error} onRetry={reload} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={mine}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <RecipeCard
            variant="compact"
            recipe={item}
            style={styles.card}
            onPress={() => router.push(`/recipe/${item.id}`)}
            isFavorite={isFavorite(item.id)}
            onToggleFavorite={() => toggleFavorite(item.id)}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="book-edit"
            title="No recipes yet"
            message="Recipes created with your account will show up here."
            actionLabel="Discover recipes"
            onAction={() => router.push('/(app)/(tabs)/home')}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  padded: { padding: 16 },
  list: { padding: 16, flexGrow: 1 },
  card: { marginBottom: 10 },
});
