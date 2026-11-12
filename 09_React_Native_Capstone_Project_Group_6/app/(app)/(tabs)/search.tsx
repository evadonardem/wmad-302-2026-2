/**
 * Search Screen - Cookbook
 * - Debounced text search (GET /recipes/search?q=)
 * - Filters: cuisine, difficulty, meal type, tag (tag/meal type can arrive
 *   from the Categories tab or Home via ?tag= / ?mealType=)
 * - Sorting, "load more" as you scroll, favorite hearts, empty/error states
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, Card, Chip, IconButton, Searchbar, Title } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { recipeApi } from '@/services/recipeApi';
import { useDebounce, useRecipeCatalog } from '@/hooks';
import { useFavorites } from '@/context/FavoritesContext';
import { Recipe, RecipeDifficulty } from '@/types/recipe';
import {
  EMPTY_FILTERS,
  RecipeFilters,
  SortOption,
  filterRecipes,
  hasActiveFilters,
  sortRecipes,
  totalTime,
  uniqueSorted,
} from '@/utils/recipeFilters';
import { styles } from './searchStyles';

const PAGE_SIZE = 10;
const DIFFICULTIES: readonly RecipeDifficulty[] = ['Easy', 'Medium', 'Hard'];
const SORTS: { value: SortOption; label: string }[] = [
  { value: 'default', label: 'Default' },
  { value: 'rating', label: 'Top rated' },
  { value: 'time', label: 'Quickest' },
  { value: 'calories', label: 'Lowest calories' },
  { value: 'name', label: 'A–Z' },
];

const local = StyleSheet.create({
  chipRow: { flexDirection: 'row', gap: 8, paddingRight: 16 },
  group: { marginBottom: 12 },
  clearRow: { alignItems: 'flex-start', marginBottom: 4 },
  footer: { paddingVertical: 16 },
});

/** A titled, horizontally scrolling row of single-select chips. */
function ChipRow<T extends string>({
  label,
  options,
  selected,
  onSelect,
}: {
  label: string;
  options: readonly T[];
  selected: T | null;
  onSelect: (value: T | null) => void;
}) {
  if (options.length === 0) return null;
  return (
    <View style={local.group}>
      <Title style={styles.filterTitle}>{label}</Title>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={local.chipRow}
      >
        {options.map((option) => (
          <Chip
            key={option}
            selected={selected === option}
            showSelectedOverlay
            onPress={() => onSelect(selected === option ? null : option)}
          >
            {option}
          </Chip>
        ))}
      </ScrollView>
    </View>
  );
}

