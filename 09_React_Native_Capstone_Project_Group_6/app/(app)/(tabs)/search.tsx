/**
 * Search Screen - Cookbook
 * - Debounced text search (GET /recipes/search?q=)
 * - Filters: cuisine, difficulty, meal type, tag (tag/meal type can arrive
 *   from the Categories tab or Home via ?tag= / ?mealType=)
 * - Sort icon next to the search bar (A-Z by default), "load more" as you
 *   scroll, favorite hearts, empty/error states
 *
 * Design: pill search bar, pill filter rows (selected = dark pill, same as
 * Home), clean results list. Colors come from Paper's theme.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, IconButton, Menu, Searchbar, useTheme } from 'react-native-paper';
import { recipeApi } from '@/services/recipeApi';
import { useDebounce, useRecipeCatalog } from '@/hooks';
import { useFavorites } from '@/context/FavoritesContext';
import { Recipe, RecipeDifficulty } from '@/types/recipe';
import { EmptyState, ErrorState, LoadingState, RecipeListItem } from '@/components/CommonComponents';
import {
  DEFAULT_SORT,
  EMPTY_FILTERS,
  RecipeFilters,
  SORT_OPTIONS,
  SortOption,
  filterRecipes,
  hasActiveFilters,
  sortRecipes,
  uniqueSorted,
} from '@/utils/recipeFilters';
import { useThemedStyles } from '@/context/ThemeContext';
import { styles as rawStyles } from './searchStyles';

const PAGE_SIZE = 10;
const DIFFICULTIES: readonly RecipeDifficulty[] = ['Easy', 'Medium', 'Hard'];

// Sort icon + search bar share one row
const local = StyleSheet.create({
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  searchGrow: { flex: 1 },
});

/** One rounded pill. Selected = dark pill (onSurface background). */
function Pill({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const styles = useThemedStyles(rawStyles);
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={[
        styles.pill,
        selected && { backgroundColor: colors.onSurface, borderColor: colors.onSurface },
      ]}
    >
      <Text style={[styles.pillText, selected && { color: colors.surface }]}>{label}</Text>
    </TouchableOpacity>
  );
}

/** A titled, horizontally scrolling row of single-select pills. */
function PillRow<T extends string>({
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
  const styles = useThemedStyles(rawStyles);
  if (options.length === 0) return null;
  return (
    <View style={styles.filterGroup}>
      <Text style={styles.filterTitle}>{label}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.pillScroll}
        contentContainerStyle={styles.pillRow}
      >
        {options.map((option) => (
          <Pill
            key={option}
            label={option}
            selected={selected === option}
            onPress={() => onSelect(selected === option ? null : option)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

export default function SearchScreen() {
  const router = useRouter();
  const styles = useThemedStyles(rawStyles);
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ tag?: string; mealType?: string }>();
  const { isFavorite, toggleFavorite } = useFavorites();
  const catalog = useRecipeCatalog();

  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 400);
  const [filters, setFilters] = useState<RecipeFilters>(EMPTY_FILTERS);
  const [sort, setSort] = useState<SortOption>(DEFAULT_SORT); // A-Z unless the user picks another
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
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
  const filtered = useMemo(() => sortRecipes(filterRecipes(base, filters), sort), [base, filters, sort]);
  const visible = filtered.slice(0, visibleCount);
  const sortLabel = SORT_OPTIONS.find((option) => option.value === sort)?.label ?? 'A–Z';

  // Filter choices come from the data itself
  const cuisines = useMemo(() => uniqueSorted(catalog.recipes, (r) => [r.cuisine]), [catalog.recipes]);
  const mealTypes = useMemo(() => uniqueSorted(catalog.recipes, (r) => r.mealType), [catalog.recipes]);
  const tags = useMemo(() => uniqueSorted(catalog.recipes, (r) => r.tags), [catalog.recipes]);

  const setFilter = <K extends keyof RecipeFilters>(key: K, value: RecipeFilters[K]) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const clearAll = () => {
    setQuery('');
    setFilters(EMPTY_FILTERS);
    setSort(DEFAULT_SORT);
  };

  const renderResult = ({ item }: { item: Recipe }) => (
    <RecipeListItem
      recipe={item}
      style={styles.resultCard}
      onPress={() => router.push(`/recipe/${item.id}`)}
      isFavorite={isFavorite(item.id)}
      onToggleFavorite={() => toggleFavorite(item.id)}
    />
  );

  // Search bar, filters and sort sit in the list header so everything scrolls together
  const header = (
    <View>
      <Text style={[styles.pageTitle, { color: colors.onSurface }]}>
        Find a <Text style={{ color: colors.primary }}>recipe</Text>
      </Text>

      <View style={styles.searchBarContainer}>
        <View style={local.searchRow}>
          <View style={local.searchGrow}>
            <Searchbar
              placeholder="Search recipes..."
              value={query}
              onChangeText={setQuery}
              loading={searching}
              elevation={0}
              style={styles.searchBar}
              inputStyle={styles.searchInput}
            />
          </View>

          {/* Sort icon: tap to choose how results are ordered */}
          <Menu
            visible={sortMenuOpen}
            onDismiss={() => setSortMenuOpen(false)}
            anchor={
              <IconButton
                icon={sort === 'name' ? 'sort-alphabetical-ascending' : 'sort'}
                mode="contained-tonal"
                onPress={() => setSortMenuOpen(true)}
                accessibilityLabel={`Sort by, currently ${sortLabel}`}
              />
            }
          >
            {SORT_OPTIONS.map((option) => (
              <Menu.Item
                key={option.value}
                title={option.label}
                leadingIcon={sort === option.value ? 'check' : undefined}
                onPress={() => {
                  setSort(option.value);
                  setSortMenuOpen(false);
                }}
              />
            ))}
          </Menu>
        </View>
      </View>

      <PillRow label="Cuisine" options={cuisines} selected={filters.cuisine} onSelect={(v) => setFilter('cuisine', v)} />
      <PillRow label="Difficulty" options={DIFFICULTIES} selected={filters.difficulty} onSelect={(v) => setFilter('difficulty', v)} />
      <PillRow label="Meal type" options={mealTypes} selected={filters.mealType} onSelect={(v) => setFilter('mealType', v)} />
      <PillRow label="Tag" options={tags} selected={filters.tag} onSelect={(v) => setFilter('tag', v)} />

      {(hasActiveFilters(filters) || query !== '' || sort !== DEFAULT_SORT) && (
        <View style={styles.clearRow}>
          <Button icon="filter-remove-outline" textColor={colors.primary} onPress={clearAll}>
            Clear search and filters
          </Button>
        </View>
      )}

      <Text style={styles.resultsTitle}>
        {debouncedQuery.trim() ? `Results for "${debouncedQuery.trim()}"` : 'All recipes'}
        <Text style={{ color: colors.onSurfaceVariant }}>{`  ${filtered.length} · ${sortLabel}`}</Text>
      </Text>
    </View>
  );

  const error = searchError ?? catalog.error;

  let empty: React.ReactElement;
  if (catalog.loading || (searching && searchResults === null)) {
    empty = <LoadingState message="Searching..." />;
  } else if (error) {
    empty = <ErrorState message={error} onRetry={() => catalog.reload(true)} />;
  } else {
    empty = (
      <EmptyState
        icon="magnify"
        title="No recipes found"
        message="Try a different search or remove some filters"
        actionLabel="Clear search and filters"
        onAction={clearAll}
      />
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
          <View style={styles.footer}>
            <ActivityIndicator color={colors.primary} />
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