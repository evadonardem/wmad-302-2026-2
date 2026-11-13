/**
 * Search Screen Styles - Shared base
 */
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFDF8',
  },
  content: {
    flexGrow: 1,
    alignItems: 'stretch',
    paddingHorizontal: 16,
    paddingBottom: 100,
    minWidth: 0,
  },
  searchBarContainer: {
    marginBottom: 16,
  },
  searchInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    minHeight: 52,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    height: 52,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 0,
    paddingHorizontal: 16,
    marginRight: 8,
    fontSize: 16,
    color: '#3E2723',
  },
  clearButton: {
    padding: 8,
  },
  searchButton: {
    backgroundColor: '#E85D04',
    borderRadius: 12,
    minWidth: 92,
    height: 44,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginRight: 4,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
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
    color: '#3E2723',
    marginBottom: 12,
  },
  filterList: {
    paddingHorizontal: 4,
    gap: 8,
  },
  difficultyFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  filterChipSelected: {
    backgroundColor: '#E85D04',
    borderColor: '#E85D04',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#E85D04',
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
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  sortChipSelected: {
    backgroundColor: '#E85D04',
    borderColor: '#E85D04',
  },
  sortChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#E85D04',
  },
  sortChipTextSelected: {
    color: '#FFFFFF',
  },
  resultsSection: {
    marginTop: 8,
    minWidth: 0,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3E2723',
    marginBottom: 16,
  },
  resultsList: {
    paddingBottom: 20,
  },
  resultCard: {
    alignSelf: 'stretch',
    marginBottom: 8,
    minWidth: 0,
  },
  card: {
    width: '100%',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  resultContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    minWidth: 0,
  },
  resultImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  resultInfo: {
    flex: 1,
    justifyContent: 'center',
    minWidth: 0,
  },
  resultCategory: {
    fontSize: 11,
    color: '#1A73E8',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  resultTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3E2723',
    marginBottom: 4,
  },
  resultPrice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  currentPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A73E8',
  },
  originalPrice: {
    fontSize: 13,
    color: '#9E9E9E',
    textDecorationLine: 'line-through',
  },
  resultMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
    color: '#8D6E63',
    flexShrink: 1,
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
    color: '#3E2723',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#8D6E63',
    marginTop: 4,
  },
  errorText: {
    fontSize: 14,
    color: '#C62828',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 8,
  },
  footerContainer: {
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  separator: {
    height: 8,
  },
  guideContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFCC80',
  },
  guideTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E85D04',
    marginBottom: 8,
  },
  guideText: {
    fontSize: 13,
    color: '#5D4037',
    lineHeight: 20,
  },
});