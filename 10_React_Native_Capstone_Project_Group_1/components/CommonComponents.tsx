/**
 * Reusable UI components (all themed through React Native Paper)
 */
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  DimensionValue,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { Image } from 'expo-image';
import {
  ActivityIndicator,
  Badge,
  Button,
  Card,
  Dialog,
  IconButton,
  Portal,
  Text as PaperText,
  useTheme,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ProductSummary } from '@/types/product';
import { formatCategoryName, formatCurrency, getDiscountedPrice } from '@/utils/pricing';
import { spacing } from '@/constants/layout';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

// ---------------------------------------------------------------- ProductCard

interface ProductCardProps {
  product: ProductSummary;
  onPress: () => void;
  onAddToCart?: () => void;
  width?: number;
  style?: StyleProp<ViewStyle>;
}

export function ProductCard({ product, onPress, onAddToCart, width, style }: ProductCardProps) {
  const theme = useTheme();
  const hasDiscount = product.discountPercentage > 0;
  const outOfStock = product.stock <= 0;

  return (
    <TouchableOpacity
      style={[width ? { width } : styles.flexCard, style]}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={`${product.title}, ${formatCurrency(
        getDiscountedPrice(product.price, product.discountPercentage)
      )}`}
    >
      <Card style={styles.card} elevation={2}>
        <View style={[styles.imageContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
          <Image source={{ uri: product.thumbnail }} style={styles.productImage} contentFit="contain" transition={200} />
          {hasDiscount && (
            <Badge style={[styles.discountBadge, { backgroundColor: theme.colors.error }]}>
              {`-${Math.round(product.discountPercentage)}%`}
            </Badge>
          )}
        </View>
        <Card.Content style={styles.cardContent}>
          <Text style={[styles.category, { color: theme.colors.onSurfaceVariant }]} numberOfLines={1}>
            {formatCategoryName(product.category)}
          </Text>
          <Text style={[styles.productTitle, { color: theme.colors.onSurface }]} numberOfLines={2}>
            {product.title}
          </Text>
          <View style={styles.priceRow}>
            <Text style={[styles.currentPrice, { color: theme.colors.primary }]}>
              {formatCurrency(getDiscountedPrice(product.price, product.discountPercentage))}
            </Text>
            {hasDiscount && (
              <Text style={[styles.originalPrice, { color: theme.colors.onSurfaceVariant }]}>
                {formatCurrency(product.price)}
              </Text>
            )}
          </View>
          <View style={styles.footerRow}>
            <Text style={[styles.meta, { color: outOfStock ? theme.colors.error : theme.colors.onSurfaceVariant }]}>
              ⭐ {product.rating.toFixed(1)} · {outOfStock ? 'Out of stock' : 'In stock'}
            </Text>
            {onAddToCart && (
              <IconButton
                icon="cart-plus"
                size={22}
                mode="contained-tonal"
                disabled={outOfStock}
                onPress={onAddToCart}
                style={styles.addButton}
                accessibilityLabel={`Add ${product.title} to cart`}
              />
            )}
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
}

// -------------------------------------------------------------- CategoryChip

interface CategoryChipProps {
  label: string;
  selected?: boolean;
  onPress: () => void;
  icon?: IconName;
  style?: StyleProp<ViewStyle>;
}

export function CategoryChip({ label, selected = false, onPress, icon, style }: CategoryChipProps) {
  const theme = useTheme();
  const color = selected ? theme.colors.onPrimary : theme.colors.onSurface;
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? theme.colors.primary : theme.colors.surface,
          borderColor: selected ? theme.colors.primary : theme.colors.outline,
        },
        style,
      ]}
    >
      {icon && <MaterialCommunityIcons name={icon} size={16} color={color} style={styles.chipIcon} />}
      <Text style={[styles.chipText, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
}

// ------------------------------------------------------------ Loading / Empty

export function LoadingView({ message = 'Loading...' }: { message?: string }) {
  const theme = useTheme();
  return (
    <View style={styles.centered}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text style={[styles.centeredMessage, { color: theme.colors.onSurfaceVariant }]}>{message}</Text>
    </View>
  );
}

interface EmptyStateProps {
  icon: IconName;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, message, actionLabel, onAction }: EmptyStateProps) {
  const theme = useTheme();
  return (
    <View style={styles.centered}>
      <MaterialCommunityIcons name={icon} size={72} color={theme.colors.outline} />
      <Text style={[styles.centeredTitle, { color: theme.colors.onSurface }]}>{title}</Text>
      <Text style={[styles.centeredMessage, { color: theme.colors.onSurfaceVariant }]}>{message}</Text>
      {actionLabel && onAction && (
        <Button mode="contained" onPress={onAction} style={styles.centeredButton}>
          {actionLabel}
        </Button>
      )}
    </View>
  );
}

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <EmptyState
      icon="alert-circle-outline"
      title="Something went wrong"
      message={message}
      actionLabel={onRetry ? 'Try again' : undefined}
      onAction={onRetry}
    />
  );
}

