/**
 * Search Screen Styles - Shared base
 */
import { StyleSheet } from 'react-native';

export default function Placeholder() {
  return null;
}

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E0F2FE',
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  searchBarContainer: {
    marginBottom: 16,
  },
  searchInput: {
    height: 52,
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#202124',
  },
  clearButton: {
    padding: 8,
  },
  searchButton: {
    backgroundColor: '#38BDF8',
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
    borderColor: '#BAE6FD',
    backgroundColor: '#F0F9FF',
  },
  filterChipSelected: {
    backgroundColor: '#38BDF8',
    borderColor: '#38BDF8',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#38BDF8',
  },
  filterChipTextSelected: {
    color: '#F0F9FF',
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
    borderColor: '#BAE6FD',
    backgroundColor: '#F0F9FF',
  },
  sortChipSelected: {
    backgroundColor: '#38BDF8',
    borderColor: '#38BDF8',
  },
  sortChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#38BDF8',
  },
  sortChipTextSelected: {
    color: '#F0F9FF',
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
    backgroundColor: '#F0F9FF',
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
    color: '#38BDF8',
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
    color: '#38BDF8',
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
    backgroundColor: '#E0F2FE',
  },
  cuisineChip: {
    backgroundColor: '#BAE6FD',
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
  guideContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#E0F2FE',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  guideTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#38BDF8',
    marginBottom: 8,
  },
  guideText: {
    fontSize: 13,
    color: '#3C4043',
    lineHeight: 20,
  },
});