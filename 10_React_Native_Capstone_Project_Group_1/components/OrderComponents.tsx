/**
 * Small shared pieces for the order screens.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { Order, OrderStatus } from '@/types/order';
import { spacing } from '@/constants/layout';

const STATUS_LABEL: Record<OrderStatus, string> = {
  processing: 'Processing',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const theme = useTheme();
  const colors = {
    processing: { bg: theme.colors.primaryContainer, text: theme.colors.primary },
    completed: { bg: theme.colors.tertiaryContainer, text: theme.colors.tertiary },
    cancelled: { bg: theme.colors.surfaceVariant, text: theme.colors.onSurfaceVariant },
  }[status];
  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }]}>
      <Text style={[styles.badgeText, { color: colors.text }]}>{STATUS_LABEL[status]}</Text>
    </View>
  );
}

export function formatOrderDate(order: Order): string {
  if (!order.createdAt) return 'Previous order';
  return new Date(order.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function orderTitle(order: Order): string {
  return order.source === 'local' ? order.id : `Order #${order.cartId}`;
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: spacing.md, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 12, fontWeight: '700' },
});