/**
 * Search Screen - Cookbook
 * - Debounced query search (GET /recipes/search?q=)
 * - Category / cuisine / difficulty filters
 * - Sort by rating, time or calories
 * - Incremental ("infinite") display of results
 */
import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, Searchbar, Text, useTheme } from 'react-native-paper';
import { useDebounce } from '@/hooks';
import { useFavorites } from '@/context/FavoritesContext';
import { recipeApi } from '@/services/recipeApi';
import { getErrorMessage } from '@/services/authApi';
import { contentWidth } from '@/constants/theme';
import {
  CategoryChip,
  EmptyState,
  ErrorState,
  RecipeCard,
  RecipeCardSkeleton,
} from '@/components/CommonComponents';
import {
  EMPTY_FILTERS,
  filterAndSortRecipes,
  hasActiveFilters,
} from '@/utils/recipeFilters';
import type { CategorySummary, Difficulty, Recipe, RecipeFilters, SortOption } from '@/types/recipe';

const PAGE_SIZE = 10;
const DIFFICULTIES: Difficulty[] = ['Easy', 'Medium', 'Hard'];
const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'relevance', label: 'Best match' },
  { value: 'rating', label: 'Top rated' },
  { value: 'time', label: 'Quickest' },
  { value: 'calories', label: 'Lowest calories' },
];

export default function SearchScreen() {
  const router = useRouter();
  const theme = useTheme();
  const params = useLocalSearchParams<{ category?: string }>();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 400);
  const [filters, setFilters] = useState<RecipeFilters>(EMPTY_FILTERS);
  const [sort, setSort] = useState<SortOption>('relevance');
  const [base, setBase] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [categories, setCategories] = useState<CategorySummary[]>([]);
  const [cuisines, setCuisines] = useState<string[]>([]);

  // Category passed from Home / Categories screens
  useEffect(() => {
    if (params.category) {
      setFilters((prev) => ({ ...prev, category: params.category ?? null }));
    }
  }, [params.category]);

  // Filter options
  useEffect(() => {
    recipeApi.getCategories().then(setCategories).catch(() => undefined);
    recipeApi.getCuisines().then(setCuisines).catch(() => undefined);
  }, []);

  // Fetch whenever the debounced query changes
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const trimmed = debouncedQuery.trim();
    const request = trimmed
      ? recipeApi.searchRecipes(trimmed).then((res) => res.recipes)
      : recipeApi.getAllRecipes();

    request
      .then((list) => {
        if (!cancelled) {
          setBase(list);
          setVisibleCount(PAGE_SIZE);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(getErrorMessage(err, 'Search failed'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, attempt]);

  const results = useMemo(() => filterAndSortRecipes(base, filters, sort), [base, filters, sort]);
  const visible = useMemo(() => results.slice(0, visibleCount), [results, visibleCount]);

  const updateFilter = <K extends keyof RecipeFilters>(key: K, value: RecipeFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: prev[key] === value ? null : value }));
    setVisibleCount(PAGE_SIZE);
  };

  const clearAll = () => {
    setFilters(EMPTY_FILTERS);
    setSort('relevance');
    setQuery('');
    router.setParams({ category: '' });
  };

  const header = (
    <View style={styles.header}>
      <Searchbar
        placeholder="Search recipes..."
        value={query}
        onChangeText={setQuery}
        style={[styles.searchbar, { backgroundColor: theme.colors.surface }]}
        loading={loading && query.trim().length > 0}
        testID="search-input"
      />

      <Text variant="labelLarge" style={[styles.filterLabel, { color: theme.colors.onSurfaceVariant }]}>
        Category
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {categories.map((category) => (
          <CategoryChip
            key={category.name}
            label={category.name}
            selected={filters.category?.toLowerCase() === category.name.toLowerCase()}
            onPress={() => updateFilter('category', category.name)}
          />
        ))}
      </ScrollView>

      <Text variant="labelLarge" style={[styles.filterLabel, { color: theme.colors.onSurfaceVariant }]}>
        Cuisine
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {cuisines.map((cuisine) => (
          <CategoryChip
            key={cuisine}
            label={cuisine}
            selected={filters.cuisine === cuisine}
            onPress={() => updateFilter('cuisine', cuisine)}
          />
        ))}
      </ScrollView>

      <Text variant="labelLarge" style={[styles.filterLabel, { color: theme.colors.onSurfaceVariant }]}>
        Difficulty
      </Text>
      <View style={styles.chips}>
        {DIFFICULTIES.map((difficulty) => (
          <CategoryChip
            key={difficulty}
            label={difficulty}
            selected={filters.difficulty === difficulty}
            onPress={() => updateFilter('difficulty', difficulty)}
          />
        ))}
      </View>

      <Text variant="labelLarge" style={[styles.filterLabel, { color: theme.colors.onSurfaceVariant }]}>
        Sort by
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {SORT_OPTIONS.map((option) => (
          <CategoryChip
            key={option.value}
            label={option.label}
            selected={sort === option.value}
            onPress={() => setSort(option.value)}
          />
        ))}
      </ScrollView>

      <View style={styles.resultsHeader}>
        <Text variant="titleMedium" style={{ color: theme.colors.onSurface, fontWeight: '700' }}>
          {query.trim() ? `Results for "${query.trim()}"` : 'All recipes'}
          {!loading && !error ? ` (${results.length})` : ''}
        </Text>
        {(hasActiveFilters(filters) || sort !== 'relevance' || query.length > 0) && (
          <Button compact onPress={clearAll} testID="clear-filters">
            Clear
          </Button>
        )}
      </View>
    </View>
  );

  const emptyComponent = loading ? (
    <View style={styles.skeletons}>
      {[1, 2, 3, 4].map((n) => (
        <RecipeCardSkeleton key={n} variant="compact" />
      ))}
    </View>
  ) : error ? (
    <ErrorState message={error} onRetry={() => setAttempt((n) => n + 1)} />
  ) : (
    <EmptyState
      icon="magnify"
      title="No recipes found"
      message="Try a different search term or remove some filters."
      actionLabel={hasActiveFilters(filters) || query ? 'Clear search' : undefined}
      onAction={clearAll}
    />
  );

  return (
    <FlatList
      style={{ backgroundColor: theme.colors.background }}
      data={loading || error ? [] : visible}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <RecipeCard
          variant="compact"
          recipe={item}
          style={styles.card}
          onPress={() => router.push(`/recipe/${item.id}`)}
          isFavorite={isFavorite(item.id)}
          onToggleFavorite={() => toggleFavorite(item.id)}
        />
      )}
      ListHeaderComponent={header}
      ListEmptyComponent={emptyComponent}
      onEndReached={() => {
        if (visibleCount < results.length) setVisibleCount((count) => count + PAGE_SIZE);
      }}
      onEndReachedThreshold={0.4}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.content}
    />
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 24, ...contentWidth },
  header: { paddingTop: 16 },
  searchbar: { marginHorizontal: 16, borderRadius: 14 },
  filterLabel: { marginHorizontal: 16, marginTop: 14, marginBottom: 6 },
  chips: { paddingHorizontal: 16, gap: 8, flexDirection: 'row' },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 18,
    marginBottom: 8,
  },
  card: { paddingHorizontal: 16, marginBottom: 10 },
  skeletons: { paddingHorizontal: 16 },
});