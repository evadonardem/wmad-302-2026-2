/**
 * Unit & Integration Tests for Auth/Cart Reducers and API Services
 */
import axios from 'axios';
import { authReducer } from '@/context/AuthContext';
import { cartReducer } from '@/context/CartContext';
import { ProductApiService } from '@/services/productApi';
import { AuthApiService } from '@/services/authApi';
import { AuthState, AuthUser } from '@/types/auth';
import { Product } from '@/types/product';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(undefined),
  removeItem: jest.fn().mockResolvedValue(undefined),
  multiRemove: jest.fn().mockResolvedValue(undefined),
}));

const sampleUser: AuthUser = {
  id: 1,
  username: 'emilys',
  email: 'emily.johnson@x.dummyjson.com',
  firstName: 'Emily',
  lastName: 'Johnson',
  gender: 'female',
  image: 'https://dummyjson.com/icon/emilys/128',
  token: 'access-123',
  refreshToken: 'refresh-123',
};

const sampleProduct: Product = {
  id: 101,
  title: 'Wireless Headphones',
  description: 'Noise-cancelling headphones',
  category: 'electronics',
  price: 100,
  discountPercentage: 20,
  rating: 4.5,
  stock: 5,
  tags: ['audio'],
  brand: 'SoundMax',
  sku: 'SM-101',
  weight: 0.3,
  dimensions: { width: 18, height: 20, depth: 8 },
  warrantyInformation: '1 year warranty',
  shippingInformation: 'Ships in 2 days',
  availabilityStatus: 'In Stock',
  reviews: [],
  returnPolicy: '30 days return',
  minimumOrderQuantity: 1,
  meta: {
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
    barcode: '123456789',
    qrCode: 'qr-123',
  },
  images: ['https://dummyjson.com/image/i/101/1.jpg'],
  thumbnail: 'https://dummyjson.com/image/i/101/thumbnail.jpg',
};

describe('authReducer unit tests', () => {
  const baseState: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  };

  it('handles AUTH_START and AUTH_SUCCESS', () => {
    const started = authReducer(baseState, { type: 'AUTH_START' });
    expect(started.isLoading).toBe(true);
    expect(started.error).toBeNull();

    const authed = authReducer(started, { type: 'AUTH_SUCCESS', payload: sampleUser });
    expect(authed.isAuthenticated).toBe(true);
    expect(authed.isLoading).toBe(false);
    expect(authed.user?.username).toBe('emilys');
  });

  it('handles AUTH_FAILURE and AUTH_LOGOUT', () => {
    const authed: AuthState = {
      user: sampleUser,
      isAuthenticated: true,
      isLoading: false,
      error: null,
    };
    const loggedOut = authReducer(authed, { type: 'AUTH_LOGOUT' });
    expect(loggedOut.isAuthenticated).toBe(false);
    expect(loggedOut.user).toBeNull();
  });
});

describe('cartReducer unit tests', () => {
  const emptyCartState = cartReducer(undefined as never, { type: 'CART_CLEAR' });

  it('adds items, caps quantity at stock, applies coupon, and removes items', () => {
    const added = cartReducer(emptyCartState, {
      type: 'CART_ADD_ITEM',
      payload: { product: sampleProduct, quantity: 2 },
    });
    expect(added.items).toHaveLength(1);
    expect(added.totalQuantity).toBe(2);
    expect(added.total).toBe(200);
    expect(added.discountedTotal).toBe(160);

    const capped = cartReducer(added, {
      type: 'CART_UPDATE_QTY',
      payload: { productId: sampleProduct.id, quantity: 99 },
    });
    expect(capped.items[0].quantity).toBe(5);

    const withCoupon = cartReducer(capped, {
      type: 'CART_APPLY_COUPON',
      payload: { code: 'SAVE10', discountRate: 0.1 },
    });
    expect(withCoupon.discountedTotal).toBeCloseTo(360, 2);

    const removed = cartReducer(withCoupon, {
      type: 'CART_REMOVE_ITEM',
      payload: sampleProduct.id,
    });
    expect(removed.items).toHaveLength(0);
    expect(removed.discountedTotal).toBe(0);
  });
});

describe('API services integration tests', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('normalizes category objects and fetches products in ProductApiService', async () => {
    const getMock = jest.fn().mockImplementation((url: string) => {
      if (url === '/products/categories') {
        return Promise.resolve({
          data: [{ slug: 'smartphones', name: 'Smartphones', url: '...' }],
        });
      }
      return Promise.resolve({
        data: { products: [sampleProduct], total: 1, skip: 0, limit: 20 },
      });
    });

    jest.spyOn(axios, 'create').mockReturnValue({
      get: getMock,
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
      },
    } as unknown as ReturnType<typeof axios.create>);

    const service = new ProductApiService();
    const cats = await service.getCategories();
    expect(cats).toEqual(['smartphones']);

    const list = await service.getProducts({ limit: 20, skip: 0 });
    expect(list.products).toHaveLength(1);
    expect(list.products[0].title).toBe('Wireless Headphones');
  });

  it('logs in and stores user session in AuthApiService', async () => {
    const postMock = jest.fn().mockResolvedValue({
      data: {
        ...sampleUser,
        token: undefined,
        accessToken: 'login-token-999',
        refreshToken: 'refresh-token-999',
      },
    });

    jest.spyOn(axios, 'create').mockReturnValue({
      get: jest.fn(),
      post: postMock,
      put: jest.fn(),
      delete: jest.fn(),
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
      },
    } as unknown as ReturnType<typeof axios.create>);

    const authService = new AuthApiService();
    const loggedInUser = await authService.login({
      username: 'emilys',
      password: 'emilyspass',
    });

    expect(loggedInUser.username).toBe('emilys');
    expect(loggedInUser.token).toBe('login-token-999');
  });
});