/**
 * Search Screen Styles - Marketplace
 */
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  searchBarContainer: {
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    fontSize: 16,
  },
  searchOutline: {
    borderRadius: 12,
    borderColor: '#E0E0E0',
  },
  filterSection: {
    marginBottom: 14,
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5F6368',
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
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  chipSelected: {
    backgroundColor: '#1A73E8',
    borderColor: '#1A73E8',
  },
  chipText: {
    fontSize: 13,
    color: '#5F6368',
  },
  chipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priceInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  priceDash: {
    color: '#5F6368',
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
    color: '#202124',
    flexShrink: 1,
  },
  resultCard: {
    marginBottom: 0,
  },
  card: {
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#F1F3F4',
  },
  resultInfo: {
    flex: 1,
    marginLeft: 12,
  },
  resultCategory: {
    fontSize: 12,
    color: '#5F6368',
    textTransform: 'capitalize',
  },
  resultTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
    color: '#202124',
  },
  resultPrice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  currentPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A73E8',
  },
  originalPrice: {
    fontSize: 13,
    color: '#9AA0A6',
    textDecorationLine: 'line-through',
  },
  resultDetails: {
    fontSize: 12,
    color: '#5F6368',
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
    color: '#5F6368',
  },
  errorText: {
    color: '#EA4335',
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
    color: '#202124',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#5F6368',
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