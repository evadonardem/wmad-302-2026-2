
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';

export default function TabsLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,

        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopColor: theme.colors.textSecondary,
        },

        headerStyle: {
          backgroundColor: theme.colors.background,
        },

        headerTitleStyle: {
          fontWeight: '700',
          color: theme.colors.text,
        },

        headerTintColor: theme.colors.text,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="home"
              color={
                typeof color === 'number'
                  ? theme.colors.primary
                  : color ?? theme.colors.primary
              }
              size={size}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favorites',
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="heart"
              color={
                typeof color === 'number'
                  ? theme.colors.primary
                  : color ?? theme.colors.primary
              }
              size={size}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="settings"
              color={
                typeof color === 'number'
                  ? theme.colors.primary
                  : color ?? theme.colors.primary
              }
              size={size}
            />
          ),
        }}
      />
    </Tabs>
  );
}
