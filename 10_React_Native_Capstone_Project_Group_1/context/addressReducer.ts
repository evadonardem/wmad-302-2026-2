/**
 * Address reducer (pure). Each user has at most one default address.
 */
import { Address, AddressAction, AddressState } from '@/types/user';

export const initialAddressState: AddressState = { addresses: [], isHydrated: false };

/** Clear `isDefault` on every address of `userId` except `keepId`. */
function clearOtherDefaults(addresses: Address[], userId: number, keepId: string): Address[] {
  return addresses.map((a) =>
    a.userId === userId && a.id !== keepId && a.isDefault ? { ...a, isDefault: false } : a
  );
}

export function addressReducer(state: AddressState, action: AddressAction): AddressState {
  switch (action.type) {
    case 'ADDRESS_HYDRATE':
      return { addresses: action.payload, isHydrated: true };

    case 'ADDRESS_ADD': {
      const hasAddress = state.addresses.some((a) => a.userId === action.payload.userId);
      // The first address of a user is always the default
      const added: Address = { ...action.payload, isDefault: action.payload.isDefault || !hasAddress };
      const others = added.isDefault
        ? clearOtherDefaults(state.addresses, added.userId, added.id)
        : state.addresses;
      return { ...state, addresses: [...others, added] };
    }

    case 'ADDRESS_UPDATE': {
      const updated = action.payload;
      const replaced = state.addresses.map((a) => (a.id === updated.id ? updated : a));
      return {
        ...state,
        addresses: updated.isDefault ? clearOtherDefaults(replaced, updated.userId, updated.id) : replaced,
      };
    }

    case 'ADDRESS_REMOVE': {
      const removed = state.addresses.find((a) => a.id === action.payload.id);
      const remaining = state.addresses.filter((a) => a.id !== action.payload.id);
      if (!removed?.isDefault) return { ...state, addresses: remaining };

      // Promote the next address of the same user to default
      const next = remaining.find((a) => a.userId === removed.userId);
      return {
        ...state,
        addresses: next ? remaining.map((a) => (a.id === next.id ? { ...a, isDefault: true } : a)) : remaining,
      };
    }

    case 'ADDRESS_SET_DEFAULT':
      return {
        ...state,
        addresses: state.addresses.map((a) =>
          a.userId === action.payload.userId ? { ...a, isDefault: a.id === action.payload.id } : a
        ),
      };

    default:
      return state;
  }
}
