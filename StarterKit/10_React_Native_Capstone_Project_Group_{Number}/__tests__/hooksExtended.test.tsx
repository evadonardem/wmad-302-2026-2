import { act, renderHook, waitFor } from '@testing-library/react-native';
import {
  useAuthPersistence,
  useAsyncStorage,
  useInfiniteScroll,
  useNetworkStatus,
} from '@/hooks';
import { useAuth } from '@/context/AuthContext';
import {
  authStorage,
  getStorageItem,
  setStorageItem,
} from '@/utils/storage';

jest.mock('@/context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/utils/storage', () => ({
  authStorage: {
    getUser: jest.fn(),
  },
  getStorageItem: jest.fn(),
  setStorageItem: jest.fn(),
}));

const mockedUseAuth = useAuth as jest.Mock;
const mockedGetUser = authStorage.getUser as jest.Mock;
const mockedGetStorageItem = getStorageItem as jest.Mock;
const mockedSetStorageItem = setStorageItem as jest.Mock;

describe('useAuthPersistence', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockedUseAuth.mockReturnValue({
      user: { id: 1, username: 'emilys' },
      isAuthenticated: true,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
      refreshUser: jest.fn(),
    });

    mockedGetUser.mockResolvedValue(null);
  });

  it('returns authentication state and methods', async () => {
    const { result } = renderHook(() => useAuthPersistence());

    expect(result.current.user).toEqual({
      id: 1,
      username: 'emilys',
    });
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockedGetUser).toHaveBeenCalled();
    expect(typeof result.current.login).toBe('function');
    expect(typeof result.current.logout).toBe('function');
    expect(typeof result.current.refreshUser).toBe('function');
  });

  it('checks the stored user during hydration', async () => {
    mockedGetUser.mockResolvedValue({
      id: 1,
      username: 'emilys',
    });

    const { result } = renderHook(() => useAuthPersistence());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockedGetUser).toHaveBeenCalled();
  });

  it('keeps loading true while AuthContext is loading', async () => {
    mockedUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      login: jest.fn(),
      logout: jest.fn(),
      refreshUser: jest.fn(),
    });

    const { result } = renderHook(() => useAuthPersistence());

    await waitFor(() => {
      expect(mockedGetUser).toHaveBeenCalled();
    });

    expect(result.current.isLoading).toBe(true);
  });
});

describe('useAsyncStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetStorageItem.mockResolvedValue(null);
    mockedSetStorageItem.mockResolvedValue(undefined);
  });

  it('loads a saved value from storage', async () => {
    mockedGetStorageItem.mockResolvedValue(['apple', 'banana']);

    const { result } = renderHook(() =>
      useAsyncStorage<string[]>('wishlist_product_ids', [])
    );

    expect(result.current[2]).toBe(true);

    await waitFor(() => {
      expect(result.current[2]).toBe(false);
    });

    expect(result.current[0]).toEqual(['apple', 'banana']);
  });

  it('keeps the initial value when storage is empty', async () => {
    const { result } = renderHook(() =>
      useAsyncStorage<string[]>('wishlist_product_ids', ['default'])
    );

    await waitFor(() => {
      expect(result.current[2]).toBe(false);
    });

    expect(result.current[0]).toEqual(['default']);
  });

  it('updates and saves a new value', async () => {
    const { result } = renderHook(() =>
      useAsyncStorage<string[]>('wishlist_product_ids', [])
    );

    await waitFor(() => {
      expect(result.current[2]).toBe(false);
    });

    await act(async () => {
      await result.current[1](['apple']);
    });

    expect(result.current[0]).toEqual(['apple']);
    expect(mockedSetStorageItem).toHaveBeenCalledWith(
      'wishlist_product_ids',
      ['apple']
    );
  });

  it('supports functional value updates', async () => {
    const { result } = renderHook(() =>
      useAsyncStorage<number[]>('wishlist_product_ids', [1])
    );

    await waitFor(() => {
      expect(result.current[2]).toBe(false);
    });

    await act(async () => {
      await result.current[1]((previous) => [...previous, 2]);
    });

    expect(result.current[0]).toEqual([1, 2]);
  });

  it('handles storage loading errors', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockedGetStorageItem.mockRejectedValue(new Error('Storage unavailable'));

    const { result } = renderHook(() =>
      useAsyncStorage<string[]>('wishlist_product_ids', [])
    );

    await waitFor(() => {
      expect(result.current[2]).toBe(false);
    });

    expect(result.current[0]).toEqual([]);
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('handles storage saving errors without losing the updated value', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockedSetStorageItem.mockRejectedValue(new Error('Save failed'));

    const { result } = renderHook(() =>
      useAsyncStorage<string[]>('wishlist_product_ids', [])
    );

    await waitFor(() => {
      expect(result.current[2]).toBe(false);
    });

    await act(async () => {
      await result.current[1](['saved-locally']);
    });

    expect(result.current[0]).toEqual(['saved-locally']);
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});

