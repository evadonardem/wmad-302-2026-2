/**
 * Glassmorphism building blocks
 *
 *   <GlassBackground>      colorful gradient + soft blobs (glass needs something to blur)
 *   <GlassCard>            frosted panel: blur + translucent tint + light border
 *   <GlassIconButton>      round frosted icon button
 *
 * Requires: npx expo install expo-blur expo-linear-gradient
 */
import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

export const GLASS = {
  gradient: ['#FFE9D6', '#FFB98A', '#E9A6C4'] as const,
  text: '#3E2723',
  textMuted: '#6D4C41',
  accent: '#E85D04',
  border: 'rgba(255,255,255,0.55)',
  tint: 'rgba(255,255,255,0.28)',
};

interface GlassBackgroundProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function GlassBackground({ children, style }: GlassBackgroundProps) {
  return (
    <View style={[glass.fill, style]}>
      <LinearGradient
        colors={GLASS.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {/* Soft color blobs give the blur something to frost */}
      <View style={[glass.blob, glass.blobOne]} />
      <View style={[glass.blob, glass.blobTwo]} />
      <View style={[glass.blob, glass.blobThree]} />
      {children}
    </View>
  );
}

interface GlassCardProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  intensity?: number;
}

export function GlassCard({ children, style, contentStyle, intensity = 35 }: GlassCardProps) {
  return (
    <View style={[glass.card, style]}>
      <BlurView intensity={intensity} tint="light" style={StyleSheet.absoluteFill} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: GLASS.tint }]} />
      <View style={[glass.cardContent, contentStyle]}>{children}</View>
    </View>
  );
}

interface GlassIconButtonProps {
  icon: IconName;
  onPress: () => void;
  color?: string;
  label?: string;
  style?: StyleProp<ViewStyle>;
}

export function GlassIconButton({ icon, onPress, color, label, style }: GlassIconButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[glass.iconButton, style]}
    >
      <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFill} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: GLASS.tint }]} />
      <MaterialCommunityIcons name={icon} size={22} color={color ?? GLASS.text} />
    </TouchableOpacity>
  );
}

const glass = StyleSheet.create({
  fill: {
    flex: 1,
    overflow: 'hidden',
  },
  blob: {
    position: 'absolute',
    borderRadius: 999,
  },
  blobOne: {
    width: 260,
    height: 260,
    top: -60,
    right: -80,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  blobTwo: {
    width: 220,
    height: 220,
    top: 320,
    left: -90,
    backgroundColor: 'rgba(232,93,4,0.22)',
  },
  blobThree: {
    width: 280,
    height: 280,
    bottom: -100,
    right: -60,
    backgroundColor: 'rgba(142,68,173,0.18)',
  },
  card: {
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: GLASS.border,
  },
  cardContent: {
    padding: 16,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: GLASS.border,
  },
});
