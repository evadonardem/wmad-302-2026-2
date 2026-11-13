/**
 * Categories Screen Styles - Cookbook
 * Only hex colors already used elsewhere in the project, so useThemedStyles
 * can convert them for dark mode. Theme-exact colors are set in categories.tsx.
 */
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFDF8',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFFDF8',
  },
  centerText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8D6E63',
    textAlign: 'center',
  },
  retry: {
    marginTop: 16,
    borderRadius: 999,
  },

  // Header
  pageTitle: {
    fontSize: 26,
    fontWeight: '800',
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#8D6E63',
    marginTop: 4,
    marginBottom: 16,
  },

  // Meal types / Tags toggle
  toggleRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  toggle: {
    flex: 1,
    minHeight: 44, // comfortable thumb target
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3E2723',
  },

  // Grid
  gridContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 100, // Space for tab bar
  },
  gridWrapper: {
    gap: 12,
  },
  separator: {
    height: 12,
  },
  // maxWidth keeps a lone last tile from stretching across the whole row
  tile: {
    flex: 1,
    maxWidth: '48.5%',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  photo: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginBottom: 12,
  },
  iconCircle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3E2723',
    alignSelf: 'stretch',
    textAlign: 'center',
  },
  tileCount: {
    fontSize: 13,
    color: '#8D6E63',
    marginTop: 2,
  },
});