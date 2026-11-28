/**
 * Snowfall - a light, decorative falling-snow overlay.
 * - Put it inside a container with `overflow: 'hidden'` and a coloured (not white) background.
 * - Uses the native animation driver, ignores touches, and is skipped when the
 *   device's "reduce motion" setting is on.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, LayoutChangeEvent, StyleSheet, View } from 'react-native';

interface FlakeConfig {
  id: number;
  left: number; // 0..1 of the container width
  size: number;
  duration: number;
  drift: number;
  offset: number; // 0..1 starting point so flakes don't all start at the top
  opacity: number;
}

/** Fixed pseudo-random values (no Math.random) so renders are stable. */
function buildFlakes(count: number): FlakeConfig[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: ((i * 37) % 100) / 100,
    size: 3 + ((i * 7) % 4),
    duration: 5000 + ((i * 613) % 4000),
    drift: (i % 2 === 0 ? 1 : -1) * (8 + ((i * 5) % 18)),
    offset: ((i * 53) % 100) / 100,
    opacity: 0.55 + ((i * 11) % 40) / 100,
  }));
}

function Flake({ config, height }: { config: FlakeConfig; height: number }) {
  const progress = useRef(new Animated.Value(config.offset)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration: config.duration,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [progress, config.duration]);

  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [-12, height + 12] });
  const translateX = progress.interpolate({ inputRange: [0, 1], outputRange: [0, config.drift] });

  return (
    <Animated.View
      style={[
        styles.flake,
        {
          left: `${config.left * 100}%`,
          width: config.size,
          height: config.size,
          borderRadius: config.size / 2,
          opacity: config.opacity,
          transform: [{ translateY }, { translateX }],
        },
      ]}
    />
  );
}

export function Snowfall({ count = 16 }: { count?: number }) {
  const [height, setHeight] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const flakes = useMemo(() => buildFlakes(count), [count]);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (mounted) setReduceMotion(enabled);
      })
      .catch(() => undefined);
    return () => {
      mounted = false;
    };
  }, []);

  if (reduceMotion) return null;

  return (
    <View
      pointerEvents="none"
      style={StyleSheet.absoluteFill}
      onLayout={(e: LayoutChangeEvent) => setHeight(e.nativeEvent.layout.height)}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {height > 0 && flakes.map((flake) => <Flake key={flake.id} config={flake} height={height} />)}
    </View>
  );
}

const styles = StyleSheet.create({
  flake: { position: 'absolute', top: 0, backgroundColor: '#FFFFFF' },
});
