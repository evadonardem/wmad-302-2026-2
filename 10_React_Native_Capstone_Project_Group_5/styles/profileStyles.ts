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
  guestTitle: {
    color: marketplaceColors.text,
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  guestDescription: {
    color: marketplaceColors.muted,
    fontSize: 14,
    lineHeight: 21,
    maxWidth: 300,
    marginTop: 8,
    textAlign: 'center',
  },
  guestActions: {
    width: '100%',
    maxWidth: 320,
    gap: 8,
    marginTop: 20,
  },
  guestButton: {
    borderRadius: 10,
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
  logoutDialog: {
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
  },
  logoutDialogHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  logoutDialogIcon: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    backgroundColor: '#FCECEE',
  },
  logoutDialogHeading: {
    marginLeft: 14,
  },
  logoutDialogEyebrow: {
    color: '#8D7D9E',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  logoutDialogTitle: {
    marginTop: 2,
    color: marketplaceColors.text,
    fontSize: 21,
    fontWeight: '700',
  },
  logoutDialogMessage: {
    color: marketplaceColors.muted,
    fontSize: 14,
    lineHeight: 21,
  },
  logoutDialogActions: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 8,
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