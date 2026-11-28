/**
 * Profile Screen Styles - Shared
 */
import { StyleSheet } from 'react-native';

export default function Placeholder() {
  return null;
}

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E0F2FE',
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
    backgroundColor: '#E0F2FE',
  },
  nameContainer: {
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#202124',
  },
  username: {
    fontSize: 14,
    color: '#38BDF8',
    fontWeight: '500',
    marginTop: 2,
  },
  email: {
    fontSize: 13,
    color: '#5F6368',
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#E0F2FE',
    borderRadius: 12,
    paddingVertical: 20,
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#38BDF8',
  },
  statLabel: {
    fontSize: 12,
    color: '#5F6368',
    marginTop: 4,
  },
  section: {
    marginBottom: 16,
  },
  menuCard: {
    borderRadius: 12,
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
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0284C7',
    height: 52,
  },
  logoutButtonContent: {
    paddingHorizontal: 24,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0284C7',
  },
  guideContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#E0F2FE',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  guideTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#38BDF8',
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
    color: '#BAE6FD',
  },
});