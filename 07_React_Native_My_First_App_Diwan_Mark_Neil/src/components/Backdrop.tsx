import { useEffect, useMemo, useRef, useState, type ComponentType, type ReactNode } from 'react';
import { Animated, Easing, Platform, StyleSheet, View, useWindowDimensions, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme';
import { usePalette } from '@/palette';

const isWeb = Platform.OS === 'web';
const native = !isWeb;

const SCENE_MS = 7000; // how long each scene stays
const FADE_MS = 2200; // cross-fade time

const blurWeb = (px: number) => (isWeb ? ({ filter: `blur(${px}px)` } as unknown as ViewStyle) : null);
const glowOf = (color: string, px: number): ViewStyle =>
  isWeb
    ? ({ boxShadow: `0 0 ${px}px ${color}` } as unknown as ViewStyle)
    : { shadowColor: color, shadowOpacity: 1, shadowRadius: px / 2, shadowOffset: { width: 0, height: 0 } };

/* ---------- small animation helpers ---------- */

// back-and-forth 0 -> 1 -> 0 (smooth)
function useSway(duration: number, delay = 0) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const t = (to: number) => Animated.timing(v, { toValue: to, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: native });
    const loop = Animated.loop(Animated.sequence([t(1), t(0)]));
    const id = setTimeout(() => loop.start(), delay);
    return () => {
      clearTimeout(id);
      loop.stop();
    };
  }, [v, duration, delay]);
  return v;
}

// endless linear 0 -> 1 that starts at `phase` so the sky is never empty at the start
function useRun(duration: number, phase = 0) {
  const v = useRef(new Animated.Value(phase)).current;
  useEffect(() => {
    let stopped = false;
    const run = (from: number) =>
      Animated.timing(v, { toValue: 1, duration: duration * (1 - from), easing: Easing.linear, useNativeDriver: native }).start(({ finished }) => {
        if (finished && !stopped) {
          v.setValue(0);
          run(0);
        }
      });
    v.setValue(phase);
    run(phase);
    return () => {
      stopped = true;
      v.stopAnimation();
    };
  }, [v, duration, phase]);
  return v;
}

const rand = (i: number, n: number) => {
  const x = Math.sin(i * 127.1 + n * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/* ---------- building blocks ---------- */

function Orb({
  size,
  colors,
  style,
  opacity = 0.5,
  travel = 30,
  duration = 9000,
}: {
  size: number;
  colors: readonly [string, string];
  style: ViewStyle;
  opacity?: number;
  travel?: number;
  duration?: number;
}) {
  const v = useSway(duration);
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        { position: 'absolute', width: size, height: size, borderRadius: size / 2, overflow: 'hidden', opacity },
        style,
        blurWeb(size / 8),
        { transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, travel] }) }] },
      ]}
    >
      <LinearGradient colors={colors} style={StyleSheet.absoluteFill} />
    </Animated.View>
  );
}

function Stars({ count = 70, seed = 0 }: { count?: number; seed?: number }) {
  const a = useSway(2200);
  const b = useSway(3100, 700);
  const stars = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        x: rand(i + seed, 1) * 100,
        y: rand(i + seed, 2) * 100,
        s: 1 + rand(i + seed, 3) * 2.2,
        g: i % 2,
      })),
    [count, seed],
  );
  const group = (g: number, v: Animated.Value) => (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.2, 1] }) }]}>
      {stars
        .filter((s) => s.g === g)
        .map((s, i) => (
          <View
            key={i}
            style={{ position: 'absolute', left: `${s.x}%`, top: `${s.y}%`, width: s.s, height: s.s, borderRadius: s.s, backgroundColor: '#fff' }}
          />
        ))}
    </Animated.View>
  );
  return (
    <>
      {group(0, a)}
      {group(1, b)}
    </>
  );
}

function ShootingStar({ top, left }: { top: `${number}%`; left: `${number}%` }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(5000),
        Animated.timing(v, { toValue: 1, duration: 1100, easing: Easing.linear, useNativeDriver: native }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [v]);
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top,
        left,
        width: 90,
        height: 2,
        borderRadius: 1,
        backgroundColor: '#fff',
        opacity: v.interpolate({ inputRange: [0, 0.1, 0.8, 1], outputRange: [0, 1, 1, 0] }),
        transform: [
          { translateX: v.interpolate({ inputRange: [0, 1], outputRange: [0, 260] }) },
          { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, 150] }) },
          { rotate: '30deg' },
        ],
      }}
    />
  );
}

