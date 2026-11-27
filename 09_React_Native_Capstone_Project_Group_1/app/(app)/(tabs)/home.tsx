/**
 * Home Screen - Cookbook Discover Tab
 * Students implement: Recipe grid, categories, featured recipes
 * API: https://dummyjson.com/docs/recipes
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Title, Button } from 'react-native-paper';
import { styles } from './homeStyles';
import { recipeApi } from '@/services/recipeApi';
import { useInfiniteScroll } from '@/hooks';
import { RecipeCard, RecipeCardSkeleton, CategoryChip, Logo } from '@/components/CommonComponents';

// Types for DummyJSON Recipes API (shared in types/recipe.ts)
import type { Recipe } from '@/types/recipe';
import { colors } from '@/constants/colors';

const PAGE_SIZE = 10;
// Categories shown on Home; the rest are on the Categories tab
const MAX_HOME_CATEGORIES = 8;

// Shown if the tags request fails
const DEFAULT_CATEGORIES = [
  'Beef', 'Chicken', 'Dessert', 'Lamb', 'Pasta', 'Pork', 'Seafood', 'Vegetarian',
];

const localStyles = StyleSheet.create({
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  spinner: { marginVertical: 16 },
  fill: { flex: 1 },
  skeletonList: { padding: 16 },
});

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);

  // Page-based fetch for the infinite scroll hook (page 0 = first PAGE_SIZE recipes)
  const fetchPage = useCallback(async (page: number, limit: number) => {
    const response = await recipeApi.getRecipes({ limit, skip: page * limit });
    return {
      data: response.recipes,
      hasMore: response.skip + response.recipes.length < response.total,
    };
  }, []);

  const {
    data: recipes,
    loading,
    hasMore,
    error,
    loadMore,
    refresh,
  } = useInfiniteScroll<Recipe>(fetchPage, PAGE_SIZE);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Categories come from the API tag list
  useEffect(() => {
    recipeApi
      .getCategories()
      .then((tags) => {
        if (tags.length > 0) setCategories(tags.slice(0, 15));
      })
      .catch(() => {
        // Keep the default categories
      });
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const renderRecipe = ({ item }: { item: Recipe }) => (
    <RecipeCard
      recipe={item}
      onPress={() => router.push(`/(app)/recipe/${item.id}`)}
    />
  );

  // First load: nothing on screen yet, show placeholders shaped like the cards
  if (loading && recipes.length === 0) {
    return (
      <View style={localStyles.skeletonList}>
        <RecipeCardSkeleton />
        <RecipeCardSkeleton />
        <RecipeCardSkeleton />
      </View>
    );
  }

  // First load failed
  if (error && recipes.length === 0) {
    return (
      <View style={[styles.errorContainer, localStyles.fill]}>
        <Text style={styles.errorText}>{error}</Text>
        <Button mode="contained" onPress={() => refresh()} style={styles.retryButton}>
          Retry
        </Button>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      data={recipes}
      renderItem={renderRecipe}
      keyExtractor={(item) => item.id.toString()}
      ItemSeparatorComponent={() => <View style={styles.cardSeparator} />}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
      }
      // Pagination: load the next page when the user scrolls near the end
      onEndReached={loadMore}
      onEndReachedThreshold={0.5}
      ListHeaderComponent={
        <View>
          {/* Welcome Header */}
          <View style={styles.welcomeContainer}>
            <View style={styles.welcomeTextContainer}>
              <Text style={styles.welcomeGreeting}>
                {user ? `Welcome back, ${user.firstName}!` : 'Welcome to Croc Book!'}
              </Text>
              <Text style={styles.welcomeSubtitle}>Discover delicious recipes</Text>
            </View>
            <View style={styles.welcomeAvatar}>
              <Logo size={64} />
            </View>
          </View>

          {/* Categories */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Title style={styles.sectionTitle}>Categories</Title>
            </View>
            {/* Chips wrap onto new lines so they always fit the screen width */}
            <View style={localStyles.chipWrap}>
              {categories.slice(0, MAX_HOME_CATEGORIES).map((item) => (
                <CategoryChip
                  key={item}
                  label={item}
                  onPress={() => router.push(`/(app)/(tabs)/search?category=${encodeURIComponent(item)}`)}
                />
              ))}
              <CategoryChip
                label="More"
                icon="dots-horizontal"
                onPress={() => router.push('/(app)/(tabs)/categories')}
              />
            </View>
          </View>

          {/* Featured Recipes */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Title style={styles.sectionTitle}>Featured Recipes</Title>
              <TouchableOpacity onPress={() => router.push('/(app)/(tabs)/search')} style={styles.seeAll}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      }
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No recipes found</Text>
        </View>
      }
      ListFooterComponent={
        loading && recipes.length > 0 ? (
          <ActivityIndicator size="small" color={colors.primary} style={localStyles.spinner} />
        ) : error && recipes.length > 0 ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <Button mode="contained" onPress={() => loadMore()} style={styles.retryButton}>
              Retry
            </Button>
          </View>
        ) : !hasMore && recipes.length > 0 ? (
          <Text style={styles.emptyText}>You&apos;ve reached the end 🍽️</Text>
        ) : null
      }
    />
  );
}