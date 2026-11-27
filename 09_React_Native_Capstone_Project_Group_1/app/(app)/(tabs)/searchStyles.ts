/**
 * Search Screen Styles - Croc Book
 */
import { StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  searchBarContainer: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 52,
    marginBottom: 4,
  },
  searchInput: {
    fontSize: 16,
    color: colors.text,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  clearButton: {
    padding: 4,
  },
  searchButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  filterSection: {
    marginBottom: 12,
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  resultsSection: {
    marginTop: 8,
    marginBottom: 8,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  loadingCenter: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  separator: {
    height: 0,
  },
});