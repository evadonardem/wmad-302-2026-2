/**
 * Form validators. Each returns an error message, or null when valid.
 */
import { AddressInput } from '@/types/user';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_CHARS_REGEX = /^[0-9+()\-\s]+$/;

export function validateEmail(email: string): string | null {
  if (!email.trim()) return 'Email is required';
  if (!EMAIL_REGEX.test(email.trim())) return 'Invalid email format';
  return null;
}

export function validatePhone(phone: string, required = true): string | null {
  if (!phone.trim()) return required ? 'Phone number is required' : null;
  const digits = phone.replace(/\D/g, '');
  if (!PHONE_CHARS_REGEX.test(phone.trim()) || digits.length < 7 || digits.length > 15) {
    return 'Enter a valid phone number';
  }
  return null;
}

export function validateRequired(value: string, label: string): string | null {
  return value.trim() ? null : `${label} is required`;
}

export interface RegisterFormValues {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  age: string;
  agreedToTerms: boolean;
}

export function validateRegisterForm(values: RegisterFormValues): string | null {
  const firstName = validateRequired(values.firstName, 'First name');
  if (firstName) return firstName;
  const lastName = validateRequired(values.lastName, 'Last name');
  if (lastName) return lastName;
  if (!values.username.trim()) return 'Username is required';
  if (values.username.trim().length < 3) return 'Username must be at least 3 characters';
  const email = validateEmail(values.email);
  if (email) return email;
  if (!values.password) return 'Password is required';
  if (values.password.length < 6) return 'Password must be at least 6 characters';
  if (values.password !== values.confirmPassword) return 'Passwords do not match';
  if (values.age.trim()) {
    const age = Number(values.age);
    if (!Number.isInteger(age) || age < 13 || age > 120) return 'Age must be between 13 and 120';
  }
  if (!values.agreedToTerms) return 'You must agree to the Terms of Service';
  return null;
}

export type FieldErrors<T> = Partial<Record<keyof T, string>>;

export function validateAddress(input: AddressInput): FieldErrors<AddressInput> {
  const errors: FieldErrors<AddressInput> = {};
  const fullName = validateRequired(input.fullName, 'Full name');
  if (fullName) errors.fullName = fullName;
  const phone = validatePhone(input.phone);
  if (phone) errors.phone = phone;
  const line1 = validateRequired(input.line1, 'Street address');
  if (line1) errors.line1 = line1;
  const city = validateRequired(input.city, 'City');
  if (city) errors.city = city;
  if (!input.postalCode.trim()) errors.postalCode = 'Postal code is required';
  else if (!/^[A-Za-z0-9\- ]{3,10}$/.test(input.postalCode.trim())) {
    errors.postalCode = 'Enter a valid postal code';
  }
  return errors;
}

export interface ProfileFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export function validateProfile(values: ProfileFormValues): FieldErrors<ProfileFormValues> {
  const errors: FieldErrors<ProfileFormValues> = {};
  const firstName = validateRequired(values.firstName, 'First name');
  if (firstName) errors.firstName = firstName;
  const lastName = validateRequired(values.lastName, 'Last name');
  if (lastName) errors.lastName = lastName;
  const email = validateEmail(values.email);
  if (email) errors.email = email;
  const phone = validatePhone(values.phone, false);
  if (phone) errors.phone = phone;
  return errors;
}

export function hasErrors<T>(errors: FieldErrors<T>): boolean {
  return Object.keys(errors).length > 0;
}
