/**
 * Home Screen - Cookbook Discover Tab
 * Recipes load 10 at a time and more load as you scroll (GET /recipes?limit&skip).
 * Pull down to refresh. Category chips open Search filtered by tag.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useFavorites } from '@/context/FavoritesContext';
import { Card, Chip, Avatar, Button, IconButton } from 'react-native-paper';
import { recipeApi } from '@/services/recipeApi';
import { useRecipeCatalog } from '@/hooks';
import { countBy } from '@/utils/recipeFilters';
import { Recipe } from '@/types/recipe';
import { styles } from './homeStyles';

const PAGE_SIZE = 10;

type LoadMode = 'first' | 'more' | 'refresh';

export default function HomeScreen() {
  const router = useRouter();
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

  const renderRecipe = ({ item }: { item: Recipe }) => (
    <TouchableOpacity
      style={styles.recipeCard}
      onPress={() => router.push(`/recipe/${item.id}`)}
      activeOpacity={0.8}
    >
      <Card style={styles.card} elevation={2}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.image }} style={styles.recipeImage} resizeMode="cover" />
          <IconButton
            icon={isFavorite(item.id) ? 'heart' : 'heart-outline'}
            mode="contained"
            containerColor="rgba(255,255,255,0.92)"
            iconColor="#C62828"
            size={20}
            onPress={() => toggleFavorite(item.id)}
            accessibilityLabel={isFavorite(item.id) ? 'Remove from favorites' : 'Add to favorites'}
            style={{ position: 'absolute', top: 4, left: 4 }}
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
          <Text style={styles.recipeTitle} numberOfLines={1}>
            {item.name}
          </Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>⏱️ {item.prepTimeMinutes + item.cookTimeMinutes} min</Text>
            <Text style={styles.metaText}>👥 {item.servings} servings</Text>
            <Text style={styles.metaText}>🔥 {item.caloriesPerServing} cal</Text>
          </View>
          <View style={styles.cuisineRow}>
            <Chip style={styles.cuisineChip}>{item.cuisine}</Chip>
            {item.mealType.slice(0, 2).map((meal) => (
              <Chip key={meal} style={styles.mealChip}>
                {meal}
              </Chip>
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

  // First load
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
        <Button mode="contained" onPress={() => fetchPage(0, 'first')} style={styles.retryButton}>
          Retry
        </Button>
      </View>
    );
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
              style={[styles.categoryChip, { backgroundColor: '#FFF3E0' }]}
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

  const footer = loadingMore ? (
    <View style={styles.emptyContainer}>
      <ActivityIndicator color="#E85D04" />
    </View>
  ) : error ? (
    <View style={styles.emptyContainer}>
      <Text style={styles.errorText}>Couldn't load more recipes</Text>
      <Button onPress={() => fetchPage(recipes.length, 'more')}>Retry</Button>
    </View>
  ) : !hasMore && recipes.length > 0 ? (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>You've seen all {total} recipes</Text>
    </View>
  ) : null;

  return (
    <FlatList
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      data={recipes}
      renderItem={renderRecipe}
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