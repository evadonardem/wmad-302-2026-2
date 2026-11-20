import { ProductApiService } from '@/services/productApi';

// The fake axios client from jest.setup.js
const { __client: client } = jest.requireMock('axios') as {
  __client: { get: jest.Mock; post: jest.Mock; put: jest.Mock; delete: jest.Mock };
};

let api: ProductApiService;

beforeEach(() => {
  client.get.mockReset();
  client.post.mockReset();
  client.put.mockReset();
  client.delete.mockReset();
  api = new ProductApiService();
});

describe('products', () => {
  it('getProducts passes the paging params and returns the data', async () => {
    client.get.mockResolvedValueOnce({ data: { products: [], total: 0 } });
    const result = await api.getProducts({ limit: 10, skip: 20 });
    expect(client.get).toHaveBeenCalledWith('/products', { params: { limit: 10, skip: 20 } });
    expect(result).toEqual({ products: [], total: 0 });
  });

  it('getProductById asks for one product', async () => {
    client.get.mockResolvedValueOnce({ data: { id: 5 } });
    expect(await api.getProductById(5)).toEqual({ id: 5 });
    expect(client.get).toHaveBeenCalledWith('/products/5');
  });

  it('searchProducts sends the query as q', async () => {
    client.get.mockResolvedValueOnce({ data: { products: [] } });
    await api.searchProducts('phone', { limit: 0 });
    expect(client.get).toHaveBeenCalledWith('/products/search', { params: { q: 'phone', limit: 0 } });
  });

  it('getProductsByCategory and getProductsByBrand encode the name in the URL', async () => {
    client.get.mockResolvedValue({ data: { products: [] } });
    await api.getProductsByCategory('home decoration');
    await api.getProductsByBrand('Calvin Klein');
    expect(client.get).toHaveBeenCalledWith('/products/category/home%20decoration', { params: {} });
    expect(client.get).toHaveBeenCalledWith('/products/brand/Calvin%20Klein', { params: {} });
  });

  it('getCategories returns slugs for both the new (objects) and old (strings) API', async () => {
    client.get.mockResolvedValueOnce({
      data: [{ slug: 'beauty', name: 'Beauty', url: 'u' }, 'furniture'],
    });
    expect(await api.getCategories()).toEqual(['beauty', 'furniture']);
  });
});

describe('carts', () => {
  it('getUserCarts, getCartById and getAllCarts read carts', async () => {
    client.get.mockResolvedValue({ data: { carts: [], total: 0 } });
    await api.getUserCarts(7);
    await api.getCartById(3);
    await api.getAllCarts({ limit: 5 });
    expect(client.get).toHaveBeenCalledWith('/carts/user/7');
    expect(client.get).toHaveBeenCalledWith('/carts/3');
    expect(client.get).toHaveBeenCalledWith('/carts', { params: { limit: 5 } });
  });

  it('addCart posts the order (checkout)', async () => {
    const order = { userId: 1, products: [{ id: 9, quantity: 2 }] };
    client.post.mockResolvedValueOnce({ data: { id: 51 } });
    expect(await api.addCart(order)).toEqual({ id: 51 });
    expect(client.post).toHaveBeenCalledWith('/carts/add', order);
  });

  it('updateCart merges by default and deleteCart removes', async () => {
    client.put.mockResolvedValue({ data: {} });
    client.delete.mockResolvedValueOnce({ data: { isDeleted: true, deletedOn: 'now' } });
    await api.updateCart(4, [{ id: 1, quantity: 1 }]);
    await api.updateCart(4, [], false);
    expect(client.put).toHaveBeenCalledWith('/carts/4', { products: [{ id: 1, quantity: 1 }], merge: true });
    expect(client.put).toHaveBeenCalledWith('/carts/4', { products: [], merge: false });
    expect((await api.deleteCart(4)).isDeleted).toBe(true);
  });

  it('passes errors on to the screen', async () => {
    client.get.mockRejectedValueOnce(new Error('offline'));
    await expect(api.getProductById(1)).rejects.toThrow('offline');
  });
});
