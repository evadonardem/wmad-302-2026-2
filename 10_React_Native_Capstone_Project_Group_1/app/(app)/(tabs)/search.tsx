/**
 * Search Screen
 * - debounced text search (GET /products/search?q=)
 * - category / brand / price-range filters in a bottom sheet
 * - sort options, infinite scroll, skeletons, empty + error states
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Badge, Button, HelperText, IconButton, Modal, Portal, Searchbar, Snackbar, TextInput, useTheme } from 'react-native-paper';
import { useCart } from '@/context/CartContext';
import { useDebounce } from '@/hooks';
import { useProductGrid } from '@/hooks/useProductGrid';
import { useProductSearch } from '@/hooks/useProductSearch';
import { productApi } from '@/services/productApi';
import { Category, ProductSummary, SortOption } from '@/types/product';
import {
  CategoryChip,
  EmptyState,
  ErrorState,
  ProductCard,
  ProductCardSkeleton,
} from '@/components/CommonComponents';
import { MAX_CONTENT_WIDTH, spacing } from '@/constants/layout';
import {
  DEFAULT_FILTERS,
  ProductFilters,
  countActiveFilters,
  parsePriceInput,
} from '@/utils/productFilters';
import { formatCategoryName } from '@/utils/pricing';

const SORT_OPTIONS: Array<{ value: SortOption; label: string }> = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'discount', label: 'Biggest Discount' },
  { value: 'newest', label: 'Newest' },
];

const isSortOption = (value: string | undefined): value is SortOption =>
  SORT_OPTIONS.some((option) => option.value === value);

export default function SearchScreen() {
  const router = useRouter();
  const theme = useTheme();
  const params = useLocalSearchParams<{ category?: string; sort?: string; q?: string; ts?: string }>();
  const { addProduct } = useCart();
  const { numColumns, cardWidth, gap, horizontalPadding } = useProductGrid();

  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 400);
  const [filters, setFilters] = useState<ProductFilters>(DEFAULT_FILTERS);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<string | null>(null);

  // Draft values edited inside the filter sheet (applied with the Apply button)
  const [draft, setDraft] = useState<ProductFilters>(DEFAULT_FILTERS);
  const [minText, setMinText] = useState('');
  const [maxText, setMaxText] = useState('');

  const { products, total, brands, loading, error, hasMore, loadMore, retry } = useProductSearch(
    debouncedQuery,
    filters
  );

  // Apply filters passed from other screens (Categories, Home). `ts` changes on every
  // tap, so tapping the same category again still re-applies it.
  useEffect(() => {
    if (!params.ts) return;
    setFilters({
      ...DEFAULT_FILTERS,
      category: params.category ?? null,
      sort: isSortOption(params.sort) ? params.sort : DEFAULT_FILTERS.sort,
    });
    setQuery(params.q ?? '');
  }, [params.ts, params.category, params.sort, params.q]);

  useEffect(() => {
    productApi
      .getCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  const activeFilterCount = countActiveFilters(filters);
  const hasSearchState = query.trim().length > 0 || activeFilterCount > 0;

  const openFilters = () => {
    setDraft(filters);
    setMinText(filters.minPrice !== null ? String(filters.minPrice) : '');
    setMaxText(filters.maxPrice !== null ? String(filters.maxPrice) : '');
    setFiltersOpen(true);
  };

  const minValue = parsePriceInput(minText);
  const maxValue = parsePriceInput(maxText);
  const priceError =
    (minText.trim() !== '' && minValue === null) || (maxText.trim() !== '' && maxValue === null)
      ? 'Enter valid prices'
      : minValue !== null && maxValue !== null && minValue > maxValue
        ? 'Minimum price must be lower than maximum'
        : null;

  const applyFilters = () => {
    if (priceError) return;
    setFilters({ ...draft, minPrice: minValue, maxPrice: maxValue, sort: filters.sort });
    setFiltersOpen(false);
  };

  const resetAll = useCallback(() => {
    setQuery('');
    setFilters((prev) => ({ ...DEFAULT_FILTERS, sort: prev.sort }));
  }, []);

  const handleAdd = (product: ProductSummary) => {
    addProduct(product, 1);
    setSnackbar(`${product.title} added to cart`);
  };

  const categoryName = useMemo(
    () => categories.find((c) => c.slug === filters.category)?.name ?? (filters.category ? formatCategoryName(filters.category) : ''),
    [categories, filters.category]
  );

  const activeChips: Array<{ key: string; label: string; onClear: () => void }> = [];
  if (filters.category) {
    activeChips.push({ key: 'category', label: categoryName, onClear: () => setFilters((f) => ({ ...f, category: null })) });
  }
  if (filters.brand) {
    activeChips.push({ key: 'brand', label: filters.brand, onClear: () => setFilters((f) => ({ ...f, brand: null })) });
  }
  if (filters.minPrice !== null || filters.maxPrice !== null) {
    activeChips.push({
      key: 'price',
      label: `$${filters.minPrice ?? 0} - ${filters.maxPrice !== null ? `$${filters.maxPrice}` : 'any'}`,
      onClear: () => setFilters((f) => ({ ...f, minPrice: null, maxPrice: null })),
    });
  }

  const listHeader = (
    <View>
      <FlatList
        data={SORT_OPTIONS}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.value}
        contentContainerStyle={styles.chipRow}
        renderItem={({ item }) => (
          <CategoryChip
            label={item.label}
            selected={filters.sort === item.value}
            onPress={() => setFilters((f) => ({ ...f, sort: item.value }))}
          />
        )}
      />
      {activeChips.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {activeChips.map((chip) => (
            <CategoryChip key={chip.key} label={`${chip.label}  ✕`} selected onPress={chip.onClear} />
          ))}
        </ScrollView>
      )}
      <Text style={[styles.resultCount, { color: theme.colors.onSurfaceVariant }]}>
        {loading ? 'Searching...' : `${total} ${total === 1 ? 'result' : 'results'}`}
        {debouncedQuery.trim() ? ` for "${debouncedQuery.trim()}"` : ''}
      </Text>
    </View>
  );

  let body: React.ReactNode;
  if (loading) {
    body = (
      <View>
        {listHeader}
        <View style={[styles.skeletonGrid, { paddingHorizontal: horizontalPadding, gap }]}>
          {Array.from({ length: numColumns * 2 }).map((_, i) => (
            <ProductCardSkeleton key={i} width={cardWidth} />
          ))}
        </View>
      </View>
    );
  } else if (error) {
    body = <ErrorState message={error} onRetry={retry} />;
  } else {
    body = (
      <FlatList
        key={numColumns}
        data={products}
        numColumns={numColumns}
        keyExtractor={(item) => String(item.id)}
        ListHeaderComponent={listHeader}
        columnWrapperStyle={numColumns > 1 ? { gap, paddingHorizontal: horizontalPadding } : undefined}
        ItemSeparatorComponent={() => <View style={{ height: gap }} />}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            width={cardWidth}
            onPress={() => router.push(`/(app)/product/${item.id}`)}
            onAddToCart={() => handleAdd(item)}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="magnify"
            title="No products found"
            message="Try a different search term or remove some filters."
            actionLabel={hasSearchState ? 'Clear search & filters' : undefined}
            onAction={hasSearchState ? resetAll : undefined}
          />
        }
        onEndReached={hasMore ? loadMore : undefined}
        onEndReachedThreshold={0.5}
        ListFooterComponent={<View style={styles.footer} />}
      />
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.searchRow}>
        <Searchbar
          style={styles.searchbar}
          placeholder="Search products..."
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          autoCapitalize="none"
          accessibilityLabel="Search products"
        />
        <View>
          <IconButton
            icon="tune-variant"
            mode="contained-tonal"
            size={24}
            onPress={openFilters}
            accessibilityLabel="Open filters"
          />
          {activeFilterCount > 0 && <Badge style={styles.filterBadge}>{activeFilterCount}</Badge>}
        </View>
      </View>

      {body}

      <Portal>
        <Modal
          visible={filtersOpen}
          onDismiss={() => setFiltersOpen(false)}
          contentContainerStyle={[styles.sheet, { backgroundColor: theme.colors.surface }]}
        >
          <ScrollView keyboardShouldPersistTaps="handled">
            <Text style={[styles.sheetTitle, { color: theme.colors.onSurface }]}>Filters</Text>

            <Text style={[styles.sheetLabel, { color: theme.colors.onSurface }]}>Category</Text>
            <View style={styles.wrap}>
              {categories.map((c) => (
                <CategoryChip
                  key={c.slug}
                  label={c.name}
                  selected={draft.category === c.slug}
                  onPress={() => setDraft((d) => ({ ...d, category: d.category === c.slug ? null : c.slug }))}
                  style={styles.wrapChip}
                />
              ))}
            </View>

            {brands.length > 0 && (
              <>
                <Text style={[styles.sheetLabel, { color: theme.colors.onSurface }]}>Brand</Text>
                <View style={styles.wrap}>
                  {brands.map((b) => (
                    <CategoryChip
                      key={b}
                      label={b}
                      selected={draft.brand === b}
                      onPress={() => setDraft((d) => ({ ...d, brand: d.brand === b ? null : b }))}
                      style={styles.wrapChip}
                    />
                  ))}
                </View>
              </>
            )}

            <Text style={[styles.sheetLabel, { color: theme.colors.onSurface }]}>Price range ($)</Text>
            <View style={styles.priceRow}>
              <TextInput
                mode="outlined"
                label="Min"
                value={minText}
                onChangeText={setMinText}
                keyboardType="decimal-pad"
                style={styles.priceInput}
              />
              <Text style={{ color: theme.colors.onSurfaceVariant }}>to</Text>
              <TextInput
                mode="outlined"
                label="Max"
                value={maxText}
                onChangeText={setMaxText}
                keyboardType="decimal-pad"
                style={styles.priceInput}
              />
            </View>
            <HelperText type="error" visible={priceError !== null}>
              {priceError ?? ''}
            </HelperText>

            <View style={styles.sheetActions}>
              <Button
                mode="outlined"
                onPress={() => {
                  setDraft({ ...DEFAULT_FILTERS, sort: filters.sort });
                  setMinText('');
                  setMaxText('');
                }}
                style={styles.sheetButton}
              >
                Reset
              </Button>
              <Button mode="contained" onPress={applyFilters} disabled={priceError !== null} style={styles.sheetButton}>
                Apply
              </Button>
            </View>
          </ScrollView>
        </Modal>
      </Portal>

      <Snackbar
        visible={snackbar !== null}
        onDismiss={() => setSnackbar(null)}
        duration={2000}
        action={{ label: 'View cart', onPress: () => router.push('/(app)/(tabs)/cart') }}
      >
        {snackbar ?? ''}
      </Snackbar>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: spacing.md,
    paddingRight: spacing.xs,
    paddingTop: spacing.md,
    maxWidth: MAX_CONTENT_WIDTH,
    width: '100%',
    alignSelf: 'center',
  },
  searchbar: { flex: 1, elevation: 1 },
  filterBadge: { position: 'absolute', top: 4, right: 4 },
  chipRow: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  resultCount: { paddingHorizontal: spacing.md, marginBottom: spacing.sm, fontSize: 13 },
  listContent: { paddingBottom: spacing.lg, maxWidth: MAX_CONTENT_WIDTH, width: '100%', alignSelf: 'center' },
  skeletonGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  footer: { height: spacing.xl },
  sheet: { margin: spacing.lg, padding: spacing.lg, borderRadius: 16, maxHeight: '85%' },
  sheetTitle: { fontSize: 20, fontWeight: '700', marginBottom: spacing.sm },
  sheetLabel: { fontSize: 15, fontWeight: '600', marginTop: spacing.md, marginBottom: spacing.sm },
  wrap: { flexDirection: 'row', flexWrap: 'wrap' },
  wrapChip: { marginBottom: spacing.sm },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  priceInput: { flex: 1 },
  sheetActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
  sheetButton: { flex: 1 },
});