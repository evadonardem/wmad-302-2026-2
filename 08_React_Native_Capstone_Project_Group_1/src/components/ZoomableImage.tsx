import { useEffect, useRef, useState } from 'react';
import { Animated, PanResponder, StyleSheet, View, type GestureResponderEvent } from 'react-native';
import { Image } from 'expo-image';

// A photo you can pinch to zoom, drag around while zoomed, and double-tap to zoom in or out.
// When it is not zoomed, swiping left goes to the next photo and swiping right to the previous one.
// It uses only built-in React Native, so there is nothing extra to install.
const MAX_SCALE = 4;
const DOUBLE_TAP_ZOOM = 2.5;
const DOUBLE_TAP_MS = 300;
const SWIPE_DISTANCE = 70;

const touchDistance = (e: GestureResponderEvent) => {
  const [a, b] = e.nativeEvent.touches;
  return Math.hypot(a.pageX - b.pageX, a.pageY - b.pageY);
};

export default function ZoomableImage({
  uri,
  placeholderUri,
  altText,
  onSwipe,
}: {
  uri: string;
  placeholderUri?: string;
  altText?: string;
  // -1 = previous photo (swipe right), 1 = next photo (swipe left)
  onSwipe: (direction: -1 | 1) => void;
}) {
  const [scale] = useState(() => new Animated.Value(1));
  const [translate] = useState(() => new Animated.ValueXY());

  // Current gesture numbers (refs, because they change many times per second)
  const gesture = useRef({
    scale: 1,
    startScale: 1,
    startDistance: 0,
    x: 0,
    y: 0,
    startX: 0,
    startY: 0,
    lastTap: 0,
    moved: false,
  });
  const onSwipeRef = useRef(onSwipe);
  useEffect(() => {
    onSwipeRef.current = onSwipe;
  }, [onSwipe]);

  const [panResponder] = useState(() => {
    const springTo = (toScale: number) => {
      const g = gesture.current;
      g.scale = toScale;
      g.x = 0;
      g.y = 0;
      Animated.parallel([
        Animated.spring(scale, { toValue: toScale, useNativeDriver: false }),
        Animated.spring(translate, { toValue: { x: 0, y: 0 }, useNativeDriver: false }),
      ]).start();
    };

    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderGrant: () => {
        const g = gesture.current;
        g.startScale = g.scale;
        g.startDistance = 0;
        g.startX = g.x;
        g.startY = g.y;
        g.moved = false;
      },

      onPanResponderMove: (e, state) => {
        const g = gesture.current;
        const touches = e.nativeEvent.touches ?? [];

        // Two fingers: pinch to zoom
        if (touches.length >= 2) {
          g.moved = true;
          const distance = touchDistance(e);
          if (g.startDistance === 0) {
            g.startDistance = distance;
            g.startScale = g.scale;
            return;
          }
          g.scale = Math.min(MAX_SCALE, Math.max(1, (g.startScale * distance) / g.startDistance));
          scale.setValue(g.scale);
          return;
        }

        if (Math.abs(state.dx) > 4 || Math.abs(state.dy) > 4) g.moved = true;

        if (g.scale > 1.02) {
          // Zoomed in: drag the photo around
          g.x = g.startX + state.dx;
          g.y = g.startY + state.dy;
          translate.setValue({ x: g.x, y: g.y });
        } else {
          // Not zoomed: the photo follows the finger sideways (swipe)
          translate.setValue({ x: state.dx, y: 0 });
        }
      },

      onPanResponderRelease: (_e, state) => {
        const g = gesture.current;

        // A tap (no movement): two taps in a row zoom in or back out
        if (!g.moved) {
          const now = Date.now();
          if (now - g.lastTap < DOUBLE_TAP_MS) {
            g.lastTap = 0;
            springTo(g.scale > 1.05 ? 1 : DOUBLE_TAP_ZOOM);
          } else {
            g.lastTap = now;
          }
          return;
        }

        if (g.scale < 1.05) {
          // Not zoomed: a long enough sideways swipe changes the photo
          const swiped = Math.abs(state.dx) > SWIPE_DISTANCE && Math.abs(state.dx) > Math.abs(state.dy);
          springTo(1);
          if (swiped) onSwipeRef.current(state.dx < 0 ? 1 : -1);
        }
        // Zoomed in: stay where it is
      },

      onPanResponderTerminate: () => {
        if (gesture.current.scale < 1.05) springTo(1);
      },
    });
  });

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <Animated.View
        style={[
          styles.fill,
          { transform: [{ translateX: translate.x }, { translateY: translate.y }, { scale }] },
        ]}
      >
        <Image
          source={{ uri }}
          placeholder={placeholderUri ? { uri: placeholderUri } : undefined}
          cachePolicy="memory-disk"
          style={styles.fill}
          contentFit="contain"
          transition={200}
          accessibilityLabel={altText}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#000000',
  },
  fill: {
    flex: 1,
    width: '100%',
  },
});