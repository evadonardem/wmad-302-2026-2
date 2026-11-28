import { act, renderHook, waitFor } from '@testing-library/react-native';
import { useInfiniteScroll } from '@/hooks';

const makeFetch = (totalPages: number) =>
  jest.fn(async (page: number, limit: number) => ({
    data: Array.from({ length: limit }, (_, i) => page * limit + i),
    hasMore: page + 1 < totalPages,
  }));

describe('useInfiniteScroll', () => {
  it('loads the first page on mount', async () => {
    const fetchFn = makeFetch(2);
    const { result } = renderHook(() => useInfiniteScroll(fetchFn, 3));

    expect(result.current.initialLoading).toBe(true);
    await waitFor(() => expect(result.current.initialLoading).toBe(false));

    expect(fetchFn).toHaveBeenCalledWith(0, 3);
    expect(result.current.data).toEqual([0, 1, 2]);
    expect(result.current.hasMore).toBe(true);
  });

  it('appends the next page and stops when there is no more', async () => {
    const fetchFn = makeFetch(2);
    const { result } = renderHook(() => useInfiniteScroll(fetchFn, 3));
    await waitFor(() => expect(result.current.initialLoading).toBe(false));

    await act(async () => {
      await result.current.loadMore();
    });
    expect(result.current.data).toEqual([0, 1, 2, 3, 4, 5]);
    expect(result.current.hasMore).toBe(false);

    await act(async () => {
      await result.current.loadMore();
    });
    expect(fetchFn).toHaveBeenCalledTimes(2); // no extra request
  });

  it('refresh starts over from page 0', async () => {
    const fetchFn = makeFetch(3);
    const { result } = renderHook(() => useInfiniteScroll(fetchFn, 2));
    await waitFor(() => expect(result.current.initialLoading).toBe(false));
    await act(async () => {
      await result.current.loadMore();
    });
    expect(result.current.data).toHaveLength(4);

    await act(async () => {
      await result.current.refresh();
    });
    expect(result.current.data).toEqual([0, 1]);
    expect(result.current.refreshing).toBe(false);
  });

  it('exposes errors and can retry', async () => {
    const fetchFn = jest
      .fn<Promise<{ data: number[]; hasMore: boolean }>, [number, number]>()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValue({ data: [1], hasMore: false });

    const { result } = renderHook(() => useInfiniteScroll(fetchFn, 1));
    await waitFor(() => expect(result.current.error).toBe('offline'));
    expect(result.current.data).toEqual([]);

    await act(async () => {
      await result.current.retry();
    });
    expect(result.current.error).toBeNull();
    expect(result.current.data).toEqual([1]);
  });
});
