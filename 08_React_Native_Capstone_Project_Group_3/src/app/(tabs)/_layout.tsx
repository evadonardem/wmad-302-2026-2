import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';

export default function TabsLayout() {
  const theme = useTheme();

  return (
    // TODO 4.1 [Tab Bar Configuration]
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarLabelStyle: { fontWeight: '600' },
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outlineVariant,
        },
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.onSurface,
        headerTitleStyle: {
          fontWeight: 'bold',
          color: theme.colors.onSurface,
        },
      }}
    >
      {/* TODO 4.2 [Tab Screen Registration] */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Search',
          headerTitle: '🌴 Lakbay PH',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search" color={color as string} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          title: 'About',
          headerTitle: 'About Lakbay PH',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="information-circle-outline" color={color as string} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}