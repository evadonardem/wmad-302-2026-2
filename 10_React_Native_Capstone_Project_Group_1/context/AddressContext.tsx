/**
 * Address Context - saved delivery addresses (per user), persisted to AsyncStorage.
 */
import React, { createContext, useCallback, useContext, useMemo, ReactNode } from 'react';
import { Address, AddressAction, AddressInput, AddressState } from '@/types/user';
import { addressReducer, initialAddressState } from '@/context/addressReducer';
import { usePersistedReducer } from '@/hooks/usePersistedReducer';
import { useAuth } from '@/context/AuthContext';
import { STORAGE_KEYS } from '@/utils/storage';

interface AddressContextType {
  /** Addresses of the signed-in user */
  addresses: Address[];
  defaultAddress: Address | null;
  isHydrated: boolean;
  addAddress: (input: AddressInput) => void;
  updateAddress: (id: string, input: AddressInput) => void;
  removeAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
}

const AddressContext = createContext<AddressContextType | undefined>(undefined);

const EMPTY_ADDRESSES: Address[] = [];
const hydrateAction = (list: Address[]): AddressAction => ({ type: 'ADDRESS_HYDRATE', payload: list });
const selectAddresses = (state: AddressState): Address[] => state.addresses;

function createAddressId(): string {
  return `ADDR-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function AddressProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [state, dispatch] = usePersistedReducer(addressReducer, initialAddressState, {
    storageKey: STORAGE_KEYS.ADDRESSES,
    emptyValue: EMPTY_ADDRESSES,
    toHydrateAction: hydrateAction,
    selectPersisted: selectAddresses,
  });

  const userId = user?.id;
  const addresses = useMemo(
    () => (userId === undefined ? EMPTY_ADDRESSES : state.addresses.filter((a) => a.userId === userId)),
    [state.addresses, userId]
  );
  const defaultAddress = useMemo(
    () => addresses.find((a) => a.isDefault) ?? addresses[0] ?? null,
    [addresses]
  );

  const addAddress = useCallback(
    (input: AddressInput) => {
      if (userId === undefined) return;
      dispatch({ type: 'ADDRESS_ADD', payload: { ...input, id: createAddressId(), userId } });
    },
    [dispatch, userId]
  );

  const updateAddress = useCallback(
    (id: string, input: AddressInput) => {
      if (userId === undefined) return;
      dispatch({ type: 'ADDRESS_UPDATE', payload: { ...input, id, userId } });
    },
    [dispatch, userId]
  );

  const removeAddress = useCallback(
    (id: string) => dispatch({ type: 'ADDRESS_REMOVE', payload: { id } }),
    [dispatch]
  );

  const setDefaultAddress = useCallback(
    (id: string) => {
      if (userId === undefined) return;
      dispatch({ type: 'ADDRESS_SET_DEFAULT', payload: { id, userId } });
    },
    [dispatch, userId]
  );

  const value = useMemo(
    () => ({
      addresses,
      defaultAddress,
      isHydrated: state.isHydrated,
      addAddress,
      updateAddress,
      removeAddress,
      setDefaultAddress,
    }),
    [addresses, defaultAddress, state.isHydrated, addAddress, updateAddress, removeAddress, setDefaultAddress]
  );

  return <AddressContext.Provider value={value}>{children}</AddressContext.Provider>;
}

export function useAddresses(): AddressContextType {
  const context = useContext(AddressContext);
  if (context === undefined) {
    throw new Error('useAddresses must be used within an AddressProvider');
  }
  return context;
}
