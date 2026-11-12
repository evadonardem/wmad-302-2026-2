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
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Card, Title, Chip, Avatar, Button } from 'react-native-paper';
import { styles } from './homeStyles';
import { recipeApi } from '@/services/recipeApi';
import { useInfiniteScroll } from '@/hooks';

// Types for DummyJSON Recipes API (shared in types/recipe.ts)
import type { Recipe } from '@/types/recipe';

const PAGE_SIZE = 10;

// Shown if the tags request fails
const DEFAULT_CATEGORIES = [
  'Beef', 'Chicken', 'Dessert', 'Lamb', 'Pasta', 'Pork', 'Seafood', 'Vegetarian',
];

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
    <TouchableOpacity
      style={styles.recipeCard}
      onPress={() => router.push(`/(app)/recipe/${item.id}`)}
      activeOpacity={0.8}
    >
      <Card style={styles.card} elevation={2}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: item.image }}
            style={styles.recipeImage}
            resizeMode="cover"
          />
          <View style={styles.difficultyBadge}>
            <Chip
              style={[
                styles.difficultyChip,
                item.difficulty === 'Easy' && styles.easy,
                item.difficulty === 'Medium' && styles.medium,
                item.difficulty === 'Hard' && styles.hard,
              ]}
            >
              {item.difficulty}
            </Chip>
          </View>
        </View>
        <Card.Content style={styles.cardContent}>
          <Title style={styles.recipeTitle} numberOfLines={1}>
            {item.name}
          </Title>
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>
              ⏱️ {item.prepTimeMinutes + item.cookTimeMinutes} min
            </Text>
            <Text style={styles.metaText}>👥 {item.servings} servings</Text>
            <Text style={styles.metaText}>🔥 {item.caloriesPerServing} cal</Text>
          </View>
          <View style={styles.cuisineRow}>
            <Chip style={styles.cuisineChip}>{item.cuisine}</Chip>
            {item.mealType.slice(0, 2).map((meal) => (
              <Chip key={meal} style={styles.mealChip}>{meal}</Chip>
            ))}
          </View>
          <View style={styles.ratingRow}>
            <Text style={styles.ratingText}>
              ⭐ {item.rating.toFixed(1)} ({item.reviewCount} reviews)
            </Text>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  // First load: nothing on screen yet
  if (loading && recipes.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E85D04" />
        <Text style={styles.loadingText}>Loading recipes...</Text>
      </View>
    );
  }

  // First load failed
  if (error && recipes.length === 0) {
    return (
      <View style={styles.errorContainer}>
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
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#E85D04']} />
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
                {user ? `Welcome back, ${user.firstName}!` : 'Welcome to Cookbook!'}
              </Text>
              <Text style={styles.welcomeSubtitle}>Discover delicious recipes</Text>
            </View>
            <Avatar.Icon size={56} icon="chef-hat" style={styles.welcomeAvatar} />
          </View>

          {/* Categories */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Title style={styles.sectionTitle}>Categories</Title>
            </View>
            <FlatList
              data={categories}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.categoryChip, { backgroundColor: '#FFF3E0' }]}
                  onPress={() => router.push(`/(app)/(tabs)/search?category=${item}`)}
                >
                  <Text style={styles.categoryChipText}>{item}</Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item}
            />
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
          <ActivityIndicator size="small" color="#E85D04" style={{ marginVertical: 16 }} />
        ) : error && recipes.length > 0 ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <Button mode="contained" onPress={() => loadMore()} style={styles.retryButton}>
              Retry
            </Button>
          </View>
        ) : !hasMore && recipes.length > 0 ? (
          <Text style={styles.emptyText}>You've reached the end 🍽️</Text>
        ) : null
      }
    />
  );
}