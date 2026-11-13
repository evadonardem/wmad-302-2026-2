/**
 * Home Screen - Cookbook Discover Tab
 * Recipes load 10 at a time and more load as you scroll (GET /recipes?limit&skip).
 * Pull down to refresh. Category chips open Search filtered by tag.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Avatar, Button, useTheme } from 'react-native-paper';
import { useAuth } from '@/context/AuthContext';
import { useFavorites } from '@/context/FavoritesContext';
import { recipeApi } from '@/services/recipeApi';
import { useRecipeCatalog } from '@/hooks';
import { countBy } from '@/utils/recipeFilters';
import { Recipe } from '@/types/recipe';
import { RecipeCard, LoadingState, ErrorState } from '@/components/CommonComponents';
import { useThemedStyles } from '@/context/ThemeContext';
import { styles as rawStyles } from './homeStyles';

const PAGE_SIZE = 10;

type LoadMode = 'first' | 'more' | 'refresh';

export default function HomeScreen() {
  const router = useRouter();
  const styles = useThemedStyles(rawStyles);
  const { colors } = useTheme();
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();

  // Category chips: the 8 most common tags in the catalog
  const { recipes: catalog } = useRecipeCatalog();
  const topTags = useMemo(
    () => countBy(catalog, (r) => r.tags).slice(0, 8).map((item) => item.name),
    [catalog]
  );

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const busy = useRef(false); // stops overlapping requests (e.g. fast scrolling)

  const fetchPage = useCallback(async (skip: number, mode: LoadMode) => {
    if (busy.current) return;
    busy.current = true;
    if (mode === 'first') setLoading(true);
    if (mode === 'more') setLoadingMore(true);
    setError(null);
    try {
      const data = await recipeApi.getRecipes({ limit: PAGE_SIZE, skip });
      setTotal(data.total);
      setRecipes((prev) => (mode === 'more' ? [...prev, ...data.recipes] : data.recipes));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recipes');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
      busy.current = false;
    }
  }, []);

  useEffect(() => {
    fetchPage(0, 'first');
  }, [fetchPage]);

  const hasMore = recipes.length < total;

  const loadMore = () => {
    if (hasMore && !error) fetchPage(recipes.length, 'more');
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchPage(0, 'refresh');
  };

  // First load
  if (loading && recipes.length === 0) {
    return <LoadingState message="Loading recipes..." />;
  }

  // First load failed
  if (error && recipes.length === 0) {
    return <ErrorState message={error} onRetry={() => fetchPage(0, 'first')} />;
  }

  const header = (
    <View>
      {/* Welcome Header */}
      <View style={styles.welcomeContainer}>
        <View style={styles.welcomeTextContainer}>
          <Text style={styles.welcomeGreeting}>
            {user ? `Welcome back, ${user.firstName}!` : 'Welcome to Cookbook!'}
          </Text>
          <Text style={styles.welcomeSubtitle}>Discover delicious recipes</Text>
        </View>
        <Avatar.Icon size={56} icon="chef-hat" style={styles.welcomeAvatar} />
      </View>

      {/* Categories */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categories</Text>
        </View>
        <FlatList
          data={topTags}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.categoryChip, { backgroundColor: colors.primaryContainer }]}
              onPress={() => router.push(`/(app)/(tabs)/search?tag=${encodeURIComponent(item)}`)}
            >
              <Text style={styles.categoryChipText}>{item}</Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item}
        />
      </View>

      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Recipes</Text>
          <TouchableOpacity onPress={() => router.push('/(app)/(tabs)/search')} style={styles.seeAll}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  let footer: React.ReactElement | null = null;
  if (loadingMore) {
    footer = (
      <View style={styles.emptyContainer}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  } else if (error) {
    footer = (
      <View style={styles.emptyContainer}>
        <Text style={styles.errorText}>{'Couldn’t load more recipes'}</Text>
        <Button onPress={() => fetchPage(recipes.length, 'more')}>Retry</Button>
      </View>
    );
  } else if (!hasMore && recipes.length > 0) {
    footer = (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{`You’ve seen all ${total} recipes`}</Text>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      data={recipes}
      renderItem={({ item }) => (
        <RecipeCard
          recipe={item}
          style={styles.recipeCard}
          onPress={() => router.push(`/recipe/${item.id}`)}
          isFavorite={isFavorite(item.id)}
          onToggleFavorite={() => toggleFavorite(item.id)}
        />
      )}
      keyExtractor={(item) => item.id.toString()}
      ListHeaderComponent={header}
      ListFooterComponent={footer}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No recipes found</Text>
        </View>
      }
      ItemSeparatorComponent={() => <View style={styles.cardSeparator} />}
      onEndReached={loadMore}
      onEndReachedThreshold={0.5}
      refreshing={refreshing}
      onRefresh={onRefresh}
    />
  );
}
