/**
 * Orders Context - orders placed on this device (DummyJSON doesn't store them).
 * Remote carts from GET /carts/user/{id} are merged in by the useOrders hook.
 */
import React, { createContext, useCallback, useContext, useMemo, ReactNode } from 'react';
import { Order, OrdersAction, OrdersState } from '@/types/order';
import { initialOrdersState, ordersReducer } from '@/context/ordersReducer';
import { usePersistedReducer } from '@/hooks/usePersistedReducer';
import { useAuth } from '@/context/AuthContext';
import { STORAGE_KEYS } from '@/utils/storage';

interface OrdersContextType {
  /** Local orders of the signed-in user, newest first */
  localOrders: Order[];
  isHydrated: boolean;
  addOrder: (order: Order) => void;
  /** Cancel an order that is still processing */
  cancelOrder: (id: string) => void;
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

const EMPTY_ORDERS: Order[] = [];
const hydrateAction = (orders: Order[]): OrdersAction => ({ type: 'ORDERS_HYDRATE', payload: orders });
const selectOrders = (state: OrdersState): Order[] => state.orders;

export function OrdersProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [state, dispatch] = usePersistedReducer(ordersReducer, initialOrdersState, {
    storageKey: STORAGE_KEYS.ORDERS,
    emptyValue: EMPTY_ORDERS,
    toHydrateAction: hydrateAction,
    selectPersisted: selectOrders,
  });

  const userId = user?.id;
  const localOrders = useMemo(
    () => (userId === undefined ? EMPTY_ORDERS : state.orders.filter((o) => o.userId === userId)),
    [state.orders, userId]
  );

  const addOrder = useCallback(
    (order: Order) => dispatch({ type: 'ORDER_ADD', payload: order }),
    [dispatch]
  );

  const cancelOrder = useCallback(
    (id: string) =>
      dispatch({ type: 'ORDER_CANCEL', payload: { id, cancelledAt: new Date().toISOString() } }),
    [dispatch]
  );

  const value = useMemo(
    () => ({ localOrders, isHydrated: state.isHydrated, addOrder, cancelOrder }),
    [localOrders, state.isHydrated, addOrder, cancelOrder]
  );

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
}

export function useOrdersContext(): OrdersContextType {
  const context = useContext(OrdersContext);
  if (context === undefined) {
    throw new Error('useOrdersContext must be used within an OrdersProvider');
  }
  return context;
}