function AuroraBand({ top, color, duration, delay = 0, tilt = -8 }: { top: `${number}%`; color: string; duration: number; delay?: number; tilt?: number }) {
  const v = useSway(duration, delay);
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          top,
          left: '-25%',
          width: '150%',
          height: 190,
          opacity: 0.55,
          transform: [
            { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [-20, 30] }) },
            { rotate: `${tilt}deg` },
            { scaleY: v.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1.25] }) },
          ],
        },
        blurWeb(18),
      ]}
    >
      <LinearGradient colors={[color + '00', color + 'cc', color + '00']} style={StyleSheet.absoluteFill} />
    </Animated.View>
  );
}

function Cloud({ top, scale = 1, duration, phase = 0, opacity = 0.9 }: { top: `${number}%`; scale?: number; duration: number; phase?: number; opacity?: number }) {
  const { width } = useWindowDimensions();
  const v = useRun(duration, phase);
  const puff = { position: 'absolute', backgroundColor: '#fff' } as const;
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          top,
          left: 0,
          width: 150,
          height: 50,
          opacity,
          transform: [{ translateX: v.interpolate({ inputRange: [0, 1], outputRange: [-220, width + 40] }) }, { scale }],
        },
        blurWeb(1.5),
      ]}
    >
      <View style={[puff, { left: 0, top: 6, width: 150, height: 44, borderRadius: 22 }]} />
      <View style={[puff, { left: 24, top: -14, width: 62, height: 62, borderRadius: 31 }]} />
      <View style={[puff, { left: 62, top: -26, width: 78, height: 78, borderRadius: 39 }]} />
    </Animated.View>
  );
}

function Bubble({ i }: { i: number }) {
  const { height } = useWindowDimensions();
  const size = 18 + rand(i, 4) * 46;
  const v = useRun(14000 + rand(i, 5) * 12000, rand(i, 6));
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: `${rand(i, 7) * 92}%`,
        bottom: -80,
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.9)',
        backgroundColor: 'rgba(255,255,255,0.35)',
        opacity: v.interpolate({ inputRange: [0, 0.1, 0.85, 1], outputRange: [0, 1, 1, 0] }),
        transform: [
          { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, -(height + 160)] }) },
          { translateX: v.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 24, 0] }) },
        ],
      }}
    />
  );
}

/* ---------- night scenes ---------- */

function StarryNight() {
  return (
    <>
      <LinearGradient colors={['#05070f', '#0b1330', '#1b1b4b']} style={StyleSheet.absoluteFill} />
      <Stars count={80} seed={1} />
      <ShootingStar top="10%" left="18%" />
      <View style={[{ position: 'absolute', top: '11%', right: '12%', width: 64, height: 64, borderRadius: 32, backgroundColor: '#f6f1d9' }, glowOf('rgba(246,241,217,0.55)', 50)]}>
        <View style={{ position: 'absolute', left: 14, top: 16, width: 14, height: 14, borderRadius: 7, backgroundColor: 'rgba(0,0,0,0.07)' }} />
        <View style={{ position: 'absolute', left: 36, top: 34, width: 10, height: 10, borderRadius: 5, backgroundColor: 'rgba(0,0,0,0.07)' }} />
      </View>
    </>
  );
}

function AuroraNight() {
  return (
    <>
      <LinearGradient colors={['#030712', '#06222b', '#0b1b3a']} style={StyleSheet.absoluteFill} />
      <Stars count={40} seed={9} />
      <AuroraBand top="14%" color="#34d399" duration={7000} />
      <AuroraBand top="30%" color="#22d3ee" duration={9000} delay={800} tilt={-4} />
      <AuroraBand top="46%" color="#a78bfa" duration={8000} delay={1500} tilt={-11} />
    </>
  );
}

function NebulaNight() {
  return (
    <>
      <LinearGradient colors={['#0b0618', '#2a0f4a', '#5b1a5e']} style={StyleSheet.absoluteFill} />
      <Stars count={55} seed={21} />
      <Orb size={340} colors={['#ec4899', '#7c3aed']} style={{ top: '6%', left: -90 }} opacity={0.45} travel={50} duration={10000} />
      <Orb size={300} colors={['#38bdf8', '#7c3aed']} style={{ bottom: '8%', right: -80 }} opacity={0.4} travel={-45} duration={12000} />
      <ShootingStar top="30%" left="45%" />
    </>
  );
}

/* ---------- day scenes ---------- */

function Sunrise() {
  const pulse = useSway(4500);
  return (
    <>
      <LinearGradient colors={['#fde7c8', '#fbc2c4', '#c9d6ff']} style={StyleSheet.absoluteFill} />
      <Animated.View
    style={{ ...StyleSheet.absoluteFill, transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] }) }] }}
        pointerEvents="none"
      >
        <Orb size={420} colors={['#fff3c4', '#ffb36b']} style={{ top: '4%', right: -120 }} opacity={0.55} travel={20} />
        <Orb size={150} colors={['#fffbe0', '#ffc46b']} style={{ top: '10%', right: 20 }} opacity={0.95} travel={14} />
      </Animated.View>
      <Cloud top="62%" scale={0.9} duration={60000} phase={0.3} opacity={0.65} />
    </>
  );
}

