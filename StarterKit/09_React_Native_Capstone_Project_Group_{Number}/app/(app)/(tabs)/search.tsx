
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Card, Title, Chip, TextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { recipeApi } from '@/services/recipeApi';
import type { Recipe, RecipesResponse } from '@/types/recipe';
import { styles } from './searchStyles';

type SortOption = 'rating' | 'time' | 'calories';

const PAGE_SIZE = 12;

const categories = [
  'Beef',
  'Chicken',
  'Dessert',
  'Lamb',
  'Pasta',
  'Pork',
  'Seafood',
  'Vegetarian',
  'Breakfast',
  'Appetizer',
  'Side Dish',
  'Main Course',
  'Soup',
  'Salad',
  'Drink',
];

const difficulties = ['Easy', 'Medium', 'Hard'];

const cuisines = [
  'Asian',
  'American',
  'Italian',
  'Mexican',
  'Indian',
  'Mediterranean',
  'Thai',
  'Japanese',
];

const mealTypes = [
  'Breakfast',
  'Lunch',
  'Dinner',
  'Snack',
  'Appetizer',
  'Dessert',
];

const prepTimeOptions = [
  { label: 'Any time', value: 0 },
  { label: 'Under 15 min', value: 15 },
  { label: 'Under 30 min', value: 30 },
  { label: 'Under 60 min', value: 60 },
];

