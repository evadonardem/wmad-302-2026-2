/** A saved delivery address (stored on the device). */
export interface Address {
  id: string;
  userId: number;
  label: string;
  street: string;
  city: string;
  postalCode: string;
  isDefault: boolean;
}

export type AddressInput = Omit<Address, 'id' | 'userId' | 'isDefault'>;
