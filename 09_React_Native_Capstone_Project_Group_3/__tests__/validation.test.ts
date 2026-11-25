import { validateProfileForm, validateRegisterForm, RegisterForm } from '@/utils/validation';

const valid: RegisterForm = {
  firstName: 'Ana',
  lastName: 'Cruz',
  username: 'ana_cruz',
  email: 'ana@example.com',
  password: 'secret1',
  confirmPassword: 'secret1',
  age: '25',
  gender: 'female',
};

describe('validateRegisterForm', () => {
  it('accepts a valid form', () => {
    expect(validateRegisterForm(valid, true)).toBeNull();
  });

  it.each([
    [{ firstName: ' ' }, 'First name is required'],
    [{ lastName: '' }, 'Last name is required'],
    [{ username: 'ab' }, 'Username must be at least 3 characters'],
    [{ username: 'bad name!' }, 'Username can only contain letters, numbers, dots and underscores'],
    [{ email: 'nope' }, 'Invalid email format'],
    [{ password: '123', confirmPassword: '123' }, 'Password must be at least 6 characters'],
    [{ confirmPassword: 'different' }, 'Passwords do not match'],
    [{ age: '5' }, 'Age must be between 13 and 120'],
    [{ age: 'abc' }, 'Age must be between 13 and 120'],
  ])('rejects %j', (override, message) => {
    expect(validateRegisterForm({ ...valid, ...override }, true)).toBe(message);
  });

  it('requires accepting the terms', () => {
    expect(validateRegisterForm(valid, false)).toBe('You must agree to the Terms of Service');
  });

  it('allows an empty age', () => {
    expect(validateRegisterForm({ ...valid, age: '' }, true)).toBeNull();
  });
});

describe('validateProfileForm', () => {
  it('validates names and email', () => {
    expect(validateProfileForm({ firstName: 'A', lastName: 'B', email: 'a@b.co' })).toBeNull();
    expect(validateProfileForm({ firstName: '', lastName: 'B', email: 'a@b.co' })).toBe('First name is required');
    expect(validateProfileForm({ firstName: 'A', lastName: 'B', email: 'bad' })).toBe('Invalid email format');
  });
});
