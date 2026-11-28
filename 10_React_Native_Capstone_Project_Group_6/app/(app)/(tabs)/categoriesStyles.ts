/**
 * Categories Screen Styles
 */
import { StyleSheet } from 'react-native';
import type { ThemeColors } from '@/constants/colors';

export const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 0, // the tab bar already sits below this screen; the list adds its own bottom space
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 16,
    color: colors.textMuted,
    marginBottom: 20,
  },
  gridWrapper: {
    justifyContent: 'space-between',
  },
  gridContent: {
    paddingBottom: 20,
  },
  categoryCard: {
    width: '48%',
    marginBottom: 16,
  },
  card: {
    borderRadius: 12,
    backgroundColor: colors.surface,
    flexGrow: 1, // cards in the same row match heights without stretching to the whole list
  },
  cardContent: {
    padding: 20,
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  categoryCount: {
    fontSize: 12,
    color: colors.textMuted,
  },
  separator: {
    height: 8,
    width: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textMuted,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    textAlign: 'center',
  },
  guideContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: colors.primaryContainer,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  guideTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primaryText,
    marginBottom: 8,
  },
  guideText: {
    fontSize: 13,
    color: colors.textBody,
    lineHeight: 20,
  },
});