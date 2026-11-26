/**
 * Form validation helpers (pure functions, unit tested).
 */
import type { ShippingDetails } from '@/types/order';
import type { AddressInput } from '@/types/address';

export type ShippingErrors = Partial<Record<keyof ShippingDetails, string>>;

export function validateShipping(values: ShippingDetails): ShippingErrors {
  const errors: ShippingErrors = {};

  if (values.fullName.trim().length < 2) errors.fullName = 'Enter your full name';

  const digits = values.phone.replace(/[\s()+-]/g, '');
  if (!/^\d{7,15}$/.test(digits)) errors.phone = 'Enter a valid phone number (7-15 digits)';

  if (values.address.trim().length < 5) errors.address = 'Enter your street address';
  if (values.city.trim().length < 2) errors.city = 'Enter your city';
  if (!/^[A-Za-z0-9 -]{3,10}$/.test(values.postalCode.trim())) {
    errors.postalCode = 'Enter a valid postal code';
  }

  return errors;
}

export function hasErrors(errors: Record<string, string | undefined>): boolean {
  return Object.values(errors).some((message) => Boolean(message));
}

// ============ Address ============


export type AddressErrors = Partial<Record<keyof AddressInput, string>>;

export function validateAddress(values: AddressInput): AddressErrors {
  const errors: AddressErrors = {};
  if (values.label.trim().length < 2) errors.label = 'Give this address a name (e.g. Home)';
  if (values.street.trim().length < 5) errors.street = 'Enter your street address';
  if (values.city.trim().length < 2) errors.city = 'Enter your city';
  if (!/^[A-Za-z0-9 -]{3,10}$/.test(values.postalCode.trim())) errors.postalCode = 'Enter a valid postal code';
  return errors;
}

// ============ Profile ============

export interface ProfileValues {
  firstName: string;
  lastName: string;
  email: string;
}

export type ProfileErrors = Partial<Record<keyof ProfileValues, string>>;

export function validateProfile(values: ProfileValues): ProfileErrors {
  const errors: ProfileErrors = {};
  if (!values.firstName.trim()) errors.firstName = 'First name is required';
  if (!values.lastName.trim()) errors.lastName = 'Last name is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) errors.email = 'Enter a valid email address';
  return errors;
}
