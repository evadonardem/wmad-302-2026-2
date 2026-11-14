/**
 * Home Screen - Cookbook Discover Tab
 * Students implement: Recipe grid, categories, featured recipes
 * API: https://dummyjson.com/docs/recipes
 */
import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { recipeApi } from '@/services/recipeApi';
import type { Recipe } from '@/types/recipe';
import { getStorageItem } from '@/utils/storage';
import { Card, Title, Chip, Avatar, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from './homeStyles';

interface RecipeDisplayPreferences {
  showRecipeRatings: boolean;
  showNutritionInfo: boolean;
}

const DEFAULT_RECIPE_DISPLAY_PREFERENCES: RecipeDisplayPreferences = {
  showRecipeRatings: true,
  showNutritionInfo: true,
};

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [displayPreferences, setDisplayPreferences] = useState(DEFAULT_RECIPE_DISPLAY_PREFERENCES);
  const listRef = useRef<FlatList<Recipe>>(null);
  const nextSkipRef = useRef(0);
  const hasMoreRef = useRef(true);
  const loadingMoreRef = useRef(false);

  const fetchRecipes = useCallback(async (mode: 'initial' | 'refresh' | 'more' = 'initial') => {
    if (mode === 'more' && (!hasMoreRef.current || loadingMoreRef.current)) return;
    if (mode === 'more') loadingMoreRef.current = true;
    const skip = mode === 'more' ? nextSkipRef.current : 0;

    try {
      if (mode === 'initial') {
        setLoading(true);
        setError(null);
      } else if (mode === 'refresh') {
        setRefreshing(true);
        setError(null);
      } else {
        setLoadingMore(true);
        setLoadMoreError(null);
      }

      const data = await recipeApi.getRecipes({ limit: 10, skip });
      setRecipes((currentRecipes) => (
        mode === 'more' ? [...currentRecipes, ...data.recipes] : data.recipes
      ));
      nextSkipRef.current = skip + data.recipes.length;
      hasMoreRef.current = nextSkipRef.current < data.total;

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load recipes';
      if (mode === 'more') setLoadMoreError(message);
      else setError(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
      if (mode === 'more') {
        loadingMoreRef.current = false;
        setLoadingMore(false);
      }
    }
  }, []);

  useFocusEffect(useCallback(() => {
    void fetchRecipes();
    void getStorageItem<RecipeDisplayPreferences>('user_settings').then((storedPreferences) => {
      setDisplayPreferences({ ...DEFAULT_RECIPE_DISPLAY_PREFERENCES, ...storedPreferences });
    });
  }, [fetchRecipes]));

  const onRefresh = () => {
    void fetchRecipes('refresh');
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
          <Title style={styles.recipeTitle} numberOfLines={2}>
            {item.name}
          </Title>
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>
              ⏱️ {item.prepTimeMinutes + item.cookTimeMinutes} min
            </Text>
            <Text style={styles.metaText}>👥 {item.servings} servings</Text>
            {displayPreferences.showNutritionInfo ? (
              <Text style={styles.metaText}>🔥 {item.caloriesPerServing} cal</Text>
            ) : null}
          </View>
          <View style={styles.cuisineRow}>
            <Chip style={styles.cuisineChip}>{item.cuisine}</Chip>
            {item.mealType.slice(0, 2).map((meal) => (
              <Chip key={meal} style={styles.mealChip}>{meal}</Chip>
            ))}
          </View>
          {displayPreferences.showRecipeRatings ? (
            <View style={styles.ratingRow}>
              <Text style={styles.ratingText}>
                ⭐ {item.rating.toFixed(1)} ({item.reviewCount} reviews)
              </Text>
            </View>
          ) : null}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E85D04" />
        <Text style={styles.loadingText}>Loading recipes...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button mode="contained" onPress={() => void fetchRecipes()} style={styles.retryButton}>
          Retry
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.screenContainer}>
      <FlatList
        ref={listRef}
        style={styles.scrollView}
        data={recipes}
        renderItem={renderRecipe}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.scrollContent}
        ItemSeparatorComponent={() => <View style={styles.cardSeparator} />}
        ListHeaderComponent={
          <>
          <View style={styles.welcomeContainer}>
            <View style={styles.welcomeTextContainer}>
              <Text style={styles.welcomeGreeting}>
                {user ? `Welcome back, ${user.firstName}!` : 'Welcome to Cookbook!'}
              </Text>
              <Text style={styles.welcomeSubtitle}>Discover delicious recipes</Text>
            </View>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Open profile"
              onPress={() => router.push('/(app)/(tabs)/profile')}
            >
              <Avatar.Icon size={56} icon="chef-hat" style={styles.welcomeAvatar} />
            </TouchableOpacity>
          </View>

          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Title style={styles.sectionTitle}>Categories</Title>
              <TouchableOpacity
                accessibilityRole="button"
                onPress={() => router.push('/(app)/(tabs)/categories')}
                style={styles.seeAll}
              >
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={[
                'Beef', 'Chicken', 'Dessert', 'Lamb', 'Pasta', 'Pork', 'Seafood', 'Vegetarian',
              ]}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.categoryChip, { backgroundColor: '#FFF3E0' }]}
                  onPress={() => router.push({
                    pathname: '/(app)/(tabs)/search',
                    params: { category: item, view: 'category' },
                  })}
                >
                  <Text style={styles.categoryChipText}>{item}</Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item}
            />
          </View>

          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Title style={styles.sectionTitle}>Featured Recipes</Title>
              <TouchableOpacity
                onPress={() => router.push({ pathname: '/(app)/(tabs)/search', params: { view: 'all' } })}
                style={styles.seeAll}
              >
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
          </View>
          </>
        }
        ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No recipes found</Text>
        </View>
        }
        ListFooterComponent={(
        <View style={styles.footerContainer}>
          {loadingMore ? <ActivityIndicator size="small" color="#E85D04" /> : null}
          {loadMoreError ? (
            <>
              <Text style={styles.errorText}>{loadMoreError}</Text>
              <Button mode="contained" onPress={() => void fetchRecipes('more')} style={styles.retryButton}>
                Retry
              </Button>
            </>
          ) : null}
        </View>
        )}
        onEndReached={() => void fetchRecipes('more')}
        onEndReachedThreshold={0.5}
        onScroll={(event) => {
          const shouldShow = event.nativeEvent.contentOffset.y > 400;
          setShowScrollToTop((current) => (current === shouldShow ? current : shouldShow));
        }}
        scrollEventThrottle={16}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />
      {showScrollToTop ? (
        <TouchableOpacity
          style={styles.scrollToTopButton}
          accessibilityRole="button"
          accessibilityLabel="Scroll to top of recipes"
          onPress={() => listRef.current?.scrollToOffset({ offset: 0, animated: true })}
        >
          <MaterialCommunityIcons name="arrow-up" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}