describe('useInfiniteScroll', () => {
  it('loads data and advances the page', async () => {
    const fetchFn = jest.fn().mockResolvedValue({
      data: ['apple', 'banana'],
      hasMore: true,
    });

    const { result } = renderHook(() => useInfiniteScroll(fetchFn, 10));

    await act(async () => {
      await result.current.loadMore();
    });

    expect(fetchFn).toHaveBeenCalledWith(0, 10);
    expect(result.current.data).toEqual(['apple', 'banana']);
    expect(result.current.hasMore).toBe(true);
    expect(result.current.loading).toBe(false);

    await act(async () => {
      await result.current.loadMore();
    });

    expect(fetchFn).toHaveBeenLastCalledWith(1, 10);
    expect(result.current.data).toEqual(['apple', 'banana', 'apple', 'banana']);
  });

  it('stops loading when there are no more pages', async () => {
    const fetchFn = jest.fn().mockResolvedValue({
      data: ['apple'],
      hasMore: false,
    });

    const { result } = renderHook(() => useInfiniteScroll(fetchFn));

    await act(async () => {
      await result.current.loadMore();
    });

    await act(async () => {
      await result.current.loadMore();
    });

    expect(fetchFn).toHaveBeenCalledTimes(1);
    expect(result.current.hasMore).toBe(false);
  });

  it('stores an error when fetching fails', async () => {
    const fetchFn = jest.fn().mockRejectedValue(new Error('Network failed'));

    const { result } = renderHook(() => useInfiniteScroll(fetchFn));

    await act(async () => {
      await result.current.loadMore();
    });

    expect(result.current.error).toBe('Network failed');
    expect(result.current.loading).toBe(false);
  });

  it('uses a fallback message for non-Error failures', async () => {
    const fetchFn = jest.fn().mockRejectedValue('unknown error');

    const { result } = renderHook(() => useInfiniteScroll(fetchFn));

    await act(async () => {
      await result.current.loadMore();
    });

    expect(result.current.error).toBe('Failed to load more');
  });

  it('clears the previous error when loading again', async () => {
    const fetchFn = jest
      .fn()
      .mockRejectedValueOnce(new Error('First failure'))
      .mockResolvedValueOnce({
        data: ['apple'],
        hasMore: true,
      });

    const { result } = renderHook(() => useInfiniteScroll(fetchFn));

    await act(async () => {
      await result.current.loadMore();
    });

    expect(result.current.error).toBe('First failure');

    await act(async () => {
      await result.current.loadMore();
    });

    expect(result.current.error).toBe(null);
    expect(result.current.data).toEqual(['apple']);
  });
});

describe('useNetworkStatus', () => {
  const originalWindowDescriptor = Object.getOwnPropertyDescriptor(
    globalThis,
    'window'
  );

  afterEach(() => {
    if (originalWindowDescriptor) {
      Object.defineProperty(globalThis, 'window', originalWindowDescriptor);
    } else {
      Reflect.deleteProperty(globalThis, 'window');
    }
  });

  it('starts online and responds to offline and online events', () => {
    const listeners = new Map<string, () => void>();

    const fakeWindow = {
      addEventListener: jest.fn((event: string, callback: () => void) => {
        listeners.set(event, callback);
      }),
      removeEventListener: jest.fn((event: string) => {
        listeners.delete(event);
      }),
    };

    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: fakeWindow,
    });

    const { result, unmount } = renderHook(() => useNetworkStatus());

    expect(result.current).toBe(true);

    act(() => {
      listeners.get('offline')?.();
    });

    expect(result.current).toBe(false);

    act(() => {
      listeners.get('online')?.();
    });

    expect(result.current).toBe(true);

    unmount();

    expect(fakeWindow.removeEventListener).toHaveBeenCalledWith(
      'online',
      expect.any(Function)
    );
    expect(fakeWindow.removeEventListener).toHaveBeenCalledWith(
      'offline',
      expect.any(Function)
    );
  });
});
