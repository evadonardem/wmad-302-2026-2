import { useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

const MAX_SCALE = 5;
const SWIPE_DISTANCE = 90;

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

  // keeps a zoomed photo from being dragged completely out of view
  const clampX = (value: number, s: number) => {
    'worklet';
    const limit = (width * (s - 1)) / 2;
    return Math.max(-limit, Math.min(limit, value));
  };
  const clampY = (value: number, s: number) => {
    'worklet';
    const limit = (height * (s - 1)) / 2;
    return Math.max(-limit, Math.min(limit, value));
  };

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

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      if (scale.value > 1.05) {
        x.value = clampX(savedX.value + e.translationX, scale.value);
        y.value = clampY(savedY.value + e.translationY, scale.value);
      } else {
        // not zoomed: the photo follows the finger so a swipe feels natural
        x.value = e.translationX;
      }
    })
    .onEnd((e) => {
      if (scale.value > 1.05) {
        savedX.value = x.value;
        savedY.value = y.value;
        return;
      }
      if (onSwipe && Math.abs(e.translationX) > SWIPE_DISTANCE) {
        runOnJS(onSwipe)(e.translationX < 0 ? 'next' : 'prev');
      }
      x.value = withTiming(0);
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      if (scale.value > 1.05) {
        reset();
      } else {
        scale.value = withTiming(2.5);
        savedScale.value = 2.5;
      }
    });

  const composed = Gesture.Race(doubleTap, Gesture.Simultaneous(pinch, pan));

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }, { translateY: y.value }, { scale: scale.value }],
  }));

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GestureDetector gesture={composed}>
        <Animated.View style={[{ flex: 1 }, animatedStyle]}>
          <Image
            source={{ uri }}
            style={{ width: '100%', height: '100%' }}
            contentFit="contain"
            cachePolicy="memory-disk"
            transition={150}
            accessibilityLabel="Photo. Pinch to zoom, double tap to zoom in or out, swipe for next photo."
          />
        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}