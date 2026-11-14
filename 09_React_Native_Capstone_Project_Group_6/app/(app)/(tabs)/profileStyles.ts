/**
 * Profile Screen Styles - Cookbook
 * Covers every key profile.tsx uses. Only hex colors already used elsewhere
 * in the project, so useThemedStyles can convert them for dark mode.
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFFDF8',
  },
  notLoggedIn: {
    fontSize: 16,
    color: '#8D6E63',
    textAlign: 'center',
  },

  // Header: centered avatar, name underneath
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    backgroundColor: '#E85D04',
    marginBottom: 14,
  },
  nameContainer: {
    alignItems: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: '800',
    color: '#3E2723',
    textAlign: 'center',
  },
  username: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E85D04',
    marginTop: 2,
  },
  email: {
    fontSize: 14,
    color: '#8D6E63',
    marginTop: 4,
  },

  // Stats: three equal rounded tiles
  statsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 20,
    backgroundColor: '#FFF3E0',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#3E2723',
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#8D6E63',
    marginTop: 2,
  },

  // Menu card
  section: {
    marginBottom: 24,
  },
  menuCard: {
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
  },
  divider: {
    marginHorizontal: 16,
  },

  // Logout (the button itself is styled in profile.tsx)
  logoutContainer: {
    marginBottom: 16,
  },
  version: {
    alignItems: 'center',
    marginTop: 8,
  },
  versionText: {
    fontSize: 13,
    color: '#8D6E63',
  },
});