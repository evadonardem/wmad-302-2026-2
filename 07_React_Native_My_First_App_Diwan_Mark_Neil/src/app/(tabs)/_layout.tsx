import type { ComponentProps, ReactNode } from 'react';
import {
  useWindowDimensions,
  type AccessibilityState,
  type ColorValue,
  type GestureResponderEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Hoverable from '@/components/Hoverable';
import { useTheme } from '@/theme';
import { usePalette } from '@/palette';

type IconName = ComponentProps<typeof Ionicons>['name'];

const tabIcon =
  (filled: IconName, outline: IconName) =>
  ({ color, size, focused }: { color: ColorValue; size: number; focused: boolean }) => (
    <Ionicons name={focused ? filled : outline} size={size + 2} color={color as string} />
  );

type TabButtonProps = {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: ((e: GestureResponderEvent) => void) | null;
  onLongPress?: ((e: GestureResponderEvent) => void) | null;
  accessibilityState?: AccessibilityState;
  accessibilityLabel?: string;
  testID?: string;
  hoverBg: string;
  glow: string;
};

function TabButton({
  children,
  style,
  onPress,
  onLongPress,
  accessibilityState,
  accessibilityLabel,
  testID,
  hoverBg,
  glow,
}: TabButtonProps) {
  return (
    <Hoverable
      onPress={onPress ?? undefined}
      onLongPress={onLongPress ?? undefined}
      accessibilityRole="button"
      accessibilityState={accessibilityState}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
      style={[style, { borderRadius: 22 }]}
      scale={1.12}
      lift={5}
      hoverBg={hoverBg}
      glow={glow}
    >
      {children}
    </Hoverable>
  );
}

export default function TabsLayout() {
  const theme = useTheme();
  const { palette } = usePalette();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const barWidth = Math.min(480, width - 32);

  const tabBarButton = (props: any) => (
    <TabButton {...props} hoverBg={palette.main + '1f'} glow={palette.main + '55'} />
  );

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: palette.main,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarLabelStyle: { fontSize: 12, fontWeight: '700' },
        tabBarButton,
        tabBarStyle: {
          position: 'absolute',
          left: (width - barWidth) / 2,
          width: barWidth,
          bottom: Math.max(insets.bottom, 12) + 4,
          height: 66,
          paddingTop: 8,
          paddingBottom: 8,
          borderRadius: 28,
          borderTopWidth: 0,
          backgroundColor: theme.colors.surface,
          elevation: 14,
          shadowColor: palette.main,
          shadowOpacity: 0.3,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: 8 },
        },
        sceneStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: tabIcon('home', 'home-outline') }} />
      <Tabs.Screen name="favorites" options={{ title: 'Favorites', tabBarIcon: tabIcon('heart', 'heart-outline') }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings', tabBarIcon: tabIcon('settings', 'settings-outline') }} />
    </Tabs>
  );
}