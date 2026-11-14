/**
 * Search Screen - Cookbook
 *
 * - Search recipes by query      GET /recipes/search?q=
 * - Filter by category (tag)     GET /recipes/tag/{tag}
 * - Sort by rating, prep time, calories
 * - Infinite scroll pagination (limit/skip), plus a "Load more" button
 *
 * With nothing typed or selected, it lists all recipes so the screen is never empty.
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  StyleSheet,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Card, Title, Chip, TextInput, Button } from 'react-native-paper';
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
  caloriesPerServing?: number;
}

type SortKey = 'default' | 'rating' | 'time' | 'calories';

const BASE_URL = 'https://dummyjson.com';
const PAGE_SIZE = 10;

const CATEGORIES = [
  'Beef', 'Chicken', 'Dessert', 'Lamb', 'Pasta', 'Pork', 'Seafood', 'Vegetarian',
];

const SORTS: { key: SortKey; label: string; field?: string; order?: 'asc' | 'desc' }[] = [
  { key: 'default', label: 'Default' },
  { key: 'rating', label: 'Top rated', field: 'rating', order: 'desc' },
  { key: 'time', label: 'Shortest prep', field: 'prepTimeMinutes', order: 'asc' },
  { key: 'calories', label: 'Lowest calories', field: 'caloriesPerServing', order: 'asc' },
];

/**
 * Fetch one page of results.
 * - Category selected: the API can't combine tag + text search, so we load the
 *   tag's recipes (a small set), filter by the query and sort here, then slice.
 * - Otherwise: the API does the searching, sorting and paging.
 */
