/**
 * Home Screen Styles - Croc Book
 */
import { StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';

export const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  welcomeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  welcomeTextContainer: {
    flex: 1,
    paddingRight: 12,
  },
  welcomeGreeting: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.onPrimary,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: colors.primaryLight,
    marginTop: 4,
  },
  welcomeAvatar: {
    backgroundColor: colors.surface,
    borderRadius: 40,
    padding: 4,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  seeAll: {
    padding: 4,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  cardSeparator: {
    height: 0,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    padding: 16,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: colors.background,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    marginTop: 8,
  },
});