// ------------------------------------------------------------------ Skeletons

interface SkeletonProps {
  height?: number;
  width?: DimensionValue;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

export function Skeleton({ height = 20, width = '100%', borderRadius = 8, style }: SkeletonProps) {
  const theme = useTheme();
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[{ height, width, borderRadius, opacity, backgroundColor: theme.colors.outlineVariant }, style]}
    />
  );
}

export function ProductCardSkeleton({ width }: { width?: number }) {
  return (
    <View style={[width ? { width } : styles.flexCard, styles.skeletonCard]}>
      <Skeleton height={130} borderRadius={8} />
      <Skeleton height={12} width="40%" style={styles.skeletonLine} />
      <Skeleton height={14} style={styles.skeletonLine} />
      <Skeleton height={16} width="60%" style={styles.skeletonLine} />
    </View>
  );
}

// ------------------------------------------------------------ QuantityStepper

interface QuantityStepperProps {
  value: number;
  min?: number;
  max: number;
  onChange: (value: number) => void;
}

export function QuantityStepper({ value, min = 1, max, onChange }: QuantityStepperProps) {
  const theme = useTheme();
  return (
    <View style={[styles.stepper, { borderColor: theme.colors.outline }]}>
      <IconButton
        icon="minus"
        size={22}
        disabled={value <= min}
        onPress={() => onChange(value - 1)}
        accessibilityLabel="Decrease quantity"
      />
      <Text style={[styles.stepperValue, { color: theme.colors.onSurface }]}>{value}</Text>
      <IconButton
        icon="plus"
        size={22}
        disabled={value >= max}
        onPress={() => onChange(value + 1)}
        accessibilityLabel="Increase quantity"
      />
    </View>
  );
}

// -------------------------------------------------------------- ConfirmDialog

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onDismiss: () => void;
}

/** Cross-platform confirmation (Alert.alert buttons don't work on web). */
export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  destructive = false,
  onConfirm,
  onDismiss,
}: ConfirmDialogProps) {
  const theme = useTheme();
  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>{title}</Dialog.Title>
        <Dialog.Content>
          <PaperText variant="bodyMedium">{message}</PaperText>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss}>Cancel</Button>
          <Button onPress={onConfirm} textColor={destructive ? theme.colors.error : undefined}>
            {confirmLabel}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

// ------------------------------------------------------------------- Styles

const styles = StyleSheet.create({
  flexCard: { flex: 1 },
  card: { borderRadius: 12, overflow: 'hidden', backgroundColor: '#FFFFFF' },
  imageContainer: { height: 140, alignItems: 'center', justifyContent: 'center' },
  productImage: { width: '100%', height: '100%' },
  discountBadge: { position: 'absolute', top: spacing.sm, left: spacing.sm, color: '#FFFFFF' },
  cardContent: { paddingHorizontal: spacing.sm, paddingTop: spacing.sm, paddingBottom: spacing.xs },
  category: { fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.4 },
  productTitle: { fontSize: 14, fontWeight: '600', marginTop: 2, minHeight: 36 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: spacing.xs },
  currentPrice: { fontSize: 16, fontWeight: '700' },
  originalPrice: { fontSize: 12, textDecorationLine: 'line-through', marginLeft: spacing.sm },
  footerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  meta: { fontSize: 11, flexShrink: 1 },
  addButton: { margin: 0 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: spacing.sm,
  },
  chipIcon: { marginRight: spacing.xs },
  chipText: { fontSize: 13, fontWeight: '500' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  centeredTitle: { fontSize: 18, fontWeight: '600', marginTop: spacing.lg, textAlign: 'center' },
  centeredMessage: { fontSize: 14, marginTop: spacing.sm, textAlign: 'center' },
  centeredButton: { marginTop: spacing.lg },
  skeletonCard: { padding: spacing.sm },
  skeletonLine: { marginTop: spacing.sm },
  stepper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 24 },
  stepperValue: { minWidth: 28, textAlign: 'center', fontSize: 16, fontWeight: '600' },
});
