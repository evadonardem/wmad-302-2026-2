/**
 * Cart Screen Styles - Marketplace
 */
import { StyleSheet } from 'react-native';
import type { ThemeColors } from '@/constants/colors';

export const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textMuted,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginTop: 20,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textMuted,
    marginTop: 8,
    textAlign: 'center',
  },
  browseButton: {
    marginTop: 24,
    borderRadius: 8,
    height: 52,
  },
  buttonContent: {
    paddingHorizontal: 32,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 340, // Space for summary (it is taller with the coupon box)
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    elevation: 1,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: colors.surfaceMuted,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  itemPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  itemCurrentPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  itemOriginalPrice: {
    fontSize: 13,
    color: colors.textFaint,
    textDecorationLine: 'line-through',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    minWidth: 30,
    textAlign: 'center',
  },
  separator: {
    height: 8,
  },
  summaryContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    padding: 20,
    paddingBottom: 30,
    elevation: 8,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  couponRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  couponInput: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  couponButton: {
    borderRadius: 8,
  },
  couponApplied: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.successContainer,
    borderRadius: 8,
    paddingLeft: 10,
    marginBottom: 6,
  },
  couponAppliedText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: colors.success,
    marginLeft: 6,
  },
  couponError: {
    fontSize: 12,
    color: colors.errorText,
    marginBottom: 6,
  },
  couponHint: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.textMuted,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  discountValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.success,
  },
  summaryRowDivider: {
    height: 1,
    backgroundColor: colors.borderSubtle,
    marginVertical: 12,
  },
  summaryRowTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryLabelTotal: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  summaryValueTotal: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  checkoutButton: {
    borderRadius: 8,
    height: 52,
  },
  guideContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: colors.primaryContainer,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  guideTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 8,
  },
  guideText: {
    fontSize: 13,
    color: colors.textBody,
    lineHeight: 20,
  },
});