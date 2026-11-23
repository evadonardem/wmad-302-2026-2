/**
 * Checkout Screen Styles
 */
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#F8F9FA' },
  content: { padding: 16, paddingBottom: 32 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#202124', marginTop: 8, marginBottom: 8 },
  input: { backgroundColor: '#FFFFFF' },
  fieldGap: { marginBottom: 4 },
  paymentRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 8, paddingRight: 12 },
  paymentLabel: { fontSize: 15, color: '#202124' },
  summaryCard: { backgroundColor: '#FFFFFF', borderRadius: 8, padding: 16, marginTop: 8 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { fontSize: 14, color: '#5F6368' },
  summaryValue: { fontSize: 14, color: '#202124' },
  discountValue: { fontSize: 14, color: '#34A853' },
  divider: { height: 1, backgroundColor: '#E8EAED', marginVertical: 8 },
  totalLabel: { fontSize: 16, fontWeight: '600', color: '#202124' },
  totalValue: { fontSize: 18, fontWeight: '700', color: '#1A73E8' },
  submitButton: { marginTop: 20, borderRadius: 8 },
  submitContent: { height: 52 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#F8F9FA' },
  confirmTitle: { fontSize: 22, fontWeight: '700', color: '#202124', marginTop: 16 },
  confirmText: { fontSize: 14, color: '#5F6368', textAlign: 'center', marginTop: 8 },
  confirmId: { fontSize: 15, fontWeight: '600', color: '#1A73E8', marginTop: 12 },
  confirmButton: { marginTop: 16, alignSelf: 'stretch', borderRadius: 8 },
});
