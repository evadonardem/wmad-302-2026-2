import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const MIN_SCALE = 1;
const MAX_SCALE = 5;
const SWIPE_DISTANCE = 80;

type Props = {
  uri: string;
  /** Called when the photo is swiped sideways while not zoomed in */
  onSwipe?: (direction: 'next' | 'prev') => void;
};

/**
 * Full-screen photo: pinch to zoom, double-tap to zoom in/out, drag to move when zoomed,
 * and swipe left/right (when not zoomed) to go to the next or previous photo.
 */
export default function ZoomableImage({ uri, onSwipe }: Props) {
  const { width, height } = useWindowDimensions();

  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const savedX = useSharedValue(0);
  const savedY = useSharedValue(0);

  const reset = () => {
    'worklet';
    scale.value = withTiming(1);
    savedScale.value = 1;
    x.value = withTiming(0);
    y.value = withTiming(0);
    savedX.value = 0;
    savedY.value = 0;
  };

  // Keeps a zoomed photo from being dragged completely out of view
  const clampX = (value: number, s: number) => {
    'worklet';
    const limit = Math.max(0, (width * (s - 1)) / 2);
    return Math.max(-limit, Math.min(limit, value));
  };

  const clampY = (value: number, s: number) => {
    'worklet';
    const limit = Math.max(0, (height * (s - 1)) / 2);
    return Math.max(-limit, Math.min(limit, value));
  };

  // 1. PINCH GESTURE: Zoom in and out
  const pinch = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = Math.min(MAX_SCALE, Math.max(0.8, savedScale.value * e.scale));
    })
    .onEnd(() => {
      if (scale.value < 1.05) {
        reset();
      } else {
        savedScale.value = scale.value;
      }
    });

  // 2. PAN GESTURE: Drag when zoomed, or swipe to prev/next when unzoomed
  const pan = Gesture.Pan()
    .onUpdate((e) => {
      if (scale.value > 1.05) {
        // Dragging while zoomed in
        x.value = clampX(savedX.value + e.translationX, scale.value);
        y.value = clampY(savedY.value + e.translationY, scale.value);
      } else if (e.numberOfPointers === 1) {
        // Only allow unzoomed horizontal drag if using a single finger
        x.value = e.translationX;
      }
    })
    .onEnd((e) => {
      if (scale.value > 1.05) {
        savedX.value = x.value;
        savedY.value = y.value;
        return;
      }

      // Check if it was a deliberate swipe with 1 finger
      if (onSwipe && Math.abs(e.translationX) > SWIPE_DISTANCE) {
        runOnJS(onSwipe)(e.translationX < 0 ? 'next' : 'prev');
      }

      x.value = withTiming(0);
      savedX.value = 0;
      savedY.value = 0;
    });

  // 3. DOUBLE TAP GESTURE: Quick toggle between 1x and 2.5x
  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .maxDuration(250)
    .onStart(() => {
      if (scale.value > 1.05) {
        reset();
      } else {
        scale.value = withTiming(2.5);
        savedScale.value = 2.5;
      }
    });

  // Double tap takes priority; if not double tapping, Pinch and Pan work simultaneously
  const composed = Gesture.Exclusive(doubleTap, Gesture.Simultaneous(pinch, pan));

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: x.value },
      { translateY: y.value },
      { scale: scale.value },
    ],
  }));

  return (
    <View style={styles.container}>
      <GestureDetector gesture={composed}>
        <Animated.View collapsable={false} style={[styles.container, animatedStyle]}>
          <Image
            source={{ uri }}
            style={styles.image}
            contentFit="contain"
            cachePolicy="memory-disk"
            transition={150}
            accessibilityLabel="Photo. Pinch to zoom, double tap to zoom in or out, swipe for next photo."
          />
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});