export default function SearchScreen() {
  const router = useRouter();
  const { category: routeCategory } = useLocalSearchParams<{
    category?: string;
  }>();

  const initialCategory = Array.isArray(routeCategory)
    ? routeCategory[0]
    : routeCategory;

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const [results, setResults] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    initialCategory || null,
  );
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);
  const [selectedMealType, setSelectedMealType] = useState<string | null>(null);
  const [maxPrepTime, setMaxPrepTime] = useState(0);

  const [sortBy, setSortBy] = useState<SortOption>('rating');

  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const requestId = useRef(0);

  // Update category when navigation parameters change
  useEffect(() => {
    const category = Array.isArray(routeCategory)
      ? routeCategory[0]
      : routeCategory;

    setSelectedCategory(category || null);
  }, [routeCategory]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  // Fetch recipes
  const loadRecipes = useCallback(
    async (reset = false) => {
      if (!reset && (!hasMore || loadingMore || loading)) {
        return;
      }

      const currentRequest = ++requestId.current;
      const currentSkip = reset ? 0 : skip;

      if (reset) {
        setLoading(true);
        setSkip(0);
        setHasMore(true);
        setResults([]);
      } else {
        setLoadingMore(true);
      }

      try {
        let response: RecipesResponse;

        const params = {
          limit: PAGE_SIZE,
          skip: currentSkip,
        };

        if (selectedCategory) {
          response = await recipeApi.getRecipesByCategory(
            selectedCategory,
            params,
          );
        } else if (debouncedQuery) {
          response = await recipeApi.searchRecipes(
            debouncedQuery,
            params,
          );
        } else {
          response = await recipeApi.getRecipes(params);
        }

        // Ignore outdated requests
        if (currentRequest !== requestId.current) {
          return;
        }

        setResults((previous) =>
          reset
            ? response.recipes
            : [...previous, ...response.recipes],
        );

        setTotal(response.total);
        setSkip(currentSkip + response.recipes.length);

        setHasMore(
          currentSkip + response.recipes.length < response.total,
        );
      } catch {
        if (currentRequest === requestId.current) {
          Alert.alert(
            'Search Error',
            'Unable to load recipes. Please check your internet connection and try again.',
          );
        }
      } finally {
        if (currentRequest === requestId.current) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [
      debouncedQuery,
      selectedCategory,
      skip,
      hasMore,
      loading,
      loadingMore,
    ],
  );

  // Reload recipes when query or category changes
  useEffect(() => {
    loadRecipes(true);
    // Reload only when the search query or category changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, selectedCategory]);

  // Apply filters and sorting
  const filteredResults = useMemo(() => {
    let filtered = [...results];

    // Apply text search to category results too
    if (selectedCategory && debouncedQuery) {
      const searchTerm = debouncedQuery.toLowerCase();

      filtered = filtered.filter((recipe) =>
        recipe.name.toLowerCase().includes(searchTerm) ||
        recipe.ingredients.some((ingredient) =>
          ingredient.toLowerCase().includes(searchTerm),
        ),
      );
    }

    if (selectedDifficulty) {
      filtered = filtered.filter(
        (recipe) => recipe.difficulty === selectedDifficulty,
      );
    }

    if (selectedCuisine) {
      filtered = filtered.filter(
        (recipe) =>
          recipe.cuisine.toLowerCase() === selectedCuisine.toLowerCase(),
      );
    }

    if (selectedMealType) {
      filtered = filtered.filter((recipe) =>
        recipe.mealType.some(
          (meal) => meal.toLowerCase() === selectedMealType.toLowerCase(),
        ),
      );
    }

    if (maxPrepTime > 0) {
      filtered = filtered.filter(
        (recipe) => recipe.prepTimeMinutes <= maxPrepTime,
      );
    }

    filtered.sort((a, b) => {
      if (sortBy === 'rating') {
        return b.rating - a.rating;
      }

      if (sortBy === 'time') {
        const timeA = a.prepTimeMinutes + a.cookTimeMinutes;
        const timeB = b.prepTimeMinutes + b.cookTimeMinutes;
        return timeA - timeB;
      }

      return a.caloriesPerServing - b.caloriesPerServing;
    });

    return filtered;
  }, [
    results,
    selectedCategory,
    debouncedQuery,
    selectedDifficulty,
    selectedCuisine,
    selectedMealType,
    maxPrepTime,
    sortBy,
  ]);

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedDifficulty(null);
    setSelectedCuisine(null);
    setSelectedMealType(null);
    setMaxPrepTime(0);
  };

  const renderResult = ({ item }: { item: Recipe }) => (
    <TouchableOpacity
      style={styles.resultCard}
      activeOpacity={0.8}
      onPress={() =>
        router.push(`/recipe/${item.id}`)
      }
    >
      <Card style={styles.card} elevation={1}>
        <View style={styles.resultContent}>
          <Image
            source={{ uri: item.image }}
            style={styles.resultImage}
            resizeMode="cover"
          />

          <View style={styles.resultInfo}>
            <Title style={styles.resultTitle} numberOfLines={2}>
              {item.name}
            </Title>

            <View style={styles.resultMeta}>
              <Chip style={styles.difficultyChip} compact>
                {item.difficulty}
              </Chip>

              <Chip style={styles.cuisineChip} compact>
                {item.cuisine}
              </Chip>
            </View>

            <Text style={styles.resultDetails}>
              ⏱️ {item.prepTimeMinutes + item.cookTimeMinutes} min
              {'  '}👥 {item.servings}
              {'  '}⭐ {item.rating.toFixed(1)}
            </Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  const renderFilters = () => (
    <View>
      <View style={styles.searchBarContainer}>
        <TextInput
          mode="outlined"
          style={styles.searchInput}
          placeholder="Search recipes..."
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          left={<TextInput.Icon icon="magnify" />}
          right={
            query.length > 0 ? (
              <TextInput.Icon
                icon="close"
                onPress={() => setQuery('')}
              />
            ) : undefined
          }
        />
      </View>

      <View style={styles.filterSection}>
        <Title style={styles.filterTitle}>Categories</Title>

        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedCategory === item && styles.filterChipSelected,
              ]}
              onPress={() =>
                setSelectedCategory(
                  selectedCategory === item ? null : item,
                )
              }
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedCategory === item &&
                    styles.filterChipTextSelected,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <View style={styles.filterSection}>
        <Title style={styles.filterTitle}>Difficulty</Title>

        <View style={styles.sortOptions}>
          {difficulties.map((item) => (
            <TouchableOpacity
              key={item}
              style={[
                styles.filterChip,
                selectedDifficulty === item && styles.filterChipSelected,
              ]}
              onPress={() =>
                setSelectedDifficulty(
                  selectedDifficulty === item ? null : item,
                )
              }
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedDifficulty === item &&
                    styles.filterChipTextSelected,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.filterSection}>
        <Title style={styles.filterTitle}>Cuisine</Title>

        <View style={styles.sortOptions}>
          {cuisines.map((item) => (
            <TouchableOpacity
              key={item}
              style={[
                styles.filterChip,
                selectedCuisine === item && styles.filterChipSelected,
              ]}
              onPress={() =>
                setSelectedCuisine(
                  selectedCuisine === item ? null : item,
                )
              }
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedCuisine === item &&
                    styles.filterChipTextSelected,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.filterSection}>
        <Title style={styles.filterTitle}>Meal Type</Title>

        <View style={styles.sortOptions}>
          {mealTypes.map((item) => (
            <TouchableOpacity
              key={item}
              style={[
                styles.filterChip,
                selectedMealType === item && styles.filterChipSelected,
              ]}
              onPress={() =>
                setSelectedMealType(
                  selectedMealType === item ? null : item,
                )
              }
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedMealType === item &&
                    styles.filterChipTextSelected,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.filterSection}>
        <Title style={styles.filterTitle}>Preparation Time</Title>

        <View style={styles.sortOptions}>
          {prepTimeOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.filterChip,
                maxPrepTime === option.value &&
                  styles.filterChipSelected,
              ]}
              onPress={() => setMaxPrepTime(option.value)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  maxPrepTime === option.value &&
                    styles.filterChipTextSelected,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.sortSection}>
        <Title style={styles.filterTitle}>Sort By</Title>

        <View style={styles.sortOptions}>
          {[
            { label: 'Top Rated', value: 'rating' },
            { label: 'Cooking Time', value: 'time' },
            { label: 'Calories', value: 'calories' },
          ].map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.sortChip,
                sortBy === option.value && styles.sortChipSelected,
              ]}
              onPress={() =>
                setSortBy(option.value as SortOption)
              }
            >
              <Text
                style={[
                  styles.sortChipText,
                  sortBy === option.value &&
                    styles.sortChipTextSelected,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.resultsSection}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Title style={styles.resultsTitle}>
            Results ({filteredResults.length})
          </Title>

          <TouchableOpacity onPress={clearFilters}>
            <Text style={{ color: '#E85D04', fontWeight: '600' }}>
              Clear Filters
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={{ color: '#8D6E63', marginTop: 4 }}>
          {selectedCategory
            ? `Category: ${selectedCategory}`
            : 'All recipes'}
        </Text>
      </View>
    </View>
  );

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={filteredResults}
      renderItem={renderResult}
      keyExtractor={(item) => item.id.toString()}
      ListHeaderComponent={renderFilters}
      ItemSeparatorComponent={() => (
        <View style={styles.separator} />
      )}
      onEndReached={() => {
        if (!loading && !loadingMore && hasMore) {
          loadRecipes(false);
        }
      }}
      onEndReachedThreshold={0.5}
      ListEmptyComponent={
        loading ? (
          <View style={styles.loadingCenter}>
            <ActivityIndicator size="large" color="#E85D04" />
            <Text style={{ marginTop: 12, color: '#8D6E63' }}>
              Loading recipes...
            </Text>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="magnify"
              size={64}
              color="#BCAAA4"
            />
            <Text style={styles.emptyText}>No recipes found</Text>
            <Text style={styles.emptySubtext}>
              Try another search term or adjust your filters.
            </Text>
          </View>
        )
      }
      ListFooterComponent={
        loadingMore ? (
          <View style={styles.loadingCenter}>
            <ActivityIndicator size="small" color="#E85D04" />
            <Text style={{ marginTop: 8, color: '#8D6E63' }}>
              Loading more recipes...
            </Text>
          </View>
        ) : !hasMore && results.length > 0 ? (
          <Text
            style={{
              textAlign: 'center',
              paddingVertical: 20,
              color: '#8D6E63',
            }}
          >
            You've reached the end of the recipes.
          </Text>
        ) : null
      }
    />
  );
}

