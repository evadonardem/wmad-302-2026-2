/**
 * Profile Screen Styles - Croc Book
 */
import { StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    color: colors.textMuted,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 8,
  },
  avatar: {
    marginRight: 16,
    backgroundColor: colors.primaryLight,
  },
  nameContainer: {
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  username: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
    marginTop: 2,
  },
  email: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.primaryLight,
    borderRadius: 16,
    paddingVertical: 20,
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },
  section: {
    marginBottom: 16,
  },
  menuCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  divider: {
    marginLeft: 56,
  },
  logoutContainer: {
    marginTop: 24,
    marginBottom: 24,
  },
  logoutButton: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.error,
    height: 52,
  },
  logoutButtonContent: {
    paddingHorizontal: 24,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.error,
  },
  version: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  versionText: {
    fontSize: 12,
    color: colors.icon,
  },
});