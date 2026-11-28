/**
 * Categories Screen Styles
 */
import { StyleSheet } from 'react-native';
import { marketplaceCardShadow, marketplaceColors } from '@/constants/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: marketplaceColors.background,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 100,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: marketplaceColors.text,
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 16,
    color: marketplaceColors.muted,
    marginBottom: 20,
  },
  gridWrapper: {
    justifyContent: 'space-between',
  },
  gridContent: {
    paddingBottom: 28,
  },
  categoryCard: {
    width: '48%',
    marginBottom: 12,
    borderRadius: 15,
    ...marketplaceCardShadow,
  },
  card: {
    minHeight: 164,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: marketplaceColors.border,
    overflow: 'hidden',
  },
  cardContent: {
    minHeight: 162,
    paddingHorizontal: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: marketplaceColors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '700',
    color: marketplaceColors.text,
    textAlign: 'center',
    lineHeight: 22,
    minHeight: 22,
  },
  categoryCount: {
    fontSize: 12,
    color: marketplaceColors.muted,
    marginTop: 4,
  },
  separator: {
    height: 4,
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
    color: marketplaceColors.muted,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#EA4335',
    textAlign: 'center',
  },
  guideContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: marketplaceColors.primarySoft,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: marketplaceColors.border,
  },
  guideTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#75648A',
    marginBottom: 8,
  },
  guideText: {
    fontSize: 13,
    color: marketplaceColors.text,
    lineHeight: 20,
  },
});