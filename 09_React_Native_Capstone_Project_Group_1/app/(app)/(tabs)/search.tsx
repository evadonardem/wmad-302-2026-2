/**
 * Search Screen - Cookbook
 * TODO: Students implement
 * - Search recipes by query (GET /recipes/search?q=)
 * - Filter by category, cuisine, difficulty
 * - Filter by meal type, prep time
 * - Sort by rating, time, calories
 * - Infinite scroll pagination
 */
import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Keyboard,
  StyleSheet,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Title, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from './searchStyles';
import { recipeApi } from '@/services/recipeApi';
import { useDebounce } from '@/hooks';
import { CategoryChip, RecipeListItem, EmptyState } from '@/components/CommonComponents';
import type { Recipe } from '@/types/recipe';
import { colors } from '@/constants/colors';

const PAGE_SIZE = 10;
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

// Shown if the tags request fails
const DEFAULT_CATEGORIES = [
  'Beef', 'Chicken', 'Dessert', 'Lamb', 'Pasta', 'Pork', 'Seafood', 'Vegetarian',
];

// Sort options: label -> comparator (client-side, the API can't sort by these)
const SORTERS: Record<string, (a: Recipe, b: Recipe) => number> = {
  'Top rated': (a, b) => b.rating - a.rating,
  'Quickest': (a, b) =>
    a.prepTimeMinutes + a.cookTimeMinutes - (b.prepTimeMinutes + b.cookTimeMinutes),
  'Fewest calories': (a, b) => a.caloriesPerServing - b.caloriesPerServing,
  'Name A-Z': (a, b) => a.name.localeCompare(b.name),
};
const SORT_OPTIONS = Object.keys(SORTERS);

// Layout helpers for the search bar row
const localStyles = StyleSheet.create({
  searchRow: { flexDirection: 'row', alignItems: 'center' },
  searchField: { flex: 1 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 12,
  },
});

interface FilterRowProps {
  title: string;
  options: string[];
  selected: string | null;
  onSelect: (value: string | null) => void;
  // How many chips to show before the "+N more" button
  maxVisible?: number;
}

// Reusable chip group that wraps onto new lines (tap a selected chip again to clear it)
function FilterRow({ title, options, selected, onSelect, maxVisible = 8 }: FilterRowProps) {
  const [expanded, setExpanded] = useState(false);
  const canCollapse = options.length > maxVisible;

  let visible = options;
  if (canCollapse && !expanded) {
    visible = options.slice(0, maxVisible);
    // Always keep the chosen chip in view
    if (selected && !visible.includes(selected)) {
      visible = [selected, ...visible.slice(0, maxVisible - 1)];
    }
  }

  return (
    <View style={styles.filterSection}>
      <Title style={styles.filterTitle}>{title}</Title>
      <View style={localStyles.chipWrap}>
        {visible.map((item) => (
          <CategoryChip
            key={item}
            label={item}
            selected={selected === item}
            onPress={() => onSelect(selected === item ? null : item)}
          />
        ))}
        {canCollapse && (
          <CategoryChip
            label={expanded ? 'Show less' : `+${options.length - maxVisible} more`}
            onPress={() => setExpanded((value) => !value)}
          />
        )}
      </View>
    </View>
  );
}

