/**
 * Search Screen Styles - Botanical Sage & Terracotta Theme
 */
import { StyleSheet } from 'react-native';
import { APP_COLORS } from '@/constants/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_COLORS.background,
    paddingHorizontal: 16,
  },
  searchBarContainer: {
    marginTop: 12,
    marginBottom: 14,
  },
  searchInput: {
    backgroundColor: APP_COLORS.surfaceElevated,
    fontSize: 15,
  },
  filterSection: {
    marginBottom: 14,
  },
  filterList: {
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
    backgroundColor: APP_COLORS.surface,
  },
  filterChipSelected: {
    backgroundColor: APP_COLORS.primary,
    borderColor: APP_COLORS.primary,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: APP_COLORS.textSecondary,
  },
  filterChipTextSelected: {
    color: '#FAF9F5',
    fontWeight: '700',
  },
  sortSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  resultsSection: {
    flex: 1,
  },
  resultsTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: APP_COLORS.textPrimary,
    marginBottom: 12,
  },
  resultsList: {
    paddingBottom: 100,
  },
  resultCard: {
    marginBottom: 10,
  },
  card: {
    borderRadius: 16,
    backgroundColor: APP_COLORS.surface,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
  },
  resultContent: {
    flexDirection: 'row',
    padding: 12,
  },
  resultImage: {
    width: 84,
    height: 84,
    borderRadius: 12,
    marginRight: 12,
  },
  resultInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  resultTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: APP_COLORS.textPrimary,
    marginBottom: 6,
  },
  resultMeta: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  difficultyChip: {
    backgroundColor: APP_COLORS.primaryContainer,
  },
  cuisineChip: {
    backgroundColor: APP_COLORS.chipBg,
  },
  resultDetails: {
    fontSize: 12,
    color: APP_COLORS.textSecondary,
    fontWeight: '600',
  },
  loadingCenter: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyState: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: APP_COLORS.textPrimary,
    marginTop: 14,
  },
  emptySubtext: {
    fontSize: 14,
    color: APP_COLORS.textSecondary,
    marginTop: 4,
  },
  separator: {
    height: 4,
  },
});