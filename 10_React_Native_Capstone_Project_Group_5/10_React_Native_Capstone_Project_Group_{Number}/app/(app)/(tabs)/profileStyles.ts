/**
 * Profile Screen Styles - Shared
 */
import { StyleSheet } from 'react-native';
import { marketplaceColors } from '@/constants/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: marketplaceColors.background,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 120,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notLoggedIn: {
    fontSize: 16,
    color: '#5F6368',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 8,
  },
  avatar: {
    marginRight: 16,
    backgroundColor: '#F2EEF5',
  },
  nameContainer: {
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: marketplaceColors.text,
  },
  username: {
    fontSize: 14,
    color: '#75648A',
    fontWeight: '500',
    marginTop: 2,
  },
  email: {
    fontSize: 13,
    color: marketplaceColors.muted,
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: marketplaceColors.border,
    paddingVertical: 20,
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: marketplaceColors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: marketplaceColors.muted,
    marginTop: 4,
  },
  section: {
    marginBottom: 16,
  },
  menuCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: marketplaceColors.border,
  },
  divider: {
    marginLeft: 56,
  },
  logoutContainer: {
    marginTop: 24,
    marginBottom: 24,
  },
  logoutButton: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: marketplaceColors.primary,
    height: 52,
  },
  logoutButtonContent: {
    paddingHorizontal: 24,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#75648A',
  },
  guideContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#F2EEF5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DCD4E5',
  },
  guideTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#75648A',
    marginBottom: 8,
  },
  guideText: {
    fontSize: 13,
    color: '#3C4043',
    lineHeight: 20,
  },
  version: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  versionText: {
    fontSize: 12,
    color: '#DADCE0',
  },
});