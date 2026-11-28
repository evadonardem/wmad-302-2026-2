import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { ProductApiService } from '@/services/productApi';

interface FakeResponse {
  status: number;
  data: unknown;
}

function makeClient(handler: (config: InternalAxiosRequestConfig) => FakeResponse): AxiosInstance {
  return axios.create({
    baseURL: 'https://dummyjson.com',
    adapter: async (config) => {
      const { status, data } = handler(config);
      const response = { data, status, statusText: '', headers: {}, config };
      if (status >= 200 && status < 300) return response;
      throw new AxiosError('Request failed', String(status), config, null, response);
    },
  });
}

const sent = (config: InternalAxiosRequestConfig): { userId: number } =>
  JSON.parse(String(config.data)) as { userId: number };

const products = [{ id: 1, quantity: 2 }];
const notFound = (id: number): FakeResponse => ({ status: 404, data: { message: `User with id '${id}' not found` } });

describe('ProductApiService orders', () => {
  it('places an order with the signed-in user id', async () => {
    const ids: number[] = [];
    const api = new ProductApiService(
      makeClient((config) => {
        ids.push(sent(config).userId);
        return { status: 201, data: { id: 51 } };
      })
    );
    await expect(api.placeOrder(5, products)).resolves.toMatchObject({ id: 51 });
    expect(ids).toEqual([5]);
  });

  it('retries with a real DummyJSON user when the user (e.g. id 209) does not exist', async () => {
    const ids: number[] = [];
    const api = new ProductApiService(
      makeClient((config) => {
        const { userId } = sent(config);
        ids.push(userId);
        return userId === 209 ? notFound(209) : { status: 201, data: { id: 51 } };
      })
    );
    await expect(api.placeOrder(209, products)).resolves.toMatchObject({ id: 51 });
    expect(ids).toEqual([209, 1]);
  });

  it('does not hide other errors', async () => {
    const api = new ProductApiService(makeClient(() => ({ status: 500, data: { message: 'Server error' } })));
    await expect(api.placeOrder(209, products)).rejects.toBeTruthy();
  });

  it('treats "user not found" as having no past orders', async () => {
    const api = new ProductApiService(makeClient(() => notFound(209)));
    await expect(api.getUserCarts(209)).resolves.toEqual([]);
  });

  it('returns the carts of an existing user', async () => {
    const api = new ProductApiService(
      makeClient(() => ({ status: 200, data: { carts: [{ id: 3 }], total: 1, skip: 0, limit: 30 } }))
    );
    await expect(api.getUserCarts(1)).resolves.toEqual([{ id: 3 }]);
  });
});