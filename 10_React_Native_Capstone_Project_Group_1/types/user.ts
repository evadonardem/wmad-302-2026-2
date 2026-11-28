/**
 * User profile, address and settings types
 */

export interface Address {
  id: string;
  userId: number;
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  city: string;
  postalCode: string;
  isDefault: boolean;
}

export type AddressInput = Omit<Address, 'id' | 'userId'>;

export interface AddressState {
  addresses: Address[];
  isHydrated: boolean;
}

export type AddressAction =
  | { type: 'ADDRESS_HYDRATE'; payload: Address[] }
  | { type: 'ADDRESS_ADD'; payload: Address }
  | { type: 'ADDRESS_UPDATE'; payload: Address }
  | { type: 'ADDRESS_REMOVE'; payload: { id: string } }
  | { type: 'ADDRESS_SET_DEFAULT'; payload: { id: string; userId: number } };

export interface UpdateProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

export interface AppSettings {
  orderNotifications: boolean;
  dealNotifications: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  orderNotifications: true,
  dealNotifications: false,
};
