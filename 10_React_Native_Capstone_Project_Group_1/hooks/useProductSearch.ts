/**
 * useProductSearch - search + filter + sort + paginate products.
 *
 * The server handles only the text query (GET /products/search, or GET /products
 * when empty; limit=0 returns every match). Category, brand, price range and
 * sorting are applied client-side (see utils/productFilters), so changing the
 * category is instant and does not depend on the category endpoint. Results are
 * revealed `pageSize` at a time for infinite scrolling.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { productApi } from '@/services/productApi';
import { ProductSummary } from '@/types/product';
import { ProductFilters, applyFilters, extractBrands, filterProducts } from '@/utils/productFilters';
import { getErrorMessage } from '@/utils/errors';

export function useProductSearch(query: string, filters: ProductFilters, pageSize = 20) {
  const [source, setSource] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const [reloadKey, setReloadKey] = useState(0);

  const trimmedQuery = query.trim();

  // Fetch the candidate set whenever the query or category changes
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const request = trimmedQuery
      ? productApi.searchProductSummaries(trimmedQuery, { limit: 0 })
      : productApi.getProductSummaries({ limit: 0 });

    request
      .then((response) => {
        if (!cancelled) setSource(response.products);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setSource([]);
          setError(getErrorMessage(err, 'Failed to load products'));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [trimmedQuery, reloadKey]);

  const filtered = useMemo(() => applyFilters(source, filters), [source, filters]);
  // Brand options reflect the selected category only (not the other filters)
  const brands = useMemo(
    () =>
      extractBrands(
        filterProducts(source, { ...filters, brand: null, minPrice: null, maxPrice: null })
      ),
    [source, filters]
  );

  // Start from the first page again whenever the result set changes
  useEffect(() => {
    setVisibleCount(pageSize);
  }, [filtered, pageSize]);

  const loadMore = useCallback(() => {
    setVisibleCount((count) => Math.min(count + pageSize, filtered.length));
  }, [filtered.length, pageSize]);

  const retry = useCallback(() => setReloadKey((key) => key + 1), []);

  return {
    products: filtered.slice(0, visibleCount),
    total: filtered.length,
    brands,
    loading,
    error,
    hasMore: visibleCount < filtered.length,
    loadMore,
    retry,
  };
}