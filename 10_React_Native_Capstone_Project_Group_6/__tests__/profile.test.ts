import { Address, AddressForm } from '@/types/auth';
import {
  addressToShipping,
  computeOrderStats,
  emptyAddressForm,
  getDefaultAddress,
  removeAddress,
  saveAddress,
  setDefaultAddress,
  validateAddress,
  validateProfile,
} from '@/utils/profile';

const form = (overrides: Partial<AddressForm> = {}): AddressForm => ({
  label: 'Home',
  fullName: 'Jennifer Lawrence',
  phone: '0917 123 4567',
  address: '12 Rizal Street',
  city: 'Manila',
  postalCode: '1000',
  isDefault: false,
  ...overrides,
});

const defaults = (list: Address[]) => list.filter((a) => a.isDefault).map((a) => a.id);

describe('validateProfile', () => {
  const ok = { firstName: 'Jen', lastName: 'Lawrence', email: 'jen@example.com', phone: '' };

  it('accepts a valid profile, with the phone left empty', () => {
    expect(validateProfile(ok)).toEqual({});
  });

  it('requires a name and a valid email', () => {
    expect(validateProfile({ ...ok, firstName: ' ' }).firstName).toBeDefined();
    expect(validateProfile({ ...ok, lastName: '' }).lastName).toBeDefined();
    expect(validateProfile({ ...ok, email: 'nope' }).email).toBeDefined();
    expect(validateProfile({ ...ok, email: 'a@b' }).email).toBeDefined();
  });

  it('checks the phone only when it is filled in', () => {
    expect(validateProfile({ ...ok, phone: '12' }).phone).toBeDefined();
    expect(validateProfile({ ...ok, phone: '+63 917-123-4567' }).phone).toBeUndefined();
  });
});

describe('validateAddress / emptyAddressForm', () => {
  it('accepts a complete address and asks for a name', () => {
    expect(validateAddress(form())).toEqual({});
    expect(validateAddress(form({ label: ' ' })).label).toBeDefined();
    expect(validateAddress(form({ postalCode: '12' })).postalCode).toBeDefined();
  });

  it('prefills the name and phone in a new form', () => {
    expect(emptyAddressForm('Jen L', '0917')).toMatchObject({ label: 'Home', fullName: 'Jen L', phone: '0917', isDefault: false });
  });
});

describe('address book', () => {
  it('makes the first address the default', () => {
    const list = saveAddress([], form(), 'A1');
    expect(list).toHaveLength(1);
    expect(defaults(list)).toEqual(['A1']);
  });

  it('adds more addresses as non-default, and trims the text', () => {
    const list = saveAddress(saveAddress([], form(), 'A1'), form({ label: '  Work ' }), 'A2');
    expect(list[1].label).toBe('Work');
    expect(defaults(list)).toEqual(['A1']);
  });

  it('keeps exactly one default when a new default is chosen', () => {
    const list = saveAddress(saveAddress([], form(), 'A1'), form({ label: 'Work', isDefault: true }), 'A2');
    expect(defaults(list)).toEqual(['A2']);
  });

  it('edits an address in place', () => {
    const start = saveAddress(saveAddress([], form(), 'A1'), form({ label: 'Work' }), 'A2');
    const edited = saveAddress(start, { ...start[1], city: 'Cebu' }, 'unused');
    expect(edited).toHaveLength(2);
    expect(edited[1].city).toBe('Cebu');
    expect(edited[1].id).toBe('A2');
  });

  it('does not let the default address be un-defaulted', () => {
    const start = saveAddress([], form(), 'A1');
    const edited = saveAddress(start, { ...start[0], isDefault: false }, 'unused');
    expect(defaults(edited)).toEqual(['A1']);
  });

  it('removes an address and promotes the first one if the default was removed', () => {
    const start = saveAddress(saveAddress([], form(), 'A1'), form({ label: 'Work' }), 'A2');
    expect(defaults(removeAddress(start, 'A1'))).toEqual(['A2']);
    expect(removeAddress(start, 'A2')).toHaveLength(1);
    expect(removeAddress(removeAddress(start, 'A1'), 'A2')).toEqual([]);
  });

  it('changes the default and finds it again', () => {
    const start = saveAddress(saveAddress([], form(), 'A1'), form({ label: 'Work' }), 'A2');
    const next = setDefaultAddress(start, 'A2');
    expect(getDefaultAddress(next)?.id).toBe('A2');
    expect(getDefaultAddress([])).toBeNull();
  });

  it('turns an address into checkout shipping info (no id/label)', () => {
    const [address] = saveAddress([], form(), 'A1');
    const shipping = addressToShipping(address);
    expect(shipping).toEqual({
      fullName: 'Jennifer Lawrence',
      phone: '0917 123 4567',
      address: '12 Rizal Street',
      city: 'Manila',
      postalCode: '1000',
    });
  });
});

describe('computeOrderStats', () => {
  it('counts orders and adds up what was spent, rounded to cents', () => {
    expect(computeOrderStats([{ discountedTotal: 10.1 }, { discountedTotal: 20.2 }])).toEqual({ count: 2, spent: 30.3 });
  });
  it('handles no orders and bad numbers', () => {
    expect(computeOrderStats([])).toEqual({ count: 0, spent: 0 });
    expect(computeOrderStats([{ discountedTotal: NaN }, { discountedTotal: 5 }])).toEqual({ count: 2, spent: 5 });
  });
});
