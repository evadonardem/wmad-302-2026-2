/**
 * Search Screen - Botanical Sage & Terracotta Theme
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Card, Title, Chip, TextInput as PaperTextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { recipeApi } from '@/services/recipeApi';
import { Recipe } from '@/types/recipe';
import { APP_COLORS } from '@/constants/theme';
import { styles } from './searchStyles';

export default function SearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ q?: string; category?: string }>();

  const [query, setQuery] = useState(params.q || '');
  const [results, setResults] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(params.category || null);
  const [sortBy, setSortBy] = useState<'rating' | 'time' | 'calories' | null>(null);

  const categories = [
    'Beef', 'Chicken', 'Dessert', 'Lamb', 'Pasta', 'Pork', 'Seafood', 'Vegetarian',
  ];

  const performSearch = useCallback(async (searchQuery: string, category: string | null) => {
    setLoading(true);
    try {
      let data: Recipe[] = [];
      if (searchQuery.trim()) {
        const response = await recipeApi.searchRecipes(searchQuery.trim());
        data = response.recipes || [];
      } else if (category) {
        const response = await recipeApi.getRecipesByCategory(category);
        data = response.recipes || [];
      } else {
        const response = await recipeApi.getRecipes({ limit: 50 });
        data = response.recipes || [];
      }

      if (searchQuery.trim() && category) {
        const lowerQ = searchQuery.trim().toLowerCase();
        data = data.filter((r) => r.name.toLowerCase().includes(lowerQ));
      }

      if (category && !searchQuery.trim()) {
        const lowerCat = category.toLowerCase();
        data = data.filter(
          (r) =>
            r.cuisine?.toLowerCase() === lowerCat ||
            r.tags?.some((t) => t.toLowerCase() === lowerCat) ||
            r.mealType?.some((m) => m.toLowerCase() === lowerCat)
        );
      }

      if (sortBy === 'rating') {
        data.sort((a, b) => b.rating - a.rating);
      } else if (sortBy === 'time') {
        data.sort(
          (a, b) =>
            a.prepTimeMinutes + a.cookTimeMinutes - (b.prepTimeMinutes + b.cookTimeMinutes)
        );
      } else if (sortBy === 'calories') {
        data.sort((a, b) => a.caloriesPerServing - b.caloriesPerServing);
      }

      setResults(data);
    } catch (err) {
      console.error('Search error:', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [sortBy]);

  useEffect(() => {
    if (params.category) setSelectedCategory(params.category);
    if (params.q) setQuery(params.q);
  }, [params.category, params.q]);

  useEffect(() => {
    performSearch(query, selectedCategory);
  }, [query, selectedCategory, sortBy, performSearch]);

  const handleSearchSubmit = () => {
    performSearch(query, selectedCategory);
  };

  const handleCategoryPress = (category: string) => {
    setSelectedCategory(selectedCategory === category ? null : category);
  };

  const renderResult = ({ item }: { item: Recipe }) => (
    <TouchableOpacity
      style={styles.resultCard}
      onPress={() => router.push(`/(app)/(tabs)/recipe/${item.id}` as any)}
      activeOpacity={0.85}
    >
      <Card style={styles.card} elevation={1}>
        <View style={styles.resultContent}>
          <Image source={{ uri: item.image }} style={styles.resultImage} resizeMode="cover" />
          <View style={styles.resultInfo}>
            <Title style={styles.resultTitle} numberOfLines={1}>{item.name}</Title>
            <View style={styles.resultMeta}>
              <Chip style={styles.difficultyChip} textStyle={{ color: APP_COLORS.primary, fontSize: 11, fontWeight: '700' }}>
                {item.difficulty}
              </Chip>
              <Chip style={styles.cuisineChip} textStyle={{ color: APP_COLORS.textSecondary, fontSize: 11, fontWeight: '600' }}>
                {item.cuisine}
              </Chip>
            </View>
            <Text style={styles.resultDetails}>
              ⏱ {item.prepTimeMinutes + item.cookTimeMinutes}m · 👥 {item.servings} · ★ {item.rating.toFixed(1)} · 🔥 {item.caloriesPerServing} cal
            </Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchBarContainer}>
        <PaperTextInput
          mode="outlined"
          placeholder="Search recipes, ingredients..."
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearchSubmit}
          left={<PaperTextInput.Icon icon="magnify" color={APP_COLORS.primary} />}
          right={
            query ? (
              <PaperTextInput.Icon
                icon="close"
                onPress={() => {
                  setQuery('');
                  performSearch('', selectedCategory);
                }}
                color={APP_COLORS.textSecondary}
              />
            ) : undefined
          }
          activeOutlineColor={APP_COLORS.primary}
          outlineColor={APP_COLORS.border}
          style={styles.searchInput}
        />
      </View>

      <View style={styles.filterSection}>
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedCategory === item && styles.filterChipSelected,
              ]}
              onPress={() => handleCategoryPress(item)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedCategory === item && styles.filterChipTextSelected,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item}
        />
      </View>

      <View style={styles.sortSection}>
        <Chip
          selected={sortBy === 'rating'}
          onPress={() => setSortBy(sortBy === 'rating' ? null : 'rating')}
          icon="star"
          selectedColor={APP_COLORS.primary}
          style={{
            backgroundColor: sortBy === 'rating' ? APP_COLORS.primaryContainer : APP_COLORS.surface,
            borderColor: APP_COLORS.border,
            borderWidth: 1,
          }}
        >
          Top Rated
        </Chip>
        <Chip
          selected={sortBy === 'time'}
          onPress={() => setSortBy(sortBy === 'time' ? null : 'time')}
          icon="clock-outline"
          selectedColor={APP_COLORS.primary}
          style={{
            backgroundColor: sortBy === 'time' ? APP_COLORS.primaryContainer : APP_COLORS.surface,
            borderColor: APP_COLORS.border,
            borderWidth: 1,
          }}
        >
          Quickest
        </Chip>
        <Chip
          selected={sortBy === 'calories'}
          onPress={() => setSortBy(sortBy === 'calories' ? null : 'calories')}
          icon="fire"
          selectedColor={APP_COLORS.primary}
          style={{
            backgroundColor: sortBy === 'calories' ? APP_COLORS.primaryContainer : APP_COLORS.surface,
            borderColor: APP_COLORS.border,
            borderWidth: 1,
          }}
        >
          Lowest Cal
        </Chip>
      </View>

      <View style={styles.resultsSection}>
        <Title style={styles.resultsTitle}>
          {loading ? 'Searching kitchen...' : `Dishes Found (${results.length})`}
        </Title>
        {loading ? (
          <View style={styles.loadingCenter}>
            <ActivityIndicator size="large" color={APP_COLORS.primary} />
          </View>
        ) : results.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="silverware-variant" size={60} color={APP_COLORS.border} />
            <Text style={styles.emptyText}>No matching recipes</Text>
            <Text style={styles.emptySubtext}>Try selecting another pantry tag or keyword</Text>
          </View>
        ) : (
          <FlatList
            data={results}
            renderItem={renderResult}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.resultsList}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  );
}