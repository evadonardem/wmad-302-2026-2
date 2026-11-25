import { act, renderHook, waitFor } from '@testing-library/react-native';
import { useInfiniteScroll } from '@/hooks';

const makePage = (skip: number, limit: number, total: number) => ({
  items: Array.from({ length: Math.min(limit, total - skip) }, (_, i) => skip + i),
  total,
});

describe('useInfiniteScroll', () => {
  it('loads the first page, then appends more until the end', async () => {
    const fetchPage = jest.fn(async (skip: number, limit: number) => makePage(skip, limit, 5));
    const { result } = renderHook(() => useInfiniteScroll<number>(fetchPage, 3));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.items).toEqual([0, 1, 2]);
    expect(result.current.hasMore).toBe(true);

    await act(async () => {
      result.current.loadMore();
    });
    await waitFor(() => expect(result.current.items).toEqual([0, 1, 2, 3, 4]));
    expect(result.current.hasMore).toBe(false);
    expect(fetchPage).toHaveBeenLastCalledWith(3, 3);
  });

  it('exposes an error and can retry', async () => {
    const fetchPage = jest
      .fn<Promise<{ items: number[]; total: number }>, [number, number]>()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce({ items: [1], total: 1 });
    const { result } = renderHook(() => useInfiniteScroll<number>(fetchPage, 3));

    await waitFor(() => expect(result.current.error).toBe('offline'));
    expect(result.current.items).toEqual([]);

    await act(async () => {
      result.current.retry();
    });
    await waitFor(() => expect(result.current.items).toEqual([1]));
    expect(result.current.error).toBeNull();
  });
});