async function fetchPage(opts: {
  query: string;
  category: string | null;
  sort: SortKey;
  skip: number;
}): Promise<{ items: Recipe[]; total: number }> {
  const { query, category, sort, skip } = opts;
  const q = query.trim();
  const sortCfg = SORTS.find((s) => s.key === sort)!;

  if (category) {
    const res = await fetch(`${BASE_URL}/recipes/tag/${encodeURIComponent(category)}?limit=0`);
    if (!res.ok) throw new Error(`Request failed (${res.status})`);
    const data = await res.json();
    let all: Recipe[] = data.recipes ?? [];

    if (q) {
      const lower = q.toLowerCase();
      all = all.filter((r) => r.name.toLowerCase().includes(lower));
    }
    if (sortCfg.field) {
      const field = sortCfg.field;
      const dir = sortCfg.order === 'desc' ? -1 : 1;
      all = [...all].sort((a, b) => {
        const av = (a as unknown as Record<string, number>)[field] ?? 0;
        const bv = (b as unknown as Record<string, number>)[field] ?? 0;
        return (av - bv) * dir;
      });
    }
    return { items: all.slice(skip, skip + PAGE_SIZE), total: all.length };
  }

  const params = new URLSearchParams({ limit: String(PAGE_SIZE), skip: String(skip) });
  if (q) params.set('q', q);
  if (sortCfg.field) {
    params.set('sortBy', sortCfg.field);
    params.set('order', sortCfg.order ?? 'asc');
  }
  const path = q ? '/recipes/search' : '/recipes';
  const res = await fetch(`${BASE_URL}${path}?${params.toString()}`);
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  const data = await res.json();
  return { items: data.recipes ?? [], total: data.total ?? 0 };
}

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [sort, setSort] = useState<SortKey>('default');

  const [results, setResults] = useState<Recipe[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const requestId = useRef(0); // ignores responses from outdated requests
  const loadingMoreRef = useRef(false);

  // New search whenever the query, category or sort changes (typing is debounced)
  useEffect(() => {
    const id = ++requestId.current;
    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const { items, total: t } = await fetchPage({ query, category, sort, skip: 0 });
        if (id !== requestId.current) return;
        setResults(items);
        setTotal(t);
      } catch (e) {
        if (id !== requestId.current) return;
        setResults([]);
        setTotal(0);
        setError(e instanceof Error ? e.message : 'Something went wrong');
      } finally {
        if (id === requestId.current) setLoading(false);
      }
    }, query ? 350 : 0);

    return () => clearTimeout(timer);
  }, [query, category, sort, retryCount]);

  const hasMore = results.length < total;

  const loadMore = async () => {
    if (loadingMoreRef.current || loading || !hasMore) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    const id = requestId.current;
    try {
      const { items, total: t } = await fetchPage({
        query,
        category,
        sort,
        skip: results.length,
      });
      if (id !== requestId.current) return;
      setResults((prev) => {
        const seen = new Set(prev.map((r) => r.id));
        return [...prev, ...items.filter((r) => !seen.has(r.id))];
      });
      setTotal(t);
    } catch (e) {
      if (id === requestId.current) {
        setError(e instanceof Error ? e.message : 'Could not load more');
      }
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  };

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - 300) {
      loadMore();
    }
  };

  const renderResult = (item: Recipe) => (
    <TouchableOpacity
      style={styles.resultCard}
      onPress={() => router.push(`/recipe/${item.id}` as any)}
    >
      <Card style={styles.card} elevation={1}>
        <View style={styles.resultContent}>
          <Image source={{ uri: item.image }} style={styles.resultImage} resizeMode="cover" />
          <View style={styles.resultInfo}>
            <Title style={styles.resultTitle} numberOfLines={1}>{item.name}</Title>
            <View style={styles.resultMeta}>
              <Chip style={styles.difficultyChip}>{item.difficulty}</Chip>
              <Chip style={styles.cuisineChip}>{item.cuisine}</Chip>
            </View>
            <Text style={styles.resultDetails}>
              ⏱️ {item.prepTimeMinutes + item.cookTimeMinutes}min · 👥 {item.servings} · ⭐ {item.rating}
              {item.caloriesPerServing != null ? ` · 🔥 ${item.caloriesPerServing}` : ''}
            </Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  const heading = `${query.trim() ? `Results for "${query.trim()}"` : 'Recipes'}${
    category ? ` in ${category}` : ''
  }${!loading && !error ? ` (${total})` : ''}`;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      onScroll={handleScroll}
      scrollEventThrottle={200}
    >
      {/* Search Bar */}
      <View style={styles.searchBarContainer}>
        <TextInput
          mode="outlined"
          style={styles.searchInput}
          placeholder="Search recipes..."
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          autoCorrect={false}
          left={<TextInput.Icon icon="magnify" />}
          right={query ? <TextInput.Icon icon="close" onPress={() => setQuery('')} /> : undefined}
        />
      </View>

      {/* Category Filters */}
      <View style={styles.filterSection}>
        <Title style={styles.filterTitle}>Categories</Title>
        <FlatList
          data={CATEGORIES}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.filterChip, category === item && styles.filterChipSelected]}
              onPress={() => setCategory(category === item ? null : item)}
            >
              <Text
                style={[styles.filterChipText, category === item && styles.filterChipTextSelected]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item}
        />
      </View>

      {/* Sort Options */}
      <View style={styles.filterSection}>
        <Title style={styles.filterTitle}>Sort by</Title>
        <FlatList
          data={SORTS}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.filterChip, sort === item.key && styles.filterChipSelected]}
              onPress={() => setSort(item.key)}
            >
              <Text
                style={[styles.filterChipText, sort === item.key && styles.filterChipTextSelected]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.key}
        />
      </View>

      {/* Results */}
      <View style={styles.resultsSection}>
        <Title style={styles.resultsTitle}>{heading}</Title>

        {loading ? (
          <View style={styles.loadingCenter}>
            <ActivityIndicator size="large" color="#E85D04" />
          </View>
        ) : error ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="alert-circle-outline" size={64} color="#BCAAA4" />
            <Text style={styles.emptyText}>Couldn't load recipes</Text>
            <Text style={styles.emptySubtext}>{error}</Text>
            <Button
              mode="contained"
              onPress={() => setRetryCount((c) => c + 1)}
              style={local.retry}
            >
              Try again
            </Button>
          </View>
        ) : results.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="magnify" size={64} color="#BCAAA4" />
            <Text style={styles.emptyText}>No recipes found</Text>
            <Text style={styles.emptySubtext}>Try a different search term or category</Text>
          </View>
        ) : (
          // Rendered with map (not FlatList) because this is already inside a ScrollView
          <View style={styles.resultsList}>
            {results.map((item) => (
              <View key={item.id}>
                {renderResult(item)}
                <View style={styles.separator} />
              </View>
            ))}

            {loadingMore && (
              <View style={local.footer}>
                <ActivityIndicator size="small" color="#E85D04" />
              </View>
            )}
            {hasMore && !loadingMore && (
              <Button mode="outlined" onPress={loadMore} style={local.loadMore}>
                Load more
              </Button>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const local = StyleSheet.create({
  footer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  loadMore: {
    marginVertical: 16,
    alignSelf: 'center',
  },
  retry: {
    marginTop: 16,
  },
});