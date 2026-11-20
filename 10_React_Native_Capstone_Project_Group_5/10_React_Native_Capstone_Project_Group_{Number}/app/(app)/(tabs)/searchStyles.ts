/**
 * Search Screen Styles - Shared base
 */
import { StyleSheet } from 'react-native';
import { marketplaceCardShadow, marketplaceColors } from '@/constants/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: marketplaceColors.background,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  homeButton: {
    width: 34,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  searchField: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: marketplaceColors.border,
  },
  searchHeader: {
    marginHorizontal: 16,
    marginTop: 8,
  },
  searchContent: {
    flex: 1,
  },
  headerAction: {
    width: 30,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerToggle: {
    width: 28,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  headerActionBadge: {
    position: 'absolute',
    top: 0,
    right: -1,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 3,
    borderRadius: 8,
    backgroundColor: '#75648A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActionBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    height: 50,
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
    fontSize: 16,
    color: marketplaceColors.text,
  },
  clearButton: {
    padding: 8,
  },
  searchActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchButton: {
    backgroundColor: '#75648A',
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  filterSection: {
    marginBottom: 20,
  },
  sortSection: {
    marginBottom: 20,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: marketplaceColors.text,
    marginBottom: 12,
  },
  filterList: {
    paddingHorizontal: 4,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: marketplaceColors.border,
    backgroundColor: '#FFFFFF',
  },
  filterChipSelected: {
    backgroundColor: '#75648A',
    borderColor: '#75648A',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#75648A',
  },
  filterChipTextSelected: {
    color: '#FFFFFF',
  },
  sortOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sortChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: marketplaceColors.border,
    backgroundColor: '#FFFFFF',
  },
  sortChipSelected: {
    backgroundColor: '#75648A',
    borderColor: '#75648A',
  },
  sortChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#75648A',
  },
  sortChipTextSelected: {
    color: '#FFFFFF',
  },
  resultsSection: {
    marginTop: 8,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#202124',
    marginBottom: 16,
  },
  resultsList: {
    paddingBottom: 20,
  },
  productRow: {
    justifyContent: 'space-between',
  },
  resultMeta: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 4,
  },
  difficultyChip: {
    backgroundColor: '#FFF3E0',
  },
  cuisineChip: {
    backgroundColor: '#E8F5E9',
  },
  resultDetails: {
    fontSize: 12,
    color: marketplaceColors.muted,
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
    fontWeight: '600',
    color: marketplaceColors.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: marketplaceColors.muted,
    marginTop: 4,
  },
  suggestionsContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#202124',
    marginBottom: 12,
  },
  suggestionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F2EEF5',
  },
  suggestionText: {
    color: '#75648A',
    fontSize: 13,
    fontWeight: '500',
  },
  featuredSection: {
    marginTop: 20,
  },
  featuredTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#202124',
    marginBottom: 12,
  },
  featuredLoading: {
    paddingVertical: 24,
  },
  featuredList: {
    gap: 12,
    paddingBottom: 4,
  },
  featuredCard: {
    width: 140,
    padding: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: marketplaceColors.border,
    ...marketplaceCardShadow,
  },
  featuredImageContainer: {
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: marketplaceColors.background,
    borderRadius: 8,
    marginBottom: 8,
  },
  featuredImage: {
    width: '90%',
    height: '90%',
  },
  featuredBadge: {
    position: 'absolute',
    top: 5,
    left: 5,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    overflow: 'hidden',
    color: '#FFFFFF',
    backgroundColor: '#75648A',
    fontSize: 9,
    fontWeight: '700',
  },
  featuredProductTitle: {
    minHeight: 36,
    fontSize: 13,
    fontWeight: '600',
    color: marketplaceColors.text,
  },
  featuredPrice: {
    color: '#75648A',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 6,
  },
  guideContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: marketplaceColors.primarySoft,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: marketplaceColors.border,
  },
  guideTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#75648A',
    marginBottom: 8,
  },
  guideText: {
    fontSize: 13,
    color: marketplaceColors.text,
    lineHeight: 20,
  },
});