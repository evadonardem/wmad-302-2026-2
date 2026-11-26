/**
 * Pure address-list helpers (unit tested).
 */
import type { Address, AddressInput } from '@/types/address';

export function addAddress(list: Address[], userId: number, input: AddressInput, id: string): Address[] {
  const created: Address = {
    id,
    userId,
    label: input.label.trim(),
    street: input.street.trim(),
    city: input.city.trim(),
    postalCode: input.postalCode.trim(),
    // The first address a user saves becomes their default
    isDefault: list.length === 0,
  };
  return [...list, created];
}

export function updateAddress(list: Address[], id: string, input: AddressInput): Address[] {
  return list.map((a) =>
    a.id === id
      ? {
          ...a,
          label: input.label.trim(),
          street: input.street.trim(),
          city: input.city.trim(),
          postalCode: input.postalCode.trim(),
        }
      : a
  );
}

export function removeAddress(list: Address[], id: string): Address[] {
  const removed = list.find((a) => a.id === id);
  const remaining = list.filter((a) => a.id !== id);
  // If the default was deleted, promote the first remaining address
  if (removed?.isDefault && remaining.length > 0) {
    return remaining.map((a, index) => (index === 0 ? { ...a, isDefault: true } : a));
  }
  return remaining;
}

export function setDefaultAddress(list: Address[], id: string): Address[] {
  return list.map((a) => ({ ...a, isDefault: a.id === id }));
}
