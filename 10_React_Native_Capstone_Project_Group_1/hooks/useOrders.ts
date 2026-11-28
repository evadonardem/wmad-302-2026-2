/**
 * useOrders - merges orders placed on this device with the user's carts from
 * GET /carts/user/{id}.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useOrdersContext } from '@/context/OrdersContext';
import { productApi } from '@/services/productApi';
import { Order } from '@/types/order';
import { calculateOrderStats, cartToOrder, mergeOrders } from '@/utils/orders';
import { getErrorMessage } from '@/utils/errors';

export function useOrders() {
  const { user } = useAuth();
  const { localOrders } = useOrdersContext();
  const [remoteOrders, setRemoteOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userId = user?.id;

  const load = useCallback(
    async (isRefresh: boolean) => {
      if (userId === undefined) {
        setLoading(false);
        return;
      }
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      try {
        const carts = await productApi.getUserCarts(userId);
        setRemoteOrders(carts.map((cart) => cartToOrder(cart, userId)));
      } catch (err) {
        setError(getErrorMessage(err, 'Failed to load orders'));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [userId]
  );

  useEffect(() => {
    load(false);
  }, [load]);

  const orders = useMemo(() => mergeOrders(localOrders, remoteOrders), [localOrders, remoteOrders]);
  const stats = useMemo(() => calculateOrderStats(orders), [orders]);

  const refresh = useCallback(() => load(true), [load]);
  const retry = useCallback(() => load(false), [load]);

  return { orders, stats, loading, refreshing, error, refresh, retry };
}
