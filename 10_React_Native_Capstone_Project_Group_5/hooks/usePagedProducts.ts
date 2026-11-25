import { useCallback, useEffect, useRef, useState } from 'react';
import { productApi } from '@/services/productApi';
import { Product } from '@/types/product';

interface UsePagedProductsOptions {
  query?: string;
  category?: string;
  enabled?: boolean;
  pageSize?: number;
}

export function usePagedProducts({
  query = '',
  category,
  enabled = true,
  pageSize = 30,
}: UsePagedProductsOptions = {}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
  const requestIdRef = useRef(0);
  const nextSkipRef = useRef(0);
  const loadingMoreRef = useRef(false);

  const loadPage = useCallback(async (
    skip: number,
    append: boolean,
    requestId: number
  ) => {
    if (append) {
      loadingMoreRef.current = true;
      setLoadingMore(true);
      setLoadMoreError(null);
    }

    try {
      const response = category
        ? await productApi.getProductsByCategory(category, { limit: pageSize, skip })
        : query.trim()
          ? await productApi.searchProducts(query.trim(), { limit: pageSize, skip })
          : await productApi.getProducts({ limit: pageSize, skip });

      if (requestId !== requestIdRef.current) return;

      const searchTerm = query.trim().toLowerCase();
      const matchingProducts = response.products.filter((product) =>
        !searchTerm ||
        [product.title, product.description, product.brand ?? '']
          .some((value) => value.toLowerCase().includes(searchTerm))
      );

      setProducts((current) => {
        const existing = append ? current : [];
        const existingIds = new Set(existing.map((product) => product.id));
        return [
          ...existing,
          ...matchingProducts.filter((product) => !existingIds.has(product.id)),
        ];
      });
      nextSkipRef.current = response.skip + response.products.length;
      setHasMore(nextSkipRef.current < response.total);
    } catch (requestError) {
      if (requestId === requestIdRef.current) {
        const message = requestError instanceof Error
          ? requestError.message
          : 'Unable to load products.';
        if (append) setLoadMoreError(message);
        else setError(message);
      }
    } finally {
      if (requestId === requestIdRef.current) {
        if (append) {
          loadingMoreRef.current = false;
          setLoadingMore(false);
        } else {
          setLoading(false);
          setRefreshing(false);
        }
      }
    }
  }, [category, pageSize, query]);

  const refresh = useCallback(async (isPullToRefresh = false) => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    nextSkipRef.current = 0;
    loadingMoreRef.current = false;
    setLoadingMore(false);
    if (!isPullToRefresh) setProducts([]);
    setHasMore(false);
    setError(null);
    setLoadMoreError(null);
    setLoading(!isPullToRefresh);
    setRefreshing(isPullToRefresh);

    if (!enabled) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    await loadPage(0, false, requestId);
  }, [enabled, loadPage]);

  const loadMore = useCallback(async () => {
    if (!enabled || !hasMore || loadMoreError || loadingMoreRef.current || loadingMore) return;
    await loadPage(nextSkipRef.current, true, requestIdRef.current);
  }, [enabled, hasMore, loadMoreError, loadPage, loadingMore]);

  const retryLoadMore = useCallback(async () => {
    if (!loadMoreError || loadingMoreRef.current || loadingMore) return;
    await loadPage(nextSkipRef.current, true, requestIdRef.current);
  }, [loadMoreError, loadPage, loadingMore]);

  useEffect(() => {
    void refresh();
    return () => {
      requestIdRef.current += 1;
    };
  }, [refresh]);

  return {
    products,
    loading,
    refreshing,
    loadingMore,
    hasMore,
    error,
    loadMoreError,
    refresh,
    loadMore,
    retryLoadMore,
  };
}
