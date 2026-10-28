import { useRef, useState, type ReactNode } from 'react';
import { Animated, Platform, Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const isWeb = Platform.OS === 'web';
const native = !isWeb;

type Props = Omit<PressableProps, 'style' | 'children'> & {
  style?: StyleProp<ViewStyle>;
  /** Either normal children, or a function that receives the 0 -> 1 hover value so inner parts can animate too. */
  children: ReactNode | ((hover: Animated.Value) => ReactNode);
  /** Size while hovered (1 = no change). */
  scale?: number;
  /** Pixels to float upward while hovered. */
  lift?: number;
  /** Degrees to rotate while hovered. */
  tilt?: number;
  /** Size while pressed. Use 1 for cards that only need the hover effect. */
  pressScale?: number;
  /** Glow (box-shadow) color while hovered. Web only. */
  glow?: string;
  /** Background color while hovered. Web only. */
  hoverBg?: string;
};

export default function Hoverable({
  style,
  children,
  scale = 1.06,
  lift = 3,
  tilt = 0,
  pressScale = 0.94,
  glow,
  hoverBg,
  disabled,
  onHoverIn,
  onHoverOut,
  onPressIn,
  onPressOut,
  ...rest
}: Props) {
  const hover = useRef(new Animated.Value(0)).current;
  const press = useRef(new Animated.Value(0)).current;
  const [hovered, setHovered] = useState(false);

  const go = (v: Animated.Value, to: number) =>
    Animated.spring(v, { toValue: to, friction: 6, tension: 220, useNativeDriver: native }).start();

  const scaleValue = Animated.multiply(
    hover.interpolate({ inputRange: [0, 1], outputRange: [1, scale] }),
    press.interpolate({ inputRange: [0, 1], outputRange: [1, pressScale] }),
  );

  const webStyle: ViewStyle | null = isWeb
    ? ({
        cursor: rest.onPress && !disabled ? 'pointer' : 'default',
        transitionProperty: 'background-color, box-shadow',
        transitionDuration: '220ms',
        ...(hovered && !disabled
          ? { ...(hoverBg ? { backgroundColor: hoverBg } : null), ...(glow ? { boxShadow: `0 8px 22px ${glow}` } : null) }
          : null),
      } as unknown as ViewStyle)
    : null;

  const animatedStyle = [
    style,
    webStyle,
    {
      transform: [
        { translateY: hover.interpolate({ inputRange: [0, 1], outputRange: [0, -lift] }) },
        { rotate: hover.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${tilt}deg`] }) },
        { scale: scaleValue },
      ],
    },
  ] as unknown as StyleProp<ViewStyle>;

  return (
    <AnimatedPressable
      {...rest}
      disabled={disabled}
      style={animatedStyle}
      onHoverIn={(e) => {
        if (!disabled) {
          setHovered(true);
          go(hover, 1);
        }
        onHoverIn?.(e);
      }}
      onHoverOut={(e) => {
        setHovered(false);
        go(hover, 0);
        onHoverOut?.(e);
      }}
      onPressIn={(e) => {
        if (!disabled) go(press, 1);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        go(press, 0);
        onPressOut?.(e);
      }}
    >
      {typeof children === 'function' ? children(hover) : children}
    </AnimatedPressable>
  );
}