function SkyClouds() {
  return (
    <>
      <LinearGradient colors={['#7ec8ff', '#b9e3ff', '#eaf6ff']} style={StyleSheet.absoluteFill} />
      <Cloud top="12%" scale={1.2} duration={50000} phase={0.15} />
      <Cloud top="34%" scale={0.8} duration={38000} phase={0.55} opacity={0.8} />
      <Cloud top="58%" scale={1.4} duration={65000} phase={0.8} opacity={0.85} />
      <Cloud top="80%" scale={0.9} duration={45000} phase={0.35} opacity={0.7} />
    </>
  );
}

function PastelBubbles() {
  return (
    <>
      <LinearGradient colors={['#e0f2fe', '#ede9fe', '#fce7f3']} style={StyleSheet.absoluteFill} />
      <Orb size={320} colors={['#fbcfe8', '#c4b5fd']} style={{ top: '-4%', left: -100 }} opacity={0.5} travel={40} duration={11000} />
      <Orb size={300} colors={['#bae6fd', '#a7f3d0']} style={{ bottom: '4%', right: -90 }} opacity={0.5} travel={-40} duration={13000} />
      {Array.from({ length: 10 }, (_, i) => (
        <Bubble key={i} i={i} />
      ))}
    </>
  );
}

const NIGHT: ComponentType[] = [StarryNight, AuroraNight, NebulaNight];
const DAY: ComponentType[] = [Sunrise, SkyClouds, PastelBubbles];

/* ---------- cross-fading stack ---------- */

function SceneStack({ scenes }: { scenes: ComponentType[] }) {
  const ops = useRef(scenes.map((_, i) => new Animated.Value(i === 0 ? 1 : 0))).current;
  const [pos, setPos] = useState({ cur: 0, prev: -1 });

  useEffect(() => {
    const id = setInterval(() => setPos((p) => ({ cur: (p.cur + 1) % scenes.length, prev: p.cur })), SCENE_MS);
    return () => clearInterval(id);
  }, [scenes.length]);

  useEffect(() => {
    ops.forEach((o, i) => {
      Animated.timing(o, { toValue: i === pos.cur ? 1 : 0, duration: FADE_MS, easing: Easing.inOut(Easing.quad), useNativeDriver: native }).start();
    });
  }, [pos, ops]);

  return (
    <>
      {scenes.map((Scene, i) =>
        i === pos.cur || i === pos.prev ? (
          <Animated.View key={i} pointerEvents="none" style={[StyleSheet.absoluteFill, { opacity: ops[i] }]}>
            <Scene />
          </Animated.View>
        ) : null,
      )}
    </>
  );
}

/* ---------- Backdrop ---------- */

export default function Backdrop({ children }: { children: ReactNode }) {
  const theme = useTheme();
  const { palette } = usePalette();
  const drift = useSway(9000);
  const dark = theme.mode === 'dark';

  // Animated decorations depend on window size, which differs between the
  // server render and the browser. Render them only after mount to avoid
  // hydration mismatches.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const y1 = drift.interpolate({ inputRange: [0, 1], outputRange: [0, 40] });
  const y2 = drift.interpolate({ inputRange: [0, 1], outputRange: [0, -50] });
  const opacity = dark ? 0.3 : 0.18;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background, overflow: 'hidden' }}>
      {mounted && (
        <>
          {/* key = mode, so switching light/dark restarts with that mode's scenes */}
          <SceneStack key={theme.mode} scenes={dark ? NIGHT : DAY} />

          {/* soft scrim keeps text readable on top of the scenes */}
          <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: dark ? 'rgba(10,12,18,0.28)' : 'rgba(255,255,255,0.2)' }]} />

          {/* palette-colored orbs (your original ones) */}
          <Animated.View pointerEvents="none" style={[styles.orb, styles.orbTop, { opacity, transform: [{ translateY: y1 }] }, blurWeb(48)]}>
            <LinearGradient colors={[palette.gradient[0], palette.gradient[2]]} style={StyleSheet.absoluteFill} />
          </Animated.View>
          <Animated.View pointerEvents="none" style={[styles.orb, styles.orbBottom, { opacity, transform: [{ translateY: y2 }] }, blurWeb(48)]}>
            <LinearGradient colors={[palette.gradient[2], palette.gradient[1]]} style={StyleSheet.absoluteFill} />
          </Animated.View>
        </>
      )}

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  orb: { position: 'absolute', borderRadius: 999, overflow: 'hidden' },
  orbTop: { width: 340, height: 340, top: -110, right: -110 },
  orbBottom: { width: 380, height: 380, bottom: 40, left: -170 },
});