export default function SearchScreen() {
  const router = useRouter();
  // Home category chips link here with ?category=<tag>
  const { category } = useLocalSearchParams<{ category?: string }>();

  const [query, setQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [baseResults, setBaseResults] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(category ?? null);
  // Filters are folded away on small screens so the results are visible first
  const [filtersVisible, setFiltersVisible] = useState(Boolean(category));
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [selectedSort, setSelectedSort] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);

  // Debounce typing so we don't hit the API on every keystroke
  const debouncedQuery = useDebounce(query, 400);

  useEffect(() => {
    setActiveQuery(debouncedQuery.trim());
  }, [debouncedQuery]);

  // Open with the category chosen on the Home screen
  useEffect(() => {
    if (category) {
      setSelectedCategory(category);
      setFiltersVisible(true);
    }
  }, [category]);

  // Categories come from the API tag list
  useEffect(() => {
    recipeApi
      .getCategories()
      .then((tags) => {
        if (tags.length > 0) setCategories(tags);
      })
      .catch(() => {
        // Keep the default categories
      });
  }, []);

  // Fetch: GET /recipes/search?q= when there is a query, otherwise all recipes
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = activeQuery
          ? await recipeApi.searchRecipes(activeQuery, { limit: 0 })
          : await recipeApi.getRecipes({ limit: 0 });
        if (!cancelled) setBaseResults(response.recipes);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load recipes');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [activeQuery, reloadKey]);

  // Category/cuisine/difficulty filters + sort run on the fetched list
  const filtered = useMemo(() => {
    const list = baseResults.filter((recipe) => {
      if (
        selectedCategory &&
        !recipe.tags.some((tag) => tag.toLowerCase() === selectedCategory.toLowerCase())
      ) {
        return false;
      }
      if (selectedCuisine && recipe.cuisine !== selectedCuisine) return false;
      if (selectedDifficulty && recipe.difficulty !== selectedDifficulty) return false;
      return true;
    });
    return selectedSort ? list.sort(SORTERS[selectedSort]) : list;
  }, [baseResults, selectedCategory, selectedCuisine, selectedDifficulty, selectedSort]);

  // Back to the first page whenever the results change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [activeQuery, selectedCategory, selectedCuisine, selectedDifficulty, selectedSort]);

  const cuisines = useMemo(() => {
    const unique = new Set(baseResults.map((recipe) => recipe.cuisine));
    if (selectedCuisine) unique.add(selectedCuisine);
    return Array.from(unique).sort();
  }, [baseResults, selectedCuisine]);

  const categoryOptions =
    selectedCategory && !categories.includes(selectedCategory)
      ? [selectedCategory, ...categories]
      : categories;

  const activeFilterCount = [selectedCategory, selectedCuisine, selectedDifficulty, selectedSort].filter(
    Boolean
  ).length;

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedCuisine(null);
    setSelectedDifficulty(null);
    setSelectedSort(null);
  };

  // Search right away (keyboard submit / search button) instead of waiting for the debounce
  const handleSearch = () => {
    setActiveQuery(query.trim());
    Keyboard.dismiss();
  };

  // Infinite scroll: reveal the next page of the filtered results
  const loadMoreResults = () => {
    setVisibleCount((count) => Math.min(count + PAGE_SIZE, filtered.length));
  };

  const renderResult = ({ item }: { item: Recipe }) => (
    <RecipeListItem
      recipe={item}
      onPress={() => router.push(`/(app)/recipe/${item.id}`)}
    />
  );

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={loading ? [] : filtered.slice(0, visibleCount)}
      renderItem={renderResult}
      keyExtractor={(item) => item.id.toString()}
      keyboardShouldPersistTaps="handled"
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      onEndReached={loadMoreResults}
      onEndReachedThreshold={0.5}
      ListHeaderComponent={
        <View>
          {/* Search Bar */}
          <View style={[styles.searchBarContainer, localStyles.searchRow]}>
            <MaterialCommunityIcons name="magnify" size={24} color={colors.textMuted} style={{ marginLeft: 12 }} />
            <TextInput
              style={[styles.searchInput, localStyles.searchField]}
              placeholder="Search recipes..."
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
              autoCorrect={false}
            />
            {query ? (
              <TouchableOpacity onPress={() => setQuery('')} style={styles.clearButton}>
                <MaterialCommunityIcons name="close" size={24} color={colors.textMuted} style={{ marginRight: 12 }} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={handleSearch} disabled={loading} style={styles.searchButton}>
                {loading ? (
                  <ActivityIndicator size="small" color={colors.onPrimary} />
                ) : (
                  <MaterialCommunityIcons name="magnify" size={24} color={colors.onPrimary} />
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* Filters toggle */}
          <View style={localStyles.filterBar}>
            <Button
              mode={filtersVisible ? 'contained-tonal' : 'outlined'}
              icon="tune"
              onPress={() => setFiltersVisible((visible) => !visible)}
              accessibilityLabel="Show or hide filters"
            >
              {activeFilterCount > 0 ? `Filters (${activeFilterCount})` : 'Filters'}
            </Button>
            {activeFilterCount > 0 && (
              <Button mode="text" onPress={clearFilters}>
                Clear all
              </Button>
            )}
          </View>

          {filtersVisible && (
            <View>
              {/* Category Filters */}
              <FilterRow
                title="Categories"
                options={categoryOptions}
                selected={selectedCategory}
                onSelect={setSelectedCategory}
              />

              {/* Cuisine Filters */}
              <FilterRow
                title="Cuisine"
                options={cuisines}
                selected={selectedCuisine}
                onSelect={setSelectedCuisine}
              />

              {/* Difficulty Filters */}
              <FilterRow
                title="Difficulty"
                options={DIFFICULTIES}
                selected={selectedDifficulty}
                onSelect={setSelectedDifficulty}
              />

              {/* Sort Options */}
              <FilterRow
                title="Sort by"
                options={SORT_OPTIONS}
                selected={selectedSort}
                onSelect={setSelectedSort}
              />
            </View>
          )}

          {/* Results */}
          <View style={styles.resultsSection}>
            <Title style={styles.resultsTitle}>
              Results {activeQuery ? `for "${activeQuery}"` : ''} {!loading && filtered.length > 0 && `(${filtered.length})`}
            </Title>
          </View>
        </View>
      }
      ListEmptyComponent={
        loading ? (
          <View style={styles.loadingCenter}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : error ? (
          <EmptyState
            icon="alert-circle-outline"
            title="Something went wrong"
            message={error}
            actionLabel="Retry"
            onAction={() => setReloadKey((key) => key + 1)}
          />
        ) : (
          <EmptyState
            icon="magnify"
            title="No recipes found"
            message="Try a different search term or filter"
          />
        )
      }
    />
  );
}