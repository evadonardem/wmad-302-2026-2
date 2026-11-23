/**
 * Order history + detail styles
 */
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  list: { padding: 16, paddingBottom: 32 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FA' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderId: { fontSize: 14, fontWeight: '600', color: '#202124', flexShrink: 1 },
  date: { fontSize: 12, color: '#5F6368', marginTop: 2 },
  thumbRow: { flexDirection: 'row', marginTop: 12 },
  thumb: { width: 48, height: 48, borderRadius: 8, backgroundColor: '#F1F3F4', marginRight: 8 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  meta: { fontSize: 13, color: '#5F6368' },
  total: { fontSize: 15, fontWeight: '700', color: '#1A73E8' },
  separator: { height: 12 },
  notice: { fontSize: 12, color: '#5F6368', textAlign: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#202124', marginTop: 16, marginBottom: 8 },
  line: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  lineImage: { width: 56, height: 56, borderRadius: 8, backgroundColor: '#F1F3F4', marginRight: 12 },
  lineInfo: { flex: 1 },
  lineTitle: { fontSize: 14, color: '#202124' },
  lineSub: { fontSize: 12, color: '#5F6368', marginTop: 2 },
  linePrice: { fontSize: 14, fontWeight: '600', color: '#202124' },
  box: { backgroundColor: '#FFFFFF', borderRadius: 8, padding: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  rowLabel: { fontSize: 14, color: '#5F6368' },
  rowValue: { fontSize: 14, color: '#202124', flexShrink: 1, textAlign: 'right' },
  discount: { fontSize: 14, color: '#34A853' },
  strong: { fontSize: 16, fontWeight: '700', color: '#1A73E8' },
});
