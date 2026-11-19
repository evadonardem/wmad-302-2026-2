/**
 * Search Screen Styles - Shared base
 */
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
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
    borderColor: '#E0E0E0',
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
    backgroundColor: '#EE4D2D',
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
    color: '#202124',
  },
  clearButton: {
    padding: 8,
  },
  searchButton: {
    backgroundColor: '#1A73E8',
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
    color: '#202124',
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
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  filterChipSelected: {
    backgroundColor: '#1A73E8',
    borderColor: '#1A73E8',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1A73E8',
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
    backgroundColor: '#1A73E8',
    borderColor: '#1A73E8',
  },
  sortChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1A73E8',
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
  resultCard: {
    marginBottom: 8,
  },
  card: {
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  resultContent: {
    flexDirection: 'row',
    padding: 12,
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
    color: '#202124',
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
    color: '#5F6368',
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
    color: '#202124',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#5F6368',
    marginTop: 4,
  },
  separator: {
    height: 8,
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
    backgroundColor: '#F1F6FE',
  },
  suggestionText: {
    color: '#1A73E8',
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
    borderColor: '#E0E0E0',
  },
  featuredImageContainer: {
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FA',
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
    backgroundColor: '#EE4D2D',
    fontSize: 9,
    fontWeight: '700',
  },
  featuredProductTitle: {
    minHeight: 36,
    fontSize: 13,
    fontWeight: '600',
    color: '#202124',
  },
  featuredPrice: {
    color: '#EE4D2D',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 6,
  },
  guideContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#E8F0FE',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D0E1F9',
  },
  guideTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A73E8',
    marginBottom: 8,
  },
  guideText: {
    fontSize: 13,
    color: '#3C4043',
    lineHeight: 20,
  },
});