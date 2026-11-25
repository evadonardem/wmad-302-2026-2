/**
 * Home Screen - Botanical Sage & Terracotta Theme
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Card, Title, Chip, Avatar, Button } from 'react-native-paper';
import { APP_COLORS } from '@/constants/theme';
import { styles } from './homeStyles';

interface Recipe {
  id: number;
  name: string;
  ingredients: string[];
  instructions: string[];
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  cuisine: string;
  caloriesPerServing: number;
  tags: string[];
  userId: number;
  image: string;
  rating: number;
  reviewCount: number;
  mealType: string[];
}

interface RecipesResponse {
  recipes: Recipe[];
  total: number;
  skip: number;
  limit: number;
}

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecipes = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      setError(null);

      const response = await fetch('https://dummyjson.com/recipes?limit=20');
      if (!response.ok) throw new Error('Failed to fetch recipes');

      const data: RecipesResponse = await response.json();
      setRecipes(data.recipes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recipes');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  const onRefresh = () => fetchRecipes(true);

  const renderRecipe = ({ item }: { item: Recipe }) => (
    <TouchableOpacity
      style={styles.recipeCard}
      onPress={() => router.push(`/(app)/(tabs)/recipe/${item.id}` as any)}
      activeOpacity={0.85}
    >
      <Card style={styles.card} elevation={1}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: item.image }}
            style={styles.recipeImage}
            resizeMode="cover"
          />
          <View style={styles.difficultyBadge}>
            <Chip
              textStyle={{
                fontSize: 11,
                fontWeight: '700',
                color:
                  item.difficulty === 'Easy'
                    ? APP_COLORS.easyText
                    : item.difficulty === 'Medium'
                    ? APP_COLORS.mediumText
                    : APP_COLORS.hardText,
              }}
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
              ⏱ {item.prepTimeMinutes + item.cookTimeMinutes}m
            </Text>
            <Text style={styles.metaText}>👥 {item.servings} srv</Text>
            <Text style={styles.metaText}>🔥 {item.caloriesPerServing} kcal</Text>
          </View>
          <View style={styles.cuisineRow}>
            <Chip style={styles.cuisineChip} textStyle={{ color: APP_COLORS.primary, fontSize: 11, fontWeight: '700' }}>
              {item.cuisine}
            </Chip>
            {item.mealType.slice(0, 2).map((meal) => (
              <Chip key={meal} style={styles.mealChip} textStyle={{ color: APP_COLORS.textSecondary, fontSize: 11, fontWeight: '600' }}>
                {meal}
              </Chip>
            ))}
          </View>
          <View style={styles.ratingRow}>
            <Text style={styles.ratingText}>
              ★ {item.rating.toFixed(1)} ({item.reviewCount} reviews)
            </Text>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={APP_COLORS.primary} />
        <Text style={styles.loadingText}>Preparing kitchen...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button mode="contained" onPress={() => fetchRecipes()} style={styles.retryButton}>
          Retry
        </Button>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.scrollView}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[APP_COLORS.primary]} />
      }
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.welcomeContainer}>
        <View style={styles.welcomeTextContainer}>
          <Text style={styles.welcomeEyebrow}>Seasonal Menu</Text>
          <Text style={styles.welcomeGreeting}>
            {user ? `Hello, Chef ${user.firstName}` : 'Welcome to Atelier'}
          </Text>
          <Text style={styles.welcomeSubtitle}>Explore handcrafted dishes for your table</Text>
        </View>
        <Avatar.Icon size={54} icon="chef-hat" color="#FAF9F5" style={styles.welcomeAvatar} />
      </View>

      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Title style={styles.sectionTitle}>Browse by Pantry</Title>
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
              style={styles.categoryChip}
              onPress={() => router.push(`/(app)/(tabs)/search?category=${item}` as any)}
            >
              <Text style={styles.categoryChipText}>{item}</Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item}
        />
      </View>

      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Title style={styles.sectionTitle}>Chef's Selection</Title>
          <TouchableOpacity onPress={() => router.push('/(app)/(tabs)/search' as any)} style={styles.seeAll}>
            <Text style={styles.seeAllText}>Explore All</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={recipes.slice(0, 10)}
          renderItem={renderRecipe}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={styles.cardSeparator} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No recipes found</Text>
            </View>
          }
        />
      </View>
    </ScrollView>
  );
}