export default function SearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ tag?: string; mealType?: string }>();
  const { isFavorite, toggleFavorite } = useFavorites();
  const catalog = useRecipeCatalog();

  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 400);
  const [filters, setFilters] = useState<RecipeFilters>(EMPTY_FILTERS);
  const [sort, setSort] = useState<SortOption>('default');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Results of the text search (null = no text typed, so use the full catalog)
  const [searchResults, setSearchResults] = useState<Recipe[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const latestRequest = useRef(0); // ignore answers from outdated requests

  // Arrived from Categories / Home with ?tag= or ?mealType=
  useEffect(() => {
    if (params.tag || params.mealType) {
      setQuery('');
      setFilters({ ...EMPTY_FILTERS, tag: params.tag || null, mealType: params.mealType || null });
      // Clear the params so choosing the same category again still works
      router.setParams({ tag: '', mealType: '' });
    }
  }, [params.tag, params.mealType, router]);

  // Text search, run once typing pauses (the 400 ms debounce)
  useEffect(() => {
    const text = debouncedQuery.trim();
    const requestId = ++latestRequest.current;
    if (!text) {
      setSearchResults(null);
      setSearching(false);
      setSearchError(null);
      return;
    }
    setSearching(true);
    setSearchError(null);
    recipeApi
      .searchRecipes(text, { limit: 0 })
      .then((response) => {
        if (requestId === latestRequest.current) setSearchResults(response.recipes);
      })
      .catch((error: unknown) => {
        if (requestId === latestRequest.current) {
          setSearchError(error instanceof Error ? error.message : 'Search failed');
        }
      })
      .finally(() => {
        if (requestId === latestRequest.current) setSearching(false);
      });
  }, [debouncedQuery]);

  // Back to the first page whenever the inputs change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [debouncedQuery, filters, sort]);

  const base = searchResults ?? catalog.recipes;
  const filtered = useMemo(
    () => sortRecipes(filterRecipes(base, filters), sort),
    [base, filters, sort],
  );
  const visible = filtered.slice(0, visibleCount);

  // Filter choices come from the data itself
  const cuisines = useMemo(
    () => uniqueSorted(catalog.recipes, (r) => [r.cuisine]),
    [catalog.recipes],
  );
  const mealTypes = useMemo(
    () => uniqueSorted(catalog.recipes, (r) => r.mealType),
    [catalog.recipes],
  );
  const tags = useMemo(() => uniqueSorted(catalog.recipes, (r) => r.tags), [catalog.recipes]);

  const setFilter = <K extends keyof RecipeFilters>(key: K, value: RecipeFilters[K]) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const clearAll = () => {
    setQuery('');
    setFilters(EMPTY_FILTERS);
    setSort('default');
  };

  const renderResult = ({ item }: { item: Recipe }) => (
    <TouchableOpacity style={styles.resultCard} onPress={() => router.push(`/recipe/${item.id}`)}>
      <Card style={styles.card} elevation={1}>
        <View style={styles.resultContent}>
          <Image source={{ uri: item.image }} style={styles.resultImage} resizeMode="cover" />
          <View style={styles.resultInfo}>
            <Title style={styles.resultTitle} numberOfLines={1}>
              {item.name}
            </Title>
            <View style={styles.resultMeta}>
              <Chip compact style={styles.difficultyChip}>
                {item.difficulty}
              </Chip>
              <Chip compact style={styles.cuisineChip}>
                {item.cuisine}
              </Chip>
            </View>
            <Text style={styles.resultDetails}>
              ⏱️ {totalTime(item)}min · 🔥 {item.caloriesPerServing} cal · ⭐{' '}
              {item.rating.toFixed(1)}
            </Text>
          </View>
          <IconButton
            icon={isFavorite(item.id) ? 'heart' : 'heart-outline'}
            iconColor="#C62828"
            size={22}
            onPress={() => toggleFavorite(item.id)}
            accessibilityLabel={isFavorite(item.id) ? 'Remove from favorites' : 'Add to favorites'}
          />
        </View>
      </Card>
    </TouchableOpacity>
  );

  // Search bar, filters and sort sit in the list header so everything scrolls together
  const header = (
    <View>
      <View style={styles.searchBarContainer}>
        <Searchbar
          placeholder="Search recipes..."
          value={query}
          onChangeText={setQuery}
          loading={searching}
        />
      </View>

      <ChipRow
        label="Cuisine"
        options={cuisines}
        selected={filters.cuisine}
        onSelect={(v) => setFilter('cuisine', v)}
      />
      <ChipRow
        label="Difficulty"
        options={DIFFICULTIES}
        selected={filters.difficulty}
        onSelect={(v) => setFilter('difficulty', v)}
      />
      <ChipRow
        label="Meal type"
        options={mealTypes}
        selected={filters.mealType}
        onSelect={(v) => setFilter('mealType', v)}
      />
      <ChipRow
        label="Tag"
        options={tags}
        selected={filters.tag}
        onSelect={(v) => setFilter('tag', v)}
      />

      <View style={local.group}>
        <Title style={styles.filterTitle}>Sort by</Title>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={local.chipRow}
        >
          {SORTS.map((option) => (
            <Chip
              key={option.value}
              selected={sort === option.value}
              showSelectedOverlay
              onPress={() => setSort(option.value)}
            >
              {option.label}
            </Chip>
          ))}
        </ScrollView>
      </View>

      {(hasActiveFilters(filters) || query !== '' || sort !== 'default') && (
        <View style={local.clearRow}>
          <Button icon="filter-remove-outline" onPress={clearAll}>
            Clear search and filters
          </Button>
        </View>
      )}

      <Title style={styles.resultsTitle}>
        {debouncedQuery.trim() ? `Results for "${debouncedQuery.trim()}"` : 'All recipes'} (
        {filtered.length})
      </Title>
    </View>
  );

  const error = searchError ?? catalog.error;

  let empty: React.ReactElement | null = null;
  if (catalog.loading || (searching && searchResults === null)) {
    empty = (
      <View style={styles.loadingCenter}>
        <ActivityIndicator size="large" color="#E85D04" />
      </View>
    );
  } else if (error) {
    empty = (
      <View style={styles.emptyState}>
        <MaterialCommunityIcons name="alert-circle-outline" size={64} color="#BCAAA4" />
        <Text style={styles.emptyText}>Something went wrong</Text>
        <Text style={styles.emptySubtext}>{error}</Text>
        <Button mode="contained" onPress={() => catalog.reload(true)}>
          Try again
        </Button>
      </View>
    );
  } else {
    empty = (
      <View style={styles.emptyState}>
        <MaterialCommunityIcons name="magnify" size={64} color="#BCAAA4" />
        <Text style={styles.emptyText}>No recipes found</Text>
        <Text style={styles.emptySubtext}>Try a different search or remove some filters</Text>
        <Button mode="contained" onPress={clearAll}>
          Clear search and filters
        </Button>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={visible}
      renderItem={renderResult}
      keyExtractor={(item) => item.id.toString()}
      ListHeaderComponent={header}
      ListEmptyComponent={empty}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      ListFooterComponent={
        visible.length < filtered.length ? (
          <View style={local.footer}>
            <ActivityIndicator color="#E85D04" />
          </View>
        ) : null
      }
      onEndReached={() => {
        if (visibleCount < filtered.length) setVisibleCount((count) => count + PAGE_SIZE);
      }}
      onEndReachedThreshold={0.4}
      keyboardShouldPersistTaps="handled"
    />
  );
}
