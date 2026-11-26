import { hasErrors, validateAddress, validateProfile, validateShipping } from '@/utils/validation';

const validShipping = {
  fullName: 'Ana Cruz',
  phone: '+63 912 345 6789',
  address: '12 Session Road',
  city: 'Baguio',
  postalCode: '2600',
};

describe('validateShipping', () => {
  it('accepts valid details', () => {
    expect(hasErrors(validateShipping(validShipping))).toBe(false);
  });

  it('flags every empty field', () => {
    const errors = validateShipping({ fullName: '', phone: '', address: '', city: '', postalCode: '' });
    expect(Object.keys(errors).sort()).toEqual(['address', 'city', 'fullName', 'phone', 'postalCode']);
  });

  it('rejects a phone number with letters', () => {
    expect(validateShipping({ ...validShipping, phone: 'abc1234' }).phone).toBeDefined();
  });
});

describe('validateAddress', () => {
  it('accepts a valid address', () => {
    expect(hasErrors(validateAddress({ label: 'Home', street: '12 Session Road', city: 'Baguio', postalCode: '2600' }))).toBe(false);
  });
  it('rejects a short street and bad postal code', () => {
    const errors = validateAddress({ label: 'Home', street: '12', city: 'Baguio', postalCode: '!' });
    expect(errors.street).toBeDefined();
    expect(errors.postalCode).toBeDefined();
  });
});

describe('validateProfile', () => {
  it('accepts valid values', () => {
    expect(hasErrors(validateProfile({ firstName: 'Ana', lastName: 'Cruz', email: 'ana@example.com' }))).toBe(false);
  });
  it('rejects an invalid email', () => {
    expect(validateProfile({ firstName: 'Ana', lastName: 'Cruz', email: 'nope' }).email).toBeDefined();
  });
  it('requires names', () => {
    const errors = validateProfile({ firstName: ' ', lastName: '', email: 'a@b.co' });
    expect(errors.firstName).toBeDefined();
    expect(errors.lastName).toBeDefined();
  });
});

describe('hasErrors', () => {
  it('ignores cleared (undefined) entries', () => {
    expect(hasErrors({ fullName: undefined })).toBe(false);
  });
});
