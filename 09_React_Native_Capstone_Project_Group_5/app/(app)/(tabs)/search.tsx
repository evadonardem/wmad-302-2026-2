/**
 * Search Screen - Cookbook
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Button, Card, Title, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { recipeApi } from '@/services/recipeApi';
import type { Recipe, RecipesResponse } from '@/types/recipe';
import {
  recipeMatchesCategory,
  RECIPE_CATEGORIES,
} from '@/utils/recipeCategories';
import { recipeMatchesSearch } from '@/utils/recipeSearch';
import { styles } from './searchStyles';

const PAGE_SIZE = 10;
const SEARCH_CATEGORIES = RECIPE_CATEGORIES.slice(0, 8);
const DIFFICULTY_LEVELS: Recipe['difficulty'][] = ['Easy', 'Medium', 'Hard'];
const COUNTRY_FILTERS = [
  { country: 'Brazil', cuisine: 'Brazilian' },
  { country: 'Greece', cuisine: 'Greek' },
  { country: 'India', cuisine: 'Indian' },
  { country: 'Italy', cuisine: 'Italian' },
  { country: 'Japan', cuisine: 'Japanese' },
  { country: 'Lebanon', cuisine: 'Lebanese' },
  { country: 'Mexico', cuisine: 'Mexican' },
  { country: 'Morocco', cuisine: 'Moroccan' },
  { country: 'Pakistan', cuisine: 'Pakistani' },
  { country: 'Russia', cuisine: 'Russian' },
  { country: 'Spain', cuisine: 'Spanish' },
  { country: 'Thailand', cuisine: 'Thai' },
  { country: 'Turkey', cuisine: 'Turkish' },
  { country: 'United States', cuisine: 'American' },
  { country: 'Vietnam', cuisine: 'Vietnamese' },
] as const;

export default function SearchScreen() {
  const router = useRouter();
  const { category: categoryParam, view: viewParam } = useLocalSearchParams<{
    category?: string;
    view?: string;
  }>();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchButtonLoading, setSearchButtonLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Recipe['difficulty'] | null>(null);
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);
  const searchStateRef = useRef({
    query,
    selectedCategory,
    selectedDifficulty,
    selectedCuisine,
    categoryParam,
    viewParam,
  });
  const requestIdRef = useRef(0);
  const nextSkipRef = useRef(0);
  const hasMoreRef = useRef(true);
  const loadingMoreRef = useRef(false);
  const recipePageCacheRef = useRef(new Map<number, RecipesResponse>());
  const filterTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryModeRef = useRef<'initial' | 'refresh' | 'more'>('initial');
  const selectedCountry = COUNTRY_FILTERS.find(({ cuisine }) => cuisine === selectedCuisine)?.country ?? null;
  const activeFilters = [
    selectedCategory,
    selectedDifficulty ? `${selectedDifficulty} difficulty` : null,
    selectedCountry,
  ].filter((filter): filter is string => filter !== null);
  const filterSummary = activeFilters.length > 2
    ? `${activeFilters.slice(0, -1).join(', ')}, and ${activeFilters[activeFilters.length - 1]}`
    : activeFilters.join(' and ');

  useEffect(() => {
    if (viewParam === 'all') {
      setQuery('');
      setSelectedCategory(null);
      setSelectedDifficulty(null);
      setSelectedCuisine(null);
    } else if (categoryParam) {
      setQuery('');
      setSelectedCategory(categoryParam);
      setSelectedDifficulty(null);
      setSelectedCuisine(null);
    }
  }, [categoryParam, viewParam]);

  useEffect(() => {
    searchStateRef.current = {
      query,
      selectedCategory,
      selectedDifficulty,
      selectedCuisine,
      categoryParam,
      viewParam,
    };
  }, [categoryParam, query, selectedCategory, selectedCuisine, selectedDifficulty, viewParam]);

  const fetchPage = useCallback(async (
    mode: 'initial' | 'refresh' | 'more',
    term: string,
    category: string | null,
    difficulty: Recipe['difficulty'] | null,
    cuisine: string | null,
    showSearchButtonLoading = false
  ) => {
    if (mode === 'more' && (!hasMoreRef.current || loadingMoreRef.current)) return;

    const requestId = mode === 'more' ? requestIdRef.current : requestIdRef.current + 1;
    requestIdRef.current = requestId;
    if (mode !== 'more') {
      setSearchButtonLoading(showSearchButtonLoading);
      if (mode === 'refresh') recipePageCacheRef.current.clear();
      loadingMoreRef.current = false;
      setLoadingMore(false);
      nextSkipRef.current = 0;
      hasMoreRef.current = true;
    } else {
      loadingMoreRef.current = true;
    }

    retryModeRef.current = mode;
    if (mode === 'initial') {
      setLoading(true);
      setError(null);
      setLoadMoreError(null);
      setResults([]);
    } else if (mode === 'refresh') {
      setRefreshing(true);
      setLoadMoreError(null);
    } else {
      setLoadingMore(true);
      setLoadMoreError(null);
    }

    try {
      let skip = mode === 'more' ? nextSkipRef.current : 0;
      let total = 0;
      const pageResults: Recipe[] = [];

      do {
        const cachedPage = mode === 'refresh'
          ? undefined
          : recipePageCacheRef.current.get(skip);
        const page = cachedPage ?? await recipeApi.getRecipes({ limit: PAGE_SIZE, skip });
        if (requestId !== requestIdRef.current) return;
        if (!cachedPage) recipePageCacheRef.current.set(page.skip, page);

        total = page.total;
        const categoryMatches = category
          ? page.recipes.filter((recipe) => recipeMatchesCategory(recipe, category))
          : page.recipes;
        const difficultyMatches = difficulty
          ? categoryMatches.filter((recipe) => recipe.difficulty === difficulty)
          : categoryMatches;
        const cuisineMatches = cuisine
          ? difficultyMatches.filter((recipe) => recipe.cuisine === cuisine)
          : difficultyMatches;
        const filteredRecipes = cuisineMatches.filter((recipe) =>
          recipeMatchesSearch(recipe, term)
        );
        pageResults.push(...filteredRecipes);
        skip = page.skip + page.recipes.length;
        if (page.recipes.length === 0) total = skip;
      } while (pageResults.length === 0 && skip < total);

      if (requestId !== requestIdRef.current) return;
      nextSkipRef.current = skip;
      hasMoreRef.current = skip < total;
      setResults((currentResults) => (
        mode === 'more' ? [...currentResults, ...pageResults] : pageResults
      ));
      setError(null);
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : 'Unable to load recipes.';
      if (mode === 'initial') setError(message);
      else setLoadMoreError(message);
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
        setSearchButtonLoading(false);
        setRefreshing(false);
        if (mode === 'more') {
          loadingMoreRef.current = false;
          setLoadingMore(false);
        }
      }
    }
  }, []);

  useFocusEffect(useCallback(() => {
    const currentSearch = searchStateRef.current;
    void fetchPage(
      'initial',
      currentSearch.query.trim(),
      currentSearch.selectedCategory,
      currentSearch.selectedDifficulty,
      currentSearch.selectedCuisine
    );
  }, [fetchPage]));

  const filterEffectInitializedRef = useRef(false);
  useEffect(() => {
    if (!filterEffectInitializedRef.current) {
      filterEffectInitializedRef.current = true;
      return;
    }

    const timer = setTimeout(() => {
      filterTimerRef.current = null;
      void fetchPage(
        'initial',
        query.trim(),
        selectedCategory,
        selectedDifficulty,
        selectedCuisine
      );
    }, 250);
    filterTimerRef.current = timer;

    return () => {
      clearTimeout(timer);
      if (filterTimerRef.current === timer) filterTimerRef.current = null;
    };
  }, [fetchPage, query, selectedCategory, selectedCuisine, selectedDifficulty]);

  const handleCategoryPress = (category: string) => {
    const nextCategory = selectedCategory === category ? null : category;
    setSelectedCategory(nextCategory);

    if (nextCategory) {
      setQuery('');
    }
  };

  const handleDifficultyPress = (difficulty: Recipe['difficulty']) => {
    setSelectedDifficulty((currentDifficulty) => (
      currentDifficulty === difficulty ? null : difficulty
    ));
  };

  const handleCountryPress = (cuisine: string) => {
    setSelectedCuisine((currentCuisine) => (
      currentCuisine === cuisine ? null : cuisine
    ));
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
            <Title style={styles.resultTitle} numberOfLines={2}>
              {item.name}
            </Title>
            <View style={styles.resultMeta}>
              <Chip style={styles.difficultyChip}>{item.difficulty}</Chip>
              <Chip style={styles.cuisineChip}>{item.cuisine}</Chip>
            </View>
            <Text style={styles.resultDetails} numberOfLines={2}>
              ⏱️ {item.prepTimeMinutes + item.cookTimeMinutes}min · 👥 {item.servings} · ⭐ {item.rating}
            </Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  const retryLoading = () => {
    void fetchPage(
      retryModeRef.current,
      query.trim(),
      selectedCategory,
      selectedDifficulty,
      selectedCuisine
    );
  };

  const submitSearch = () => {
    if (filterTimerRef.current !== null) {
      clearTimeout(filterTimerRef.current);
      filterTimerRef.current = null;
    }

    void fetchPage(
      'initial',
      query.trim(),
      selectedCategory,
      selectedDifficulty,
      selectedCuisine,
      true
    );
  };

  return (
    <FlatList
      style={styles.container}
      data={results}
      renderItem={renderResult}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.content}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      ListHeaderComponent={
        <>
          <View style={styles.searchBarContainer}>
            <View style={styles.searchInputWrap}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search recipes..."
                value={query}
                onChangeText={setQuery}
                returnKeyType="search"
                onSubmitEditing={submitSearch}
              />
              {query.trim() ? (
                <TouchableOpacity onPress={() => setQuery('')} style={styles.clearButton}>
                  <MaterialCommunityIcons name="close" size={22} color="#8D6E63" />
                </TouchableOpacity>
              ) : null}
              <TouchableOpacity
                onPress={submitSearch}
                disabled={searchButtonLoading}
                style={styles.searchButton}
                accessibilityRole="button"
                accessibilityLabel="Search recipes"
              >
                {searchButtonLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <MaterialCommunityIcons name="magnify" size={20} color="white" />
                    <Text style={styles.searchButtonText}>Search</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.filterSection}>
            <Title style={styles.filterTitle}>Categories</Title>
            <FlatList
              data={SEARCH_CATEGORIES}
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

          <View style={styles.filterSection}>
            <Title style={styles.filterTitle}>Difficulty</Title>
            <View style={styles.difficultyFilters}>
              {DIFFICULTY_LEVELS.map((difficulty) => (
                <TouchableOpacity
                  key={difficulty}
                  style={[
                    styles.filterChip,
                    selectedDifficulty === difficulty && styles.filterChipSelected,
                  ]}
                  onPress={() => handleDifficultyPress(difficulty)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: selectedDifficulty === difficulty }}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedDifficulty === difficulty && styles.filterChipTextSelected,
                    ]}
                  >
                    {difficulty}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.filterSection}>
            <Title style={styles.filterTitle}>Countries</Title>
            <FlatList
              data={COUNTRY_FILTERS}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    selectedCuisine === item.cuisine && styles.filterChipSelected,
                  ]}
                  onPress={() => handleCountryPress(item.cuisine)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: selectedCuisine === item.cuisine }}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedCuisine === item.cuisine && styles.filterChipTextSelected,
                    ]}
                  >
                    {item.country}
                  </Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.country}
            />
          </View>

          <View style={styles.resultsSection}>
            <Title style={styles.resultsTitle}>
              {query.trim()
                ? `Results for "${query.trim()}"`
                : selectedCategory
                  ? `${selectedCategory} Recipes`
                  : selectedDifficulty
                    ? `${selectedDifficulty} Recipes`
                    : selectedCountry
                      ? `Recipes from ${selectedCountry}`
                      : 'All Recipes'}
            </Title>
          </View>
        </>
      }
      ListEmptyComponent={
        <View style={styles.emptyState}>
          {loading ? (
            <ActivityIndicator size="large" color="#E85D04" />
          ) : error || loadMoreError ? (
            <>
              <Text style={styles.errorText}>{error ?? loadMoreError}</Text>
              <Button mode="contained" onPress={retryLoading} style={styles.retryButton}>
                Retry
              </Button>
            </>
          ) : (
            <>
              <MaterialCommunityIcons name="magnify" size={64} color="#BCAAA4" />
              <Text style={styles.emptyText}>
                {filterSummary
                  ? `No recipes found for ${query.trim() ? `“${query.trim()}” with ` : ''}${filterSummary}.`
                  : query.trim()
                    ? `No recipes found for “${query.trim()}”.`
                    : 'No recipes found.'}
              </Text>
              <Text style={styles.emptySubtext}>
                {activeFilters.length > 0
                  ? 'Try removing a filter or changing one of your choices.'
                  : query.trim()
                    ? 'Try a different search term.'
                    : 'Try another category, difficulty, or country.'}
              </Text>
            </>
          )}
        </View>
      }
      ListFooterComponent={(
        <View style={styles.footerContainer}>
          {loadingMore ? <ActivityIndicator size="small" color="#E85D04" /> : null}
          {loadMoreError && results.length > 0 ? (
            <>
              <Text style={styles.errorText}>{loadMoreError}</Text>
              <Button mode="contained" onPress={retryLoading} style={styles.retryButton}>
                Retry
              </Button>
            </>
          ) : null}
        </View>
      )}
      onEndReached={() => {
        if (results.length > 0 && !loading && !error) {
          void fetchPage(
            'more',
            query.trim(),
            selectedCategory,
            selectedDifficulty,
            selectedCuisine
          );
        }
      }}
      onEndReachedThreshold={0.5}
      refreshing={refreshing}
      onRefresh={() => void fetchPage(
        'refresh',
        query.trim(),
        selectedCategory,
        selectedDifficulty,
        selectedCuisine
      )}
      keyboardShouldPersistTaps="handled"
    />
  );
}
