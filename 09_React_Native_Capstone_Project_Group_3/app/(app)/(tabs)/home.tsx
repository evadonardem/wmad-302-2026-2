/**
 * Home Screen - Cookbook Discover Tab
 * Paginated recipe feed (infinite scroll), category shortcuts, favorites, pull-to-refresh,
 * skeleton loading, error + empty states.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Avatar, Button, Text, useTheme } from 'react-native-paper';
import { useAuth } from '@/context/AuthContext';
import { useFavorites } from '@/context/FavoritesContext';
import { useInfiniteScroll } from '@/hooks';
import { recipeApi } from '@/services/recipeApi';
import { contentWidth } from '@/constants/theme';
import {
  CategoryChip,
  EmptyState,
  ErrorState,
  RecipeCard,
  RecipeCardSkeleton,
} from '@/components/CommonComponents';
import type { CategorySummary, Recipe } from '@/types/recipe';

const PAGE_SIZE = 10;

export default function HomeScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [categories, setCategories] = useState<CategorySummary[]>([]);

  const fetchPage = useCallback(async (skip: number, limit: number) => {
    const response = await recipeApi.getRecipes({ limit, skip });
    return { items: response.recipes, total: response.total };
  }, []);

  const { items, loading, loadingMore, refreshing, error, loadMore, refresh, retry } =
    useInfiniteScroll<Recipe>(fetchPage, PAGE_SIZE);

  useEffect(() => {
    recipeApi
      .getCategories()
      .then((list) => setCategories(list.slice(0, 10)))
      .catch(() => undefined); // categories are a nice-to-have on this screen
  }, []);

  const openRecipe = (id: number) => router.push(`/recipe/${id}`);

  const header = (
    <View>
      <View style={[styles.welcome, { backgroundColor: theme.colors.primaryContainer }]}>
        <View style={styles.welcomeText}>
          <Text variant="headlineSmall" style={{ color: theme.colors.onSurface, fontWeight: '700' }}>
            {user ? `Welcome back, ${user.firstName}!` : 'Welcome to Cookbook!'}
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            Discover delicious recipes
          </Text>
        </View>
        <Avatar.Icon size={56} icon="chef-hat" />
      </View>

      {categories.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="titleLarge" style={{ color: theme.colors.onSurface, fontWeight: '700' }}>
              Categories
            </Text>
            <Button compact onPress={() => router.push('/(app)/(tabs)/categories')}>
              See all
            </Button>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            {categories.map((category) => (
              <CategoryChip
                key={category.name}
                label={category.name}
                onPress={() =>
                  router.push({
                    pathname: '/(app)/(tabs)/search',
                    params: { category: category.name },
                  })
                }
              />
            ))}
          </ScrollView>
        </View>
      )}

      <View style={styles.sectionHeader}>
        <Text variant="titleLarge" style={{ color: theme.colors.onSurface, fontWeight: '700' }}>
          Featured Recipes
        </Text>
      </View>
    </View>
  );

  const emptyComponent = loading ? (
    <View style={styles.skeletons}>
      {[1, 2, 3].map((n) => (
        <RecipeCardSkeleton key={n} />
      ))}
    </View>
  ) : error ? (
    <ErrorState message={error} onRetry={retry} />
  ) : (
    <EmptyState
      icon="chef-hat"
      title="No recipes found"
      message="Pull down to refresh and try again."
    />
  );

  const footer = loadingMore ? (
    <ActivityIndicator style={styles.footer} color={theme.colors.primary} />
  ) : error && items.length > 0 ? (
    <View style={styles.footer}>
      <Button mode="text" onPress={retry}>
        Couldn&apos;t load more. Tap to retry
      </Button>
    </View>
  ) : null;

  return (
    <FlatList
      style={{ backgroundColor: theme.colors.background }}
      data={items}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <RecipeCard
          recipe={item}
          style={styles.card}
          onPress={() => openRecipe(item.id)}
          isFavorite={isFavorite(item.id)}
          onToggleFavorite={() => toggleFavorite(item.id)}
        />
      )}
      ListHeaderComponent={header}
      ListEmptyComponent={emptyComponent}
      ListFooterComponent={footer}
      onEndReached={loadMore}
      onEndReachedThreshold={0.4}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={refresh}
          colors={[theme.colors.primary]}
          tintColor={theme.colors.primary}
        />
      }
      contentContainerStyle={styles.content}
    />
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 24, ...contentWidth },
  welcome: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 12,
  },
  welcomeText: { flex: 1, paddingRight: 12 },
  section: { marginBottom: 4 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginVertical: 8,
  },
  chips: { paddingHorizontal: 20, gap: 8 },
  card: { paddingHorizontal: 16, marginBottom: 16 },
  skeletons: { paddingHorizontal: 16 },
  footer: { paddingVertical: 16, alignItems: 'center' },
});