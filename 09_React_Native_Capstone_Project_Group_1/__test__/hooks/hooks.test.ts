/**
 * Unit tests - custom hooks
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import {
  useDebounce,
  useInfiniteScroll,
  useAsyncStorage,
  useNetworkStatus,
  useAuthPersistence,
} from '@/hooks';
import { useAuth } from '@/context/AuthContext';
import { sampleUser } from '../../test-utils/fixtures';

// Hooks only need the useAuth hook, not the real provider/API client
jest.mock('@/context/AuthContext', () => ({ useAuth: jest.fn() }));

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('useDebounce', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('returns the first value immediately', () => {
    const { result } = renderHook(() => useDebounce('a', 300));
    expect(result.current).toBe('a');
  });

  it('only updates after the delay has passed', () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: string }) => useDebounce(value, 300),
      { initialProps: { value: 'a' } }
    );

    rerender({ value: 'ab' });
    act(() => {
      jest.advanceTimersByTime(299);
    });
    expect(result.current).toBe('a');

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(result.current).toBe('ab');
  });

  it('restarts the wait when the value changes again', () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: string }) => useDebounce(value, 300),
      { initialProps: { value: 'a' } }
    );

    rerender({ value: 'ab' });
    act(() => {
      jest.advanceTimersByTime(200);
    });
    rerender({ value: 'abc' });
    act(() => {
      jest.advanceTimersByTime(200);
    });
    expect(result.current).toBe('a');

    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(result.current).toBe('abc');
  });
});

describe('useInfiniteScroll', () => {
  const pages: Record<number, { data: number[]; hasMore: boolean }> = {
    0: { data: [1, 2], hasMore: true },
    1: { data: [3, 4], hasMore: true },
    2: { data: [5], hasMore: false },
  };

  it('refresh loads the first page', async () => {
    const fetchFn = jest.fn(async (page: number) => pages[page]);
    const { result } = renderHook(() => useInfiniteScroll<number>(fetchFn, 2));

    await act(async () => {
      await result.current.refresh();
    });

    expect(fetchFn).toHaveBeenCalledWith(0, 2);
    expect(result.current.data).toEqual([1, 2]);
    expect(result.current.hasMore).toBe(true);
    expect(result.current.loading).toBe(false);
  });

  it('loadMore appends the next pages until there is no more', async () => {
    const fetchFn = jest.fn(async (page: number) => pages[page]);
    const { result } = renderHook(() => useInfiniteScroll<number>(fetchFn, 2));

    await act(async () => {
      await result.current.refresh();
    });
    await act(async () => {
      await result.current.loadMore();
    });
    expect(result.current.data).toEqual([1, 2, 3, 4]);

    await act(async () => {
      await result.current.loadMore();
    });
    expect(result.current.data).toEqual([1, 2, 3, 4, 5]);
    expect(result.current.hasMore).toBe(false);

    // Nothing left: no extra request
    await act(async () => {
      await result.current.loadMore();
    });
    expect(fetchFn).toHaveBeenCalledTimes(3);
  });

  it('refresh starts over from the first page', async () => {
    const fetchFn = jest.fn(async (page: number) => pages[page]);
    const { result } = renderHook(() => useInfiniteScroll<number>(fetchFn, 2));

    await act(async () => {
      await result.current.refresh();
    });
    await act(async () => {
      await result.current.loadMore();
    });
    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.data).toEqual([1, 2]);
    expect(fetchFn).toHaveBeenLastCalledWith(0, 2);
  });

  it('keeps the data and reports the error when loading more fails', async () => {
    const fetchFn = jest
      .fn<Promise<{ data: number[]; hasMore: boolean }>, [number, number]>()
      .mockResolvedValueOnce(pages[0])
      .mockRejectedValueOnce(new Error('Network down'));
    const { result } = renderHook(() => useInfiniteScroll<number>(fetchFn, 2));

    await act(async () => {
      await result.current.refresh();
    });
    await act(async () => {
      await result.current.loadMore();
    });

    expect(result.current.data).toEqual([1, 2]);
    expect(result.current.error).toBe('Network down');
    expect(result.current.loading).toBe(false);
  });

  it('uses a default message when the failure is not an Error', async () => {
    const fetchFn = jest.fn().mockRejectedValue('nope');
    const { result } = renderHook(() => useInfiniteScroll<number>(fetchFn, 2));

    await act(async () => {
      await result.current.refresh();
    });
    expect(result.current.error).toBe('Failed to load');

    await act(async () => {
      await result.current.loadMore();
    });
    expect(result.current.error).toBe('Failed to load more');
  });
});

describe('useAsyncStorage', () => {
  it('starts with the initial value and then loads the saved one', async () => {
    await AsyncStorage.setItem('user_settings', JSON.stringify({ notifications: false }));
    const { result } = renderHook(() => useAsyncStorage('user_settings', { notifications: true }));

    expect(result.current[0]).toEqual({ notifications: true });
    await waitFor(() => expect(result.current[2]).toBe(false));
    expect(result.current[0]).toEqual({ notifications: false });
  });

  it('keeps the initial value when nothing is saved', async () => {
    const { result } = renderHook(() => useAsyncStorage('user_settings', { notifications: true }));
    await waitFor(() => expect(result.current[2]).toBe(false));
    expect(result.current[0]).toEqual({ notifications: true });
  });

  it('saves updates (value or updater function)', async () => {
    const { result } = renderHook(() => useAsyncStorage('user_settings', { count: 0 }));
    await waitFor(() => expect(result.current[2]).toBe(false));

    await act(async () => {
      await result.current[1]({ count: 1 });
    });
    expect(result.current[0]).toEqual({ count: 1 });
    expect(JSON.parse((await AsyncStorage.getItem('user_settings')) ?? 'null')).toEqual({ count: 1 });

    await act(async () => {
      await result.current[1]((prev) => ({ count: prev.count + 1 }));
    });
    expect(result.current[0]).toEqual({ count: 2 });
  });
});

describe('useNetworkStatus', () => {
  it('reports online when there are no browser events (native)', () => {
    const { result } = renderHook(() => useNetworkStatus());
    expect(result.current).toBe(true);
  });
});

describe('useAuthPersistence', () => {
  it('exposes the auth state once storage has been checked', async () => {
    const login = jest.fn();
    const logout = jest.fn();
    const refreshUser = jest.fn();
    (useAuth as jest.Mock).mockReturnValue({
      user: sampleUser,
      isAuthenticated: true,
      isLoading: false,
      login,
      logout,
      refreshUser,
    });

    const { result } = renderHook(() => useAuthPersistence());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.user).toEqual(sampleUser);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.login).toBe(login);
    expect(result.current.logout).toBe(logout);
  });
});