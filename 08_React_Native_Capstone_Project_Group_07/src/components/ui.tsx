import { brand, fontFamily, glass, gradients, radius, shadow, titleTextStyle } from '@/theme';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import type { ComponentProps, ReactNode } from 'react';
import { Platform, StyleSheet, Text, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { Button, useTheme } from 'react-native-paper';

/* ------------------------------------------------------------------ */
/* TricolorBar: the blue / yellow / red accent bar                     */
/* ------------------------------------------------------------------ */
export function TricolorBar({ height = 8, style }: { height?: number; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.bar, { height }, style]}>
      <View style={[styles.stripe, { backgroundColor: brand.blue }]} />
      <View style={[styles.stripe, { backgroundColor: brand.yellow }]} />
      <View style={[styles.stripe, { backgroundColor: brand.red }]} />
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* GlassPanel: frosted panel with border, soft shadow, optional bar    */
/* ------------------------------------------------------------------ */
export function GlassPanel({
  children,
  style,
  accent = false,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Show the tricolor bar along the top edge */
  accent?: boolean;
}) {
  const theme = useTheme();

  return (
    <View style={[styles.panelShadow, shadow.soft, style]}>
      <BlurView intensity={30} tint={theme.dark ? 'dark' : 'light'} style={styles.panel}>
        {accent && <TricolorBar />}
        <View style={styles.panelContent}>{children}</View>
      </BlurView>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* ScreenBackground: four soft corner glows behind a screen            */
/* ------------------------------------------------------------------ */
// React Native has no radial gradients, so each glow is a diagonal linear gradient
// fading from a corner toward the center (same four colors as the web body background).
const glows = [
  { rgb: '47,107,255', alpha: 0.6, start: { x: 0, y: 0 }, end: { x: 0.9, y: 0.9 } }, // top-left blue
  { rgb: '252,209,22', alpha: 0.6, start: { x: 1, y: 0 }, end: { x: 0.1, y: 0.9 } }, // top-right yellow
  { rgb: '206,17,38', alpha: 0.5, start: { x: 1, y: 1 }, end: { x: 0.1, y: 0.1 } }, // bottom-right red
  { rgb: '56,189,248', alpha: 0.55, start: { x: 0, y: 1 }, end: { x: 0.9, y: 0.1 } }, // bottom-left sky
];

/** Place as the FIRST child of a screen; it sits behind everything else and ignores touches. */
export function ScreenBackground() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {glows.map((glow) => (
        <LinearGradient
          key={glow.rgb}
          colors={[`rgba(${glow.rgb},${glow.alpha})`, `rgba(${glow.rgb},0)`] as const}
          start={glow.start}
          end={glow.end}
          style={StyleSheet.absoluteFill}
        />
      ))}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* GradientButton: glossy pill around a Paper <Button>                 */
/* ------------------------------------------------------------------ */
type GradientButtonProps = {
  children: string;
  icon?: ComponentProps<typeof Button>['icon'];
  disabled?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
};

// Still a Paper <Button> (text mode, so Paper adds no background or elevation of its own);
// the gradient, gloss and glow come from the wrapper around it.
export function GradientButton({ children, icon, disabled, onPress, style, contentStyle }: GradientButtonProps) {
  // Disabled: soft glass with a dashed outline, clearly inactive
  if (disabled) {
    return (
      <View style={[styles.btnBase, styles.btnDisabled, style]}>
        <Button mode="text" icon={icon} disabled contentStyle={contentStyle} style={styles.btnInner}>
          {children}
        </Button>
      </View>
    );
  }

  return (
    // Shadow lives on the outer view so the gradient's overflow clipping doesn't cut it off
    <View style={[styles.btnBase, shadow.blue, style]}>
      <LinearGradient colors={gradients.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.btnGradient}>
        {/* Gloss highlight across the top half */}
        <LinearGradient
          colors={['rgba(255,255,255,0.28)', 'rgba(255,255,255,0)'] as const}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 0.55 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        <Button
          mode="text"
          icon={icon}
          textColor="#fff"
          onPress={onPress}
          contentStyle={contentStyle}
          style={styles.btnInner}
          labelStyle={styles.btnLabel}
        >
          {children}
        </Button>
      </LinearGradient>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* GradientTitle: gradient-filled title text                           */
/* ------------------------------------------------------------------ */
// Web: the same trick as `h1.MuiTypography-h3` in App.css (gradient clipped to the text).
// These CSS properties aren't in React Native's TextStyle type, hence the cast.
const webGradientText = {
  alignSelf: 'center',
  backgroundImage: `linear-gradient(90deg, ${gradients.title.join(', ')})`,
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  color: 'transparent',
} as unknown as TextStyle;

export function GradientTitle({ children }: { children: string }) {
  if (Platform.OS === 'web') {
    return <Text style={[titleTextStyle, webGradientText]}>{children}</Text>;
  }

  // Android / iOS: masked gradient. masked-view has no web support, so it is only loaded here
  // (not at the top of the file) and never runs in the browser.
  // eslint-disable-next-line
  const MaskedView = require('@react-native-masked-view/masked-view').default;

  return (
    <MaskedView
      maskElement={
        <View style={styles.titleMask}>
          <Text style={titleTextStyle}>{children}</Text>
        </View>
      }
    >
      <LinearGradient colors={gradients.title} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
        {/* Invisible copy of the text so the gradient takes the same size as the mask */}
        <Text style={[titleTextStyle, styles.titleHidden]}>{children}</Text>
      </LinearGradient>
    </MaskedView>
  );
}

const styles = StyleSheet.create({
  // TricolorBar
  bar: { flexDirection: 'row', width: '100%' },
  stripe: { flex: 1 },

  // GlassPanel
  panelShadow: { borderRadius: radius.panel },
  panel: {
    borderRadius: radius.panel,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: glass.border,
    // Also the fallback tint on platforms where the blur is unavailable
    backgroundColor: glass.fill,
  },
  panelContent: { padding: 20 },

  // GradientButton
  btnBase: { borderRadius: radius.pill },
  btnGradient: {
    borderRadius: radius.pill,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  btnDisabled: {
    backgroundColor: glass.fill,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: glass.borderDashed,
  },
  btnInner: { borderRadius: radius.pill },
  btnLabel: { fontFamily: fontFamily.semiBold, fontSize: 15, letterSpacing: 0.6 },

  // GradientTitle (native)
  titleMask: { backgroundColor: 'transparent' },
  titleHidden: { opacity: 0 },
});
