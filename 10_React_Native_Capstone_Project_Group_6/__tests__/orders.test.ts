import { Cart, CartItem, ShippingInfo } from '@/types/product';
import {
  PAYMENT_METHODS,
  apiCartToOrder,
  belongsToUser,
  buildOrder,
  formatOrderDate,
  getOrderNumber,
  validateShipping,
} from '@/utils/orders';

const validShipping: ShippingInfo = {
  fullName: 'Jennifer Lawrence',
  phone: '+63 917 123 4567',
  address: '12 Rizal Street',
  city: 'Manila',
  postalCode: '1000',
};

const cartItem = (overrides: Partial<CartItem> = {}): CartItem => ({
  productId: 1,
  title: 'Phone',
  thumbnail: 'x.png',
  price: 100,
  discountPercentage: 10,
  stock: 5,
  quantity: 2,
  ...overrides,
});

describe('validateShipping', () => {
  it('accepts a complete form', () => {
    expect(validateShipping(validShipping)).toEqual({});
  });

  it('reports every empty field', () => {
    const errors = validateShipping({ fullName: '', phone: '', address: '', city: '', postalCode: '' });
    expect(Object.keys(errors).sort()).toEqual(['address', 'city', 'fullName', 'phone', 'postalCode']);
  });

  it('checks the phone number (7-15 digits, symbols allowed)', () => {
    expect(validateShipping({ ...validShipping, phone: '12345' }).phone).toBeDefined();
    expect(validateShipping({ ...validShipping, phone: 'abc1234567' }).phone).toBeDefined();
    expect(validateShipping({ ...validShipping, phone: '(02) 8123-4567' }).phone).toBeUndefined();
  });

  it('checks the postal code (4-6 digits)', () => {
    expect(validateShipping({ ...validShipping, postalCode: '12' }).postalCode).toBeDefined();
    expect(validateShipping({ ...validShipping, postalCode: '12ab' }).postalCode).toBeDefined();
    expect(validateShipping({ ...validShipping, postalCode: '123456' }).postalCode).toBeUndefined();
  });
});

describe('buildOrder', () => {
  const now = new Date('2026-11-20T01:00:00.000Z');
  const order = buildOrder({
    userId: 1,
    owner: 'jlaw',
    items: [cartItem()],
    shipping: validShipping,
    paymentMethod: 'gcash',
    now,
  });

  it('creates an id, date, status and owner', () => {
    expect(order.id).toBe(`ORD-${now.getTime()}`);
    expect(order.placedAt).toBe('2026-11-20T01:00:00.000Z');
    expect(order.status).toBe('Processing');
    expect(order.owner).toBe('jlaw');
    expect(order.paymentMethod).toBe('gcash');
  });

  it('calculates the totals from the cart', () => {
    expect(order.total).toBeCloseTo(200);
    expect(order.discountedTotal).toBeCloseTo(180);
    expect(order.totalQuantity).toBe(2);
  });

  it('copies the items without the stock field and keeps a separate copy of the address', () => {
    expect(order.items[0]).not.toHaveProperty('stock');
    expect(order.items[0].quantity).toBe(2);
    expect(order.shipping).toEqual(validShipping);
    expect(order.shipping).not.toBe(validShipping);
  });
});

describe('buildOrder with a coupon', () => {
  const base = { userId: 1, owner: 'jlaw', items: [cartItem()], shipping: validShipping, paymentMethod: 'cod' as const };

  it('subtracts the coupon from what was paid and remembers it', () => {
    const order = buildOrder({ ...base, couponCode: 'SAVE5', couponDiscount: 5 });
    expect(order.discountedTotal).toBeCloseTo(175); // 2 x 90 = 180, minus 5
    expect(order.total).toBeCloseTo(200);
    expect(order.couponCode).toBe('SAVE5');
    expect(order.couponDiscount).toBe(5);
  });

  it('has no coupon fields when none was used', () => {
    const order = buildOrder(base);
    expect(order.discountedTotal).toBeCloseTo(180);
    expect(order).not.toHaveProperty('couponCode');
    expect(buildOrder({ ...base, couponCode: 'SAVE5', couponDiscount: 0 })).not.toHaveProperty('couponCode');
  });
});

describe('apiCartToOrder', () => {
  const cart: Cart = {
    id: 51,
    userId: 7,
    total: 300,
    discountedTotal: 270,
    totalProducts: 1,
    totalQuantity: 3,
    products: [
      { id: 9, title: 'Lamp', price: 100, quantity: 3, total: 300, discountPercentage: 10, discountedTotal: 270, thumbnail: 'l.png' },
    ],
  } as unknown as Cart;

  it('turns a DummyJSON cart into a delivered past order', () => {
    const order = apiCartToOrder(cart);
    expect(order.id).toBe('CART-51');
    expect(order.status).toBe('Delivered');
    expect(order.placedAt).toBeNull();
    expect(order.items[0]).toMatchObject({ productId: 9, title: 'Lamp', quantity: 3 });
    expect(order.discountedTotal).toBe(270);
  });
});

describe('getOrderNumber / formatOrderDate', () => {
  it('shortens our order ids and API cart ids', () => {
    expect(getOrderNumber({ id: 'ORD-1731999999999' })).toBe('#999999');
    expect(getOrderNumber({ id: 'CART-51' })).toBe('#51');
  });

  it('formats a date and falls back for missing or broken dates', () => {
    expect(formatOrderDate('2026-11-20T01:00:00.000Z')).toContain('2026');
    expect(formatOrderDate(null)).toBe('Past order');
    expect(formatOrderDate('not a date')).toBe('Past order');
  });

  it('lists the three payment methods', () => {
    expect(PAYMENT_METHODS.map((m) => m.value)).toEqual(['cod', 'gcash', 'card']);
  });
});

describe('belongsToUser', () => {
  const real = { id: 1, username: 'emilys' };
  const registered = { id: 1, username: 'jlaw', isSimulated: true };

  it('matches orders that have an owner by username', () => {
    expect(belongsToUser({ owner: 'jlaw', userId: 1 }, registered)).toBe(true);
    expect(belongsToUser({ owner: 'jlaw', userId: 1 }, real)).toBe(false);
  });

  it('shows old orders without an owner only to real accounts with the same id', () => {
    expect(belongsToUser({ userId: 1 }, real)).toBe(true);
    expect(belongsToUser({ userId: 2 }, real)).toBe(false);
    expect(belongsToUser({ userId: 1 }, registered)).toBe(false);
  });
});