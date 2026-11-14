
/**
 * Home Screen - Cookbook Discover Tab
 * Recipe discovery with favorites, pagination, and refresh.
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import {
  Card,
  Title,
  Chip,
  Avatar,
  Button,
  IconButton,
} from 'react-native-paper';

import { recipeApi } from '@/services/recipeApi';
import { favoritesStorage } from '@/utils/storage';
import type { Recipe } from '@/types/recipe';
import { styles } from './homeStyles';

const PAGE_SIZE = 20;

const categories = [
  'Beef',
  'Chicken',
  'Dessert',
  'Lamb',
  'Pasta',
  'Pork',
  'Seafood',
  'Vegetarian',
];

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [skip, setSkip] = useState(0);
  const [total, setTotal] = useState(0);

  const fetchRecipes = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      const [response, ids] = await Promise.all([
        recipeApi.getRecipes({
          limit: PAGE_SIZE,
          skip: 0,
        }),
        favoritesStorage.getIds(),
      ]);

      setRecipes(response.recipes);
      setFavoriteIds(ids);
      setSkip(response.recipes.length);
      setTotal(response.total);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load recipes',
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  // Refresh favorite status when returning to Home
  useFocusEffect(
    useCallback(() => {
      let active = true;

      const refreshFavoriteIds = async () => {
        try {
          const ids = await favoritesStorage.getIds();

          if (active) {
            setFavoriteIds(ids);
          }
        } catch (err) {
          console.error('Failed to refresh favorites:', err);
        }
      };

      refreshFavoriteIds();

      return () => {
        active = false;
      };
    }, []),
  );

  const loadMoreRecipes = async () => {
    if (loadingMore || loading || recipes.length >= total) {
      return;
    }

    try {
      setLoadingMore(true);

      const response = await recipeApi.getRecipes({
        limit: PAGE_SIZE,
        skip,
      });

      setRecipes((previous) => {
        const existingIds = new Set(previous.map((recipe) => recipe.id));

        const newRecipes = response.recipes.filter(
          (recipe) => !existingIds.has(recipe.id),
        );

        return [...previous, ...newRecipes];
      });

      setSkip(skip + response.recipes.length);
      setTotal(response.total);
    } catch (err) {
      console.error('Failed to load more recipes:', err);
      Alert.alert('Error', 'Unable to load more recipes.');
    } finally {
      setLoadingMore(false);
    }
  };

  const toggleFavorite = async (recipeId: number) => {
    try {
      const added = await favoritesStorage.toggleId(recipeId);

      setFavoriteIds((previous) =>
        added
          ? [...previous, recipeId]
          : previous.filter((id) => id !== recipeId),
      );
    } catch (err) {
      console.error('Failed to update favorite:', err);
      Alert.alert('Error', 'Unable to update favorites.');
    }
  };

  const popularRecipes = [...recipes]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 5);

  const renderRecipe = ({ item }: { item: Recipe }) => {
    const isFavorite = favoriteIds.includes(item.id);

    return (
      <TouchableOpacity
        style={styles.recipeCard}
        onPress={() =>
          router.push(`/recipe/${item.id}`)
        }
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

            <View
              style={{
                position: 'absolute',
                top: 4,
                right: 4,
                backgroundColor: '#FFFFFF',
                borderRadius: 24,
              }}
            >
              <IconButton
                icon={isFavorite ? 'heart' : 'heart-outline'}
                iconColor={isFavorite ? '#C62828' : '#8D6E63'}
                size={22}
                onPress={() => toggleFavorite(item.id)}
                accessibilityLabel={
                  isFavorite
                    ? 'Remove from favorites'
                    : 'Add to favorites'
                }
              />
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

              <Text style={styles.metaText}>
                👥 {item.servings} servings
              </Text>

              <Text style={styles.metaText}>
                🔥 {item.caloriesPerServing} cal
              </Text>
            </View>

            <View style={styles.cuisineRow}>
              <Chip style={styles.cuisineChip}>
                {item.cuisine}
              </Chip>

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
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E85D04" />
        <Text style={styles.loadingText}>
          Loading recipes...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>

        <Button
          mode="contained"
          onPress={() => fetchRecipes()}
          style={styles.retryButton}
        >
          Retry
        </Button>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.scrollView}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => fetchRecipes(true)}
          colors={['#E85D04']}
        />
      }
      contentContainerStyle={styles.scrollContent}
    >
      {/* Welcome Header */}
      <View style={styles.welcomeContainer}>
        <View style={styles.welcomeTextContainer}>
          <Text style={styles.welcomeGreeting}>
            {user
              ? `Welcome back, ${user.firstName}!`
              : 'Welcome to Cookbook!'}
          </Text>

          <Text style={styles.welcomeSubtitle}>
            Discover delicious recipes
          </Text>
        </View>

        <Avatar.Icon
          size={56}
          icon="chef-hat"
          style={styles.welcomeAvatar}
        />
      </View>

      {/* Categories */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Title style={styles.sectionTitle}>
            Categories
          </Title>
        </View>

        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryChip,
                { backgroundColor: '#FFF3E0' },
              ]}
              onPress={() =>
                router.push(
                  `/(app)/(tabs)/search?category=${encodeURIComponent(item)}`,
                )
              }
            >
              <Text style={styles.categoryChipText}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item}
        />
      </View>

      {/* Popular Recipes */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Title style={styles.sectionTitle}>
            Popular Recipes
          </Title>
        </View>

        <FlatList
          data={popularRecipes}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={renderRecipe}
          keyExtractor={(item) => `popular-${item.id}`}
          ItemSeparatorComponent={() => (
            <View style={styles.cardSeparator} />
          )}
        />
      </View>

      {/* Featured Recipes */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Title style={styles.sectionTitle}>
            Discover Recipes
          </Title>

          <TouchableOpacity
            onPress={() =>
              router.push('/(app)/(tabs)/search')
            }
            style={styles.seeAll}
          >
            <Text style={styles.seeAllText}>
              See All
            </Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={recipes}
          renderItem={renderRecipe}
          keyExtractor={(item) => item.id.toString()}
          ItemSeparatorComponent={() => (
            <View style={styles.cardSeparator} />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No recipes found
              </Text>
            </View>
          }
          scrollEnabled={false}
        />

        {recipes.length < total && (
          <Button
            mode="outlined"
            onPress={loadMoreRecipes}
            loading={loadingMore}
            disabled={loadingMore}
            style={{ marginTop: 12 }}
          >
            Load More Recipes
          </Button>
        )}
      </View>
    </ScrollView>
  );
}
