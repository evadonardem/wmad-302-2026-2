/**
 * Categories Screen Styles - Botanical Sage & Terracotta Theme
 */
import { StyleSheet } from 'react-native';
import { APP_COLORS } from '@/constants/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_COLORS.background,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: APP_COLORS.textPrimary,
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 14,
    color: APP_COLORS.textSecondary,
    marginBottom: 18,
  },
  gridWrapper: {
    justifyContent: 'space-between',
  },
  gridContent: {
    paddingBottom: 100,
  },
  categoryCard: {
    width: '48%',
    marginBottom: 14,
  },
  card: {
    borderRadius: 18,
    backgroundColor: APP_COLORS.surface,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
  },
  cardContent: {
    padding: 18,
    alignItems: 'center',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: APP_COLORS.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '800',
    color: APP_COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  categoryCount: {
    fontSize: 12,
    color: APP_COLORS.accent,
    fontWeight: '700',
  },
  separator: {
    height: 4,
    width: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: APP_COLORS.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: APP_COLORS.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: APP_COLORS.background,
    paddingHorizontal: 24,
  },
  errorText: {
    fontSize: 16,
    color: APP_COLORS.accent,
    textAlign: 'center',
  },
});