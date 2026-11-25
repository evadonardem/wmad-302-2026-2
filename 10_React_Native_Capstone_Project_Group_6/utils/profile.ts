/**
 * Profile helpers (pure functions, easy to unit test)
 * - validateProfile: Edit Profile rules
 * - validateAddress + saveAddress/removeAddress/setDefaultAddress: the address book
 * - computeOrderStats: the "Orders" and "Spent" numbers on the Profile screen
 */

import type { Address, AddressForm, ProfileUpdate, UserSettings } from '@/types/auth';
import type { Order, ShippingInfo } from '@/types/product';
import { validateShipping } from '@/utils/orders';

export const DEFAULT_SETTINGS: UserSettings = {
  orderUpdates: true,
  promotions: false,
  defaultPayment: 'cod',
};

// ---------- Edit profile ----------

export type ProfileErrors = Partial<Record<keyof ProfileUpdate, string>>;

/** Returns an error message for each invalid field. An empty object means the form is valid. */
export function validateProfile(form: ProfileUpdate): ProfileErrors {
  const errors: ProfileErrors = {};

  if (form.firstName.trim().length < 1) errors.firstName = 'Enter your first name';
  if (form.lastName.trim().length < 1) errors.lastName = 'Enter your last name';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errors.email = 'Enter a valid email address';

  // Phone is optional, but if it is filled in it must look like a phone number
  const phone = form.phone.trim();
  if (phone && !/^\d{7,15}$/.test(phone.replace(/[\s\-()+]/g, ''))) {
    errors.phone = 'Enter a valid phone number (7-15 digits)';
  }

  return errors;
}

// ---------- Address book ----------

export type AddressErrors = Partial<Record<keyof AddressForm, string>>;

export function validateAddress(form: AddressForm): AddressErrors {
  const errors: AddressErrors = { ...validateShipping(form) };
  if (form.label.trim().length < 1) errors.label = 'Name this address (e.g. Home)';
  return errors;
}

export function emptyAddressForm(fullName = '', phone = ''): AddressForm {
  return { label: 'Home', fullName, phone, address: '', city: '', postalCode: '', isDefault: false };
}

/**
 * Add a new address, or update an existing one (when `form.id` matches a saved address).
 * Rules: the first address is always the default, the default can't be un-defaulted
 * (make another one the default instead), and only one address is the default.
 */
export function saveAddress(list: Address[], form: AddressForm, newId: string): Address[] {
  const existing = form.id ? list.find((a) => a.id === form.id) : undefined;
  const isDefault = form.isDefault || list.length === 0 || existing?.isDefault === true;

  const saved: Address = {
    id: existing?.id ?? newId,
    label: form.label.trim(),
    fullName: form.fullName.trim(),
    phone: form.phone.trim(),
    address: form.address.trim(),
    city: form.city.trim(),
    postalCode: form.postalCode.trim(),
    isDefault,
  };

  const next = existing ? list.map((a) => (a.id === saved.id ? saved : a)) : [...list, saved];
  return isDefault ? next.map((a) => ({ ...a, isDefault: a.id === saved.id })) : next;
}

/** Delete an address. If it was the default, the first remaining address becomes the default. */
export function removeAddress(list: Address[], id: string): Address[] {
  const next = list.filter((a) => a.id !== id);
  if (next.length > 0 && !next.some((a) => a.isDefault)) {
    return next.map((a, index) => ({ ...a, isDefault: index === 0 }));
  }
  return next;
}

export function setDefaultAddress(list: Address[], id: string): Address[] {
  return list.map((a) => ({ ...a, isDefault: a.id === id }));
}

export function getDefaultAddress(list: Address[]): Address | null {
  return list.find((a) => a.isDefault) ?? list[0] ?? null;
}

/** An address as the Checkout shipping form needs it */
export function addressToShipping(address: Address): ShippingInfo {
  return {
    fullName: address.fullName,
    phone: address.phone,
    address: address.address,
    city: address.city,
    postalCode: address.postalCode,
  };
}

// ---------- Stats ----------

/** Number of orders and the total money spent (after discounts, rounded to cents). */
export function computeOrderStats(orders: Pick<Order, 'discountedTotal'>[]): { count: number; spent: number } {
  const spent = orders.reduce((sum, o) => sum + (Number.isFinite(o.discountedTotal) ? o.discountedTotal : 0), 0);
  return { count: orders.length, spent: Math.round(spent * 100) / 100 };
}
