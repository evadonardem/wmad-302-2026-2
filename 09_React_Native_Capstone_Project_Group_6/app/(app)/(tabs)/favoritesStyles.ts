/**
 * Favorites Screen Styles - Cookbook
 * Only hex colors already used elsewhere in the project, so useThemedStyles
 * can convert them for dark mode. Theme-exact colors are set in favorites.tsx.
 */
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFDF8',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 100, // Space for tab bar
  },

  // Header
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#8D6E63',
    marginTop: 4,
  },

  // List
  favoriteCard: {
    marginBottom: 8,
  },
  separator: {
    height: 8,
  },
});