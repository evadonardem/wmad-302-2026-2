/**
 * Festive brand banner shown at the top of the login and register screens.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Logo } from '@/components/Logo';
import { Snowfall } from '@/components/Snowfall';
import { christmas } from '@/constants/theme';

export function AuthBrandHeader({ tagline }: { tagline: string }) {
  return (
    <View style={styles.banner}>
      <Snowfall count={18} />
      <Logo size={112} />
      <Text style={styles.appName}>Marketplace</Text>
      <Text style={styles.tagline}>{tagline}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    alignItems: 'center',
    backgroundColor: christmas.red,
    borderRadius: 24,
    borderBottomWidth: 4,
    borderBottomColor: christmas.gold,
    marginBottom: 24,
    overflow: 'hidden',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  appName: { color: '#FFFFFF', fontSize: 30, fontWeight: '800', letterSpacing: -0.5, marginTop: 4 },
  tagline: { color: 'rgba(255,255,255,0.9)', fontSize: 15, marginTop: 4, textAlign: 'center' },
});
