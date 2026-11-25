/**
 * Search Screen Styles - Cookbook
 * Only hex colors already used elsewhere in the project, so useThemedStyles
 * can convert them for dark mode. Theme-exact colors are set in search.tsx.
 */
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFDF8',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 100, // Space for tab bar
  },

  pageTitle: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 16,
  },

  // Search bar
  searchBarContainer: {
    marginBottom: 20,
  },
  searchBar: {
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchInput: {
    fontSize: 15,
    color: '#3E2723',
  },

  // Filters
  filterGroup: {
    marginBottom: 16,
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8D6E63',
    marginBottom: 8,
  },
  // Rows run to the screen edges (cancels the list's side padding) so they swipe naturally
  pillScroll: {
    marginHorizontal: -16,
  },
  pillRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
  },
  pill: {
    minHeight: 44, // comfortable thumb target
    justifyContent: 'center',
    paddingHorizontal: 18,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  pillText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3E2723',
  },
  clearRow: {
    alignItems: 'flex-start',
    marginBottom: 4,
  },

  // Results
  resultsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3E2723',
    marginTop: 8,
    marginBottom: 16,
  },
  resultCard: {
    marginBottom: 8,
  },
  separator: {
    height: 8,
  },
  footer: {
    paddingVertical: 16,
  },
});