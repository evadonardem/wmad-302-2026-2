/**
 * Shared styles for Edit Profile, Addresses and Settings screens
 */
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#F8F9FA' },
  content: { padding: 16, paddingBottom: 32 },
  input: { backgroundColor: '#FFFFFF' },
  fieldGap: { marginBottom: 4 },
  button: { marginTop: 16, borderRadius: 8 },
  buttonContent: { height: 48 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, marginBottom: 12 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardTitle: { fontSize: 15, fontWeight: '600', color: '#202124' },
  cardText: { fontSize: 13, color: '#5F6368', marginTop: 4 },
  defaultTag: { fontSize: 11, color: '#34A853', fontWeight: '600', marginLeft: 8 },
  actions: { flexDirection: 'row', marginTop: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#202124', marginTop: 8, marginBottom: 8 },
  note: { fontSize: 12, color: '#5F6368', marginBottom: 12 },
});
