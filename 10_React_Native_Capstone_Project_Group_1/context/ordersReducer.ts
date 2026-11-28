/**
 * Orders reducer (pure) - orders placed from this device.
 */
import { OrdersAction, OrdersState } from '@/types/order';

export const initialOrdersState: OrdersState = { orders: [], isHydrated: false };

export function ordersReducer(state: OrdersState, action: OrdersAction): OrdersState {
  switch (action.type) {
    case 'ORDERS_HYDRATE':
      return { orders: action.payload, isHydrated: true };
    case 'ORDER_ADD':
      // Newest first
      return { ...state, orders: [action.payload, ...state.orders] };
    case 'ORDER_CANCEL':
      // Only orders that are still processing can be cancelled
      return {
        ...state,
        orders: state.orders.map((order) =>
          order.id === action.payload.id && order.status === 'processing'
            ? { ...order, status: 'cancelled', cancelledAt: action.payload.cancelledAt }
            : order
        ),
      };

    default:
      return state;
  }
}