import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Animated, Platform, StyleSheet, View, type ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { useTheme } from 'react-native-paper';
import { getBackgroundPhotos } from '@/services/geoPhotoService';

const useNativeDriver = Platform.OS !== 'web';

// Scenic Philippine photos from Pexels (shared and cached, so every screen reuses one request)
export function useBackgroundPhotos(): string[] {
  const [photos, setPhotos] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    getBackgroundPhotos().then((urls) => {
      if (!cancelled) setPhotos(urls);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return photos;
}

// ---------- decoration data ----------

type Star = { left: `${number}%`; top: `${number}%`; size: number; group: 0 | 1 };

const rand = (seed: number, salt: number) => Math.abs(Math.sin(seed * salt) * 43758.5453) % 1;

const STARS: Star[] = Array.from({ length: 48 }, (_, i) => ({
  left: `${Math.round(rand(i + 1, 12.9898) * 100)}%` as const,
  top: `${Math.round(rand(i + 1, 78.233) * 100)}%` as const,
  size: 1.5 + Math.round(rand(i + 1, 39.346) * 2.5),
  group: (i % 2) as 0 | 1,
}));

const DOTS_A = Array.from({ length: 36 }, (_, i) => i);
const DOTS_B = Array.from({ length: 25 }, (_, i) => i);

// ---------- small building blocks ----------

// Soft glow made of stacked circles (works on every platform, no blur needed)
function Glow({
  size,
  color,
  opacity,
  style,
}: {
  size: number;
  color: string;
  opacity: number;
  style: ViewStyle;
}) {
  return (
    <View
      style={[
        { position: 'absolute', width: size, height: size, alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' },
        style,
      ]}
    >
      {[1, 0.78, 0.56, 0.34].map((scale) => (
        <View
          key={scale}
          style={{
            position: 'absolute',
            width: size * scale,
            height: size * scale,
            borderRadius: size,
            backgroundColor: color,
            opacity: opacity / 3,
          }}
        />
      ))}
    </View>
  );
}

// Two photo layers that cross-fade into each other every few seconds
function PhotoLayers({ urls, scrim }: { urls: string[]; scrim: string }) {
  const [slots, setSlots] = useState<number[]>([0, 1]);
  const opacities = useRef([new Animated.Value(1), new Animated.Value(0)]).current;
  const active = useRef(0);
  const current = useRef(0);

  useEffect(() => {
    if (urls.length < 2) return;
    Image.prefetch(urls);

    const timer = setInterval(() => {
      const next = (current.current + 1) % urls.length;
      const hidden = 1 - active.current;
      const visible = active.current;

      setSlots((previous) => {
        const copy = [...previous];
        copy[hidden] = next;
        return copy;
      });

      Animated.parallel([
        Animated.timing(opacities[hidden], { toValue: 1, duration: 1800, useNativeDriver }),
        Animated.timing(opacities[visible], { toValue: 0, duration: 1800, useNativeDriver }),
      ]).start();

      active.current = hidden;
      current.current = next;
    }, 9000);

    return () => clearInterval(timer);
  }, [urls, opacities]);

  return (
    <View style={StyleSheet.absoluteFill}>
      {[0, 1].map((layer) => (
        <Animated.View key={layer} style={[StyleSheet.absoluteFill, { opacity: opacities[layer] }]}>
          <Image
            source={{ uri: urls[slots[layer] % urls.length] }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
          />
        </Animated.View>
      ))}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: scrim }]} />
    </View>
  );
}

// ---------- the background ----------

// Page background: rotating Philippine photos under a tinted veil, glowing colours and
// decoration. Light mode gets a sunny pastel look; dark mode gets a starry night sky with a moon.
// It stays fixed behind the content while the page scrolls.
export default function AppBackground({ children }: { children: ReactNode }) {
  const theme = useTheme();
  const dark = theme.dark;
  const photos = useBackgroundPhotos();

  const base = dark ? '#050E11' : theme.colors.background;
  const scrim = dark ? 'rgba(5,14,17,0.74)' : 'rgba(236,247,249,0.86)';

  // Stars take turns brightening (dark mode only)
  const twinkle = useRef([new Animated.Value(0.35), new Animated.Value(1)]).current;
  useEffect(() => {
    if (!dark) return;
    const loops = twinkle.map((value, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(value, { toValue: index === 0 ? 1 : 0.3, duration: 2600 + index * 900, useNativeDriver }),
          Animated.timing(value, { toValue: index === 0 ? 0.3 : 1, duration: 2600 + index * 900, useNativeDriver }),
        ]),
      ),
    );
    loops.forEach((loop) => loop.start());
    return () => loops.forEach((loop) => loop.stop());
  }, [dark, twinkle]);

  return (
    <View style={[styles.root, { backgroundColor: base }]}>
      <View style={[StyleSheet.absoluteFill, styles.noTouch]}>
        {photos.length > 0 && <PhotoLayers key={photos.length} urls={photos} scrim={scrim} />}

        {/* Colour glows */}
        <Glow
          size={620}
          color={theme.colors.primary}
          opacity={dark ? 0.55 : 0.3}
          style={{ top: -240, left: -220 }}
        />
        <Glow
          size={520}
          color={theme.colors.secondary}
          opacity={dark ? 0.4 : 0.26}
          style={{ bottom: -220, right: -180 }}
        />
        <Glow
          size={380}
          color={theme.colors.primary}
          opacity={dark ? 0.32 : 0.18}
          style={{ top: '38%', right: -190 }}
        />

        {/* Dark mode: starry sky + moon. Light mode: a warm sun. */}
        {dark ? (
          <>
            {twinkle.map((opacity, group) => (
              <Animated.View key={group} style={[StyleSheet.absoluteFill, { opacity }]}>
                {STARS.filter((star) => star.group === group).map((star, index) => (
                  <View
                    key={index}
                    style={{
                      position: 'absolute',
                      left: star.left,
                      top: star.top,
                      width: star.size,
                      height: star.size,
                      borderRadius: star.size,
                      backgroundColor: '#FFFFFF',
                    }}
                  />
                ))}
              </Animated.View>
            ))}
            <Glow size={170} color="#FFE9B8" opacity={0.5} style={{ top: '40%', right: '3%' }} />
            <View style={styles.moon} />
          </>
        ) : (
          <>
            <Glow size={220} color="#FFC46B" opacity={0.7} style={{ top: '40%', right: '3%' }} />
            <View style={styles.sun} />
          </>
        )}

        {/* Dotted patterns */}
        <View style={[styles.dots, styles.dotsTop, { opacity: dark ? 0.4 : 0.28 }]}>
          {DOTS_A.map((i) => (
            <View key={i} style={[styles.dot, { backgroundColor: theme.colors.primary }]} />
          ))}
        </View>
        <View style={[styles.dots, styles.dotsBottom, { opacity: dark ? 0.32 : 0.22 }]}>
          {DOTS_B.map((i) => (
            <View key={i} style={[styles.dot, { backgroundColor: theme.colors.secondary }]} />
          ))}
        </View>
      </View>

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    overflow: 'hidden',
  },
  noTouch: {
    pointerEvents: 'none',
  },
  moon: {
    position: 'absolute',
    top: '40%',
    right: '3%',
    marginTop: 58,
    marginRight: 58,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FFF3D6',
  },
  sun: {
    position: 'absolute',
    top: '40%',
    right: '3%',
    marginTop: 83,
    marginRight: 83,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FFB347',
  },
  dots: {
    position: 'absolute',
    width: 108,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dotsTop: {
    top: 150,
    left: 24,
  },
  dotsBottom: {
    bottom: 60,
    right: 28,
    width: 90,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    margin: 7,
  },
});
