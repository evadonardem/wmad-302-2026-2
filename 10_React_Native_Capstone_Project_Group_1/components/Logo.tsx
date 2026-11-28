/**
 * App logo (pixel-art crocodile in a Santa suit).
 * assets/logo.png is pre-scaled with nearest-neighbour so the pixel art stays crisp.
 */
import React from 'react';
import { StyleProp } from 'react-native';
import { Image, ImageStyle } from 'expo-image';

interface LogoProps {
  size?: number;
  style?: StyleProp<ImageStyle>;
}

export function Logo({ size = 96, style }: LogoProps) {
  return (
    <Image
      source={require('../assets/logo.png')}
      style={[{ width: size, height: size }, style]}
      contentFit="contain"
      accessibilityLabel="Marketplace logo"
    />
  );
}
