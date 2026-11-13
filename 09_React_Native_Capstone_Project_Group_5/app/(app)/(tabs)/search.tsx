/**
 * Search Screen - Cookbook
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  RefreshControl,
} from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Card, Title, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from './searchStyles';

interface Recipe {
  id: number;
  name: string;
  image: string;
  difficulty: string;
  cuisine: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  rating: number;
  tags: string[];
  ingredients?: string[];
}

const categoryFallbackTerms: Record<string, string[]> = {
  Lamb: ['lamb'],
  Seafood: ['shrimp', 'seafood'],
  Pork: ['pork'],
};

function shuffleRecipes(recipes: Recipe[]): Recipe[] {
  const shuffledRecipes = [...recipes];

  for (let index = shuffledRecipes.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffledRecipes[index], shuffledRecipes[randomIndex]] = [
      shuffledRecipes[randomIndex],
      shuffledRecipes[index],
    ];
  }

  return shuffledRecipes;
}

export default function SearchScreen() {
  const router = useRouter();
  const { category: categoryParam, view: viewParam } = useLocalSearchParams<{
    category?: string;
    view?: string;
  }>();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const searchStateRef = useRef({ query, selectedCategory, categoryParam, viewParam });

  const categories = ['Beef', 'Chicken', 'Dessert', 'Lamb', 'Pasta', 'Pork', 'Seafood', 'Vegetarian'];

  useEffect(() => {
    if (viewParam === 'all') {
      setQuery('');
      setSelectedCategory(null);
    } else if (categoryParam) {
      setQuery('');
      setSelectedCategory(categoryParam);
    }
  }, [categoryParam, viewParam]);

  useEffect(() => {
    searchStateRef.current = { query, selectedCategory, categoryParam, viewParam };
  }, [categoryParam, query, selectedCategory, viewParam]);

  const loadAllRecipes = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const response = await fetch('https://dummyjson.com/recipes?limit=50');
      if (!response.ok) throw new Error('Failed to load recipes');
      const data: { recipes: Recipe[] } = await response.json();
      setResults(shuffleRecipes(data.recipes));
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const handleSearch = useCallback(async (
    term = query.trim(),
    category = selectedCategory,
    isRefresh = false
  ) => {
    if (!term && !category) {
      await loadAllRecipes(isRefresh);
      return;
    }

    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const requestUrl = category && !categoryFallbackTerms[category]
        ? `https://dummyjson.com/recipes/tag/${encodeURIComponent(category)}?limit=50`
        : `https://dummyjson.com/recipes?limit=50`;

      const response = await fetch(requestUrl);
      if (!response.ok) throw new Error('Failed to load recipes');
      const data: { recipes?: Recipe[] } = await response.json();
      const recipes = Array.isArray(data.recipes) ? data.recipes : [];
      const categoryMatches = category
        ? recipes.filter((recipe) => {
            const recipeTags = recipe.tags ?? [];
            if (recipeTags.some((tag) => tag.toLowerCase() === category.toLowerCase())) {
              return true;
            }

            const fallbackTerms = categoryFallbackTerms[category] ?? [];
            const searchableRecipe = [recipe.name, recipe.cuisine, ...recipeTags, ...(recipe.ingredients ?? [])]
              .join(' ')
              .toLowerCase();
            return fallbackTerms.some((fallbackTerm) => searchableRecipe.includes(fallbackTerm));
          })
        : recipes;
      const normalizedTerm = term.toLowerCase();
      const filteredRecipes = normalizedTerm
        ? categoryMatches.filter((recipe) =>
            [recipe.name, recipe.cuisine, ...(recipe.tags ?? []), ...(recipe.ingredients ?? [])]
              .join(' ')
              .toLowerCase()
              .includes(normalizedTerm)
          )
        : categoryMatches;

      setResults(shuffleRecipes(filteredRecipes));
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [loadAllRecipes, query, selectedCategory]);

  useFocusEffect(useCallback(() => {
    const currentSearch = searchStateRef.current;
    if (currentSearch.categoryParam && !currentSearch.selectedCategory) return;
    if (currentSearch.query.trim() || currentSearch.selectedCategory) {
      setResults((currentResults) => shuffleRecipes(currentResults));
      return;
    }
    void loadAllRecipes();
  }, [loadAllRecipes]));

  useEffect(() => {
    const term = query.trim();
    if (!term && !selectedCategory) return;

    const timer = setTimeout(() => {
      void handleSearch(term, selectedCategory);
    }, 250);

    return () => clearTimeout(timer);
  }, [handleSearch, query, selectedCategory]);

  const onRefresh = () => {
    void handleSearch(query.trim(), selectedCategory, true);
  };

  const handleCategoryPress = (category: string) => {
    const nextCategory = selectedCategory === category ? null : category;
    setSelectedCategory(nextCategory);

    if (nextCategory) {
      setQuery('');
    } else if (!query.trim()) {
      void loadAllRecipes();
    }
  };

  const renderResult = ({ item }: { item: Recipe }) => (
    <TouchableOpacity
      style={styles.resultCard}
      onPress={() => router.push(`/(app)/recipe/${item.id}`)}
    >
      <Card style={styles.card} elevation={1}>
        <View style={styles.resultContent}>
          <Image source={{ uri: item.image }} style={styles.resultImage} resizeMode="cover" />
          <View style={styles.resultInfo}>
            <Title style={styles.resultTitle} numberOfLines={1}>
              {item.name}
            </Title>
            <View style={styles.resultMeta}>
              <Chip style={styles.difficultyChip}>{item.difficulty}</Chip>
              <Chip style={styles.cuisineChip}>{item.cuisine}</Chip>
            </View>
            <Text style={styles.resultDetails}>
              ⏱️ {item.prepTimeMinutes + item.cookTimeMinutes}min · 👥 {item.servings} · ⭐ {item.rating}
            </Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#E85D04']} />
      }
    >
      <View style={styles.searchBarContainer}>
        <View style={styles.searchInputWrap}>
          <MaterialCommunityIcons name="magnify" size={24} color="#8D6E63" style={{ marginLeft: 12 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search recipes..."
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => void handleSearch()}
          />
          {query ? (
            <TouchableOpacity onPress={() => setQuery('')} style={styles.clearButton}>
              <MaterialCommunityIcons name="close" size={22} color="#8D6E63" style={{ marginRight: 12 }} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => void handleSearch()} disabled={loading} style={styles.searchButton}>
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <MaterialCommunityIcons name="magnify" size={22} color="white" />
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.filterSection}>
        <Title style={styles.filterTitle}>Categories</Title>
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.filterChip, selectedCategory === item && styles.filterChipSelected]}
              onPress={() => handleCategoryPress(item)}
            >
              <Text style={[styles.filterChipText, selectedCategory === item && styles.filterChipTextSelected]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item}
        />
      </View>

      <View style={styles.resultsSection}>
        <Title style={styles.resultsTitle}>
          {query
            ? `Results for "${query}"${results.length > 0 ? ` (${results.length})` : ''}`
            : selectedCategory
              ? `${selectedCategory} Recipes${results.length > 0 ? ` (${results.length})` : ''}`
              : `All Recipes${results.length > 0 ? ` (${results.length})` : ''}`}
        </Title>
        {loading ? (
          <View style={styles.loadingCenter}>
            <ActivityIndicator size="large" color="#E85D04" />
          </View>
        ) : results.length === 0 && (query || selectedCategory) ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="magnify" size={64} color="#BCAAA4" />
            <Text style={styles.emptyText}>
              {selectedCategory ? `No ${selectedCategory} recipes found` : 'No recipes found'}
            </Text>
            <Text style={styles.emptySubtext}>
              {query ? 'Try a different search term' : 'Try another category'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={results}
            renderItem={renderResult}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.resultsList}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        )}
      </View>
    </ScrollView>
  );
}
