import { useEffect, useRef } from 'react';
import { Animated, Easing, Platform, StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, RadialGradient, Rect, Stop } from 'react-native-svg';

type BlobProps = {
  id: string;
  color: string;
  size: number;
  top: `${number}%`;
  left: `${number}%`;
  dx: number;
  dy: number;
  duration: number;
  opacity: number;
};

function Blob({ id, color, size, top, left, dx, dy, duration, opacity }: BlobProps) {
  const t = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(t, {
          toValue: 1,
          duration,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(t, {
          toValue: 0,
          duration,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [t, duration]);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top,
        left,
        width: size,
        height: size,
        opacity,
        transform: [
          { translateX: t.interpolate({ inputRange: [0, 1], outputRange: [0, dx] }) },
          { translateY: t.interpolate({ inputRange: [0, 1], outputRange: [0, dy] }) },
          { scale: t.interpolate({ inputRange: [0, 1], outputRange: [1, 1.3] }) },
        ],
      }}
    >
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id={id} cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={color} stopOpacity={1} />
            <Stop offset="100%" stopColor={color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect width={size} height={size} fill={`url(#${id})`} />
      </Svg>
    </Animated.View>
  );
}

export default function AuroraBackground({ isDark }: { isDark: boolean }) {
  const stops = isDark
    ? ['#070b1a', '#14213d', '#2a1245', '#0b2a3a']
    : ['#dbe9ff', '#fff3c9', '#ffd9e0', '#d4f5f0'];
  const blobOpacity = isDark ? 0.55 : 0.45;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width="100%" height="100%">
        <Defs>
          <LinearGradient id="auroraBase" x1="0" y1="0" x2="1" y2="1">
            {stops.map((c, i) => (
              <Stop key={c} offset={`${(i / (stops.length - 1)) * 100}%`} stopColor={c} />
            ))}
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#auroraBase)" />
      </Svg>

      <Blob id="blobBlue" color="#0038A8" size={420} top="-10%" left="-25%" dx={160} dy={120} duration={9000} opacity={blobOpacity} />
      <Blob id="blobRed" color="#CE1126" size={360} top="45%" left="45%" dx={-140} dy={-90} duration={11000} opacity={blobOpacity} />
      <Blob id="blobYellow" color="#FCD116" size={340} top="5%" left="55%" dx={-100} dy={160} duration={13000} opacity={blobOpacity} />
      <Blob id="blobTeal" color="#00C2B8" size={380} top="60%" left="-20%" dx={140} dy={-120} duration={12000} opacity={blobOpacity} />
    </View>
  );
}