import { StyleSheet, View } from 'react-native';
import QuoteOfTheDay from '@/components/QuoteOfTheDay';
import { useTheme } from '@/theme';

export default function HomeScreen() {
  const theme = useTheme();
  const isDark = theme.mode === 'dark';
  const washColor = isDark ? '#25344A' : '#E5ECFA';
  const accentColor = isDark ? '#25423D' : '#E2F2EB';

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View
        pointerEvents="none"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={StyleSheet.absoluteFill}
      >
        <View style={[styles.colorWash, { backgroundColor: washColor }]} />
        <View style={[styles.glow, styles.topGlow, { backgroundColor: theme.colors.primary }]} />
        <View style={[styles.glow, styles.topGlowInner, { backgroundColor: accentColor }]} />
        <View style={[styles.glow, styles.bottomGlow, { backgroundColor: theme.colors.accent }]} />
        <View style={[styles.ring, styles.topRing, { borderColor: theme.colors.primary }]} />
        <View style={[styles.ring, styles.topRingInner, { borderColor: theme.colors.primary }]} />
        <View style={[styles.ring, styles.bottomRing, { borderColor: theme.colors.accent }]} />
        <View style={[styles.spark, styles.sparkOne, { backgroundColor: theme.colors.primary }]} />
        <View style={[styles.spark, styles.sparkTwo, { backgroundColor: theme.colors.accent }]} />
        <View style={[styles.spark, styles.sparkThree, { backgroundColor: theme.colors.primary }]} />
      </View>
      <QuoteOfTheDay />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    overflow: 'hidden',
  },
  colorWash: {
    position: 'absolute',
    top: -220,
    left: -120,
    right: -120,
    height: 440,
    borderRadius: 220,
    opacity: 0.42,
  },
  glow: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    opacity: 0.12,
  },
  topGlow: {
    top: -155,
    right: -140,
  },
  topGlowInner: {
    width: 190,
    height: 190,
    borderRadius: 95,
    top: -70,
    right: -55,
    opacity: 0.11,
  },
  bottomGlow: {
    width: 340,
    height: 340,
    borderRadius: 170,
    bottom: -210,
    left: -165,
    opacity: 0.1,
  },
  ring: {
    position: 'absolute',
    width: 210,
    height: 210,
    borderRadius: 105,
    borderWidth: 1.5,
    opacity: 0.14,
  },
  topRing: {
    top: 32,
    left: -142,
  },
  topRingInner: {
    width: 158,
    height: 158,
    borderRadius: 79,
    top: 58,
    left: -116,
    opacity: 0.1,
  },
  bottomRing: {
    width: 184,
    height: 184,
    borderRadius: 92,
    bottom: 28,
    right: -124,
    opacity: 0.12,
  },
  spark: {
    position: 'absolute',
    width: 7,
    height: 7,
    borderRadius: 4,
    opacity: 0.32,
  },
  sparkOne: {
    top: '25%',
    right: '16%',
  },
  sparkTwo: {
    top: '38%',
    left: '8%',
    width: 5,
    height: 5,
  },
  sparkThree: {
    bottom: '22%',
    right: '11%',
    width: 4,
    height: 4,
  },
});
