import { addressReducer, initialAddressState } from '@/context/addressReducer';
import { Address } from '@/types/user';

const address = (id: string, overrides: Partial<Address> = {}): Address => ({
  id,
  userId: 1,
  label: 'Home',
  fullName: 'Ann',
  phone: '1234567',
  line1: '1 Main St',
  city: 'Baguio',
  postalCode: '2600',
  isDefault: false,
  ...overrides,
});

const hydrated = (addresses: Address[]) => ({ addresses, isHydrated: true });

describe('addressReducer', () => {
  it('makes the first address of a user the default', () => {
    const state = addressReducer(hydrated([]), { type: 'ADDRESS_ADD', payload: address('a') });
    expect(state.addresses[0].isDefault).toBe(true);
  });

  it('keeps a single default when a new default is added', () => {
    const start = hydrated([address('a', { isDefault: true })]);
    const state = addressReducer(start, { type: 'ADDRESS_ADD', payload: address('b', { isDefault: true }) });
    expect(state.addresses.filter((a) => a.isDefault).map((a) => a.id)).toEqual(['b']);
  });

  it('does not touch other users defaults', () => {
    const start = hydrated([address('x', { userId: 2, isDefault: true })]);
    const state = addressReducer(start, { type: 'ADDRESS_ADD', payload: address('b', { isDefault: true }) });
    expect(state.addresses.find((a) => a.id === 'x')?.isDefault).toBe(true);
  });

  it('updates an address and moves the default', () => {
    const start = hydrated([address('a', { isDefault: true }), address('b')]);
    const state = addressReducer(start, { type: 'ADDRESS_UPDATE', payload: address('b', { city: 'Manila', isDefault: true }) });
    expect(state.addresses.find((a) => a.id === 'b')).toMatchObject({ city: 'Manila', isDefault: true });
    expect(state.addresses.find((a) => a.id === 'a')?.isDefault).toBe(false);
  });

  it('promotes another address when the default is removed', () => {
    const start = hydrated([address('a', { isDefault: true }), address('b')]);
    const state = addressReducer(start, { type: 'ADDRESS_REMOVE', payload: { id: 'a' } });
    expect(state.addresses).toHaveLength(1);
    expect(state.addresses[0]).toMatchObject({ id: 'b', isDefault: true });
  });

  it('removes a non-default address without changing the default', () => {
    const start = hydrated([address('a', { isDefault: true }), address('b')]);
    const state = addressReducer(start, { type: 'ADDRESS_REMOVE', payload: { id: 'b' } });
    expect(state.addresses.map((a) => a.id)).toEqual(['a']);
    expect(state.addresses[0].isDefault).toBe(true);
  });

  it('sets the default for one user only', () => {
    const start = hydrated([address('a', { isDefault: true }), address('b'), address('x', { userId: 2, isDefault: true })]);
    const state = addressReducer(start, { type: 'ADDRESS_SET_DEFAULT', payload: { id: 'b', userId: 1 } });
    expect(state.addresses.map((a) => a.isDefault)).toEqual([false, true, true]);
  });

  it('hydrates', () => {
    expect(addressReducer(initialAddressState, { type: 'ADDRESS_HYDRATE', payload: [address('a')] }).isHydrated).toBe(true);
  });
});
