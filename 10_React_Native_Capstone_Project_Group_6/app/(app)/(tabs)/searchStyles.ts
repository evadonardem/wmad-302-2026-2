/**
 * Search Screen Styles - Marketplace
 */
import { StyleSheet } from 'react-native';
import type { ThemeColors } from '@/constants/colors';

export const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  searchBarContainer: {
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: colors.surface,
    fontSize: 16,
  },
  searchOutline: {
    borderRadius: 12,
    borderColor: colors.border,
  },
  filterSection: {
    marginBottom: 14,
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 8,
  },
  chipRow: {
    gap: 8,
    paddingRight: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  chipTextSelected: {
    color: colors.onPrimary,
    fontWeight: '600',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priceInput: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  priceDash: {
    color: colors.textMuted,
    fontSize: 16,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 8,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    flexShrink: 1,
  },
  resultCard: {
    marginBottom: 0,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
  },
  resultContent: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
  },
  resultImage: {
    width: 88,
    height: 88,
    borderRadius: 8,
    backgroundColor: colors.surfaceMuted,
  },
  resultInfo: {
    flex: 1,
    marginLeft: 12,
  },
  resultCategory: {
    fontSize: 12,
    color: colors.textMuted,
    textTransform: 'capitalize',
  },
  resultTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
    color: colors.text,
  },
  resultPrice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  currentPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  originalPrice: {
    fontSize: 13,
    color: colors.textFaint,
    textDecorationLine: 'line-through',
  },
  resultDetails: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  addButton: {
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  loadingCenter: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: colors.textMuted,
  },
  errorText: {
    color: colors.error,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 4,
    marginBottom: 16,
    textAlign: 'center',
  },
  separator: {
    height: 10,
  },
  footerSpace: {
    height: 24,
  },
});