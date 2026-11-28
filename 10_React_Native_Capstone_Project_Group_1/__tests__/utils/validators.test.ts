import {
  hasErrors,
  validateAddress,
  validateEmail,
  validatePhone,
  validateProfile,
  validateRegisterForm,
  RegisterFormValues,
} from '@/utils/validators';

const validRegister: RegisterFormValues = {
  firstName: 'Ann',
  lastName: 'Lee',
  username: 'annlee',
  email: 'ann@example.com',
  password: 'secret1',
  confirmPassword: 'secret1',
  age: '25',
  agreedToTerms: true,
};

describe('validators', () => {
  it('validates email', () => {
    expect(validateEmail('')).toBe('Email is required');
    expect(validateEmail('nope')).toBe('Invalid email format');
    expect(validateEmail(' a@b.co ')).toBeNull();
  });

  it('validates phone', () => {
    expect(validatePhone('')).toBe('Phone number is required');
    expect(validatePhone('', false)).toBeNull();
    expect(validatePhone('abc')).toBe('Enter a valid phone number');
    expect(validatePhone('+63 912 345 6789')).toBeNull();
  });

  describe('register form', () => {
    it('accepts a valid form', () => {
      expect(validateRegisterForm(validRegister)).toBeNull();
    });

    it.each([
      [{ firstName: ' ' }, 'First name is required'],
      [{ lastName: '' }, 'Last name is required'],
      [{ username: '' }, 'Username is required'],
      [{ username: 'ab' }, 'Username must be at least 3 characters'],
      [{ email: 'bad' }, 'Invalid email format'],
      [{ password: '', confirmPassword: '' }, 'Password is required'],
      [{ password: '123', confirmPassword: '123' }, 'Password must be at least 6 characters'],
      [{ confirmPassword: 'different' }, 'Passwords do not match'],
      [{ age: '5' }, 'Age must be between 13 and 120'],
      [{ age: 'abc' }, 'Age must be between 13 and 120'],
      [{ agreedToTerms: false }, 'You must agree to the Terms of Service'],
    ])('rejects %j', (override, message) => {
      expect(validateRegisterForm({ ...validRegister, ...override })).toBe(message);
    });

    it('treats age as optional', () => {
      expect(validateRegisterForm({ ...validRegister, age: '' })).toBeNull();
    });
  });

  it('validates addresses field by field', () => {
    const errors = validateAddress({
      label: 'Home',
      fullName: '',
      phone: 'x',
      line1: '',
      city: '',
      postalCode: '!',
      isDefault: false,
    });
    expect(Object.keys(errors).sort()).toEqual(['city', 'fullName', 'line1', 'phone', 'postalCode']);
    expect(
      hasErrors(
        validateAddress({
          label: 'Home',
          fullName: 'Ann',
          phone: '1234567',
          line1: '1 Main',
          city: 'Baguio',
          postalCode: '2600',
          isDefault: false,
        })
      )
    ).toBe(false);
  });

  it('validates the profile form', () => {
    expect(hasErrors(validateProfile({ firstName: 'A', lastName: 'B', email: 'a@b.co', phone: '' }))).toBe(false);
    expect(Object.keys(validateProfile({ firstName: '', lastName: '', email: 'x', phone: 'bad' })).length).toBe(4);
  });
});
