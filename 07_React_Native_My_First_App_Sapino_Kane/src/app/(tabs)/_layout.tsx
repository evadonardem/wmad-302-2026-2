import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';

export default function TabsLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        // TODO 21 [Tab Bar Configuration]
        tabBarActiveTintColor: theme.colors.primary || '#007AFF',
        tabBarInactiveTintColor: theme.colors.textSecondary || '#8E8E93',
        tabBarStyle: {
          backgroundColor: theme.colors.background || '#ffffff',
        },
        headerStyle: {
          backgroundColor: theme.colors.background || '#ffffff',
        },
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 18,
          color: theme.colors.text || '#000000',
        },
      }}
    >
      {/* TODO 22 [Tab Screen Registration] */}
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }} 
      />
      <Tabs.Screen 
        name="favorites" 
        options={{ 
          title: 'Favorites',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart" size={size} color={color} />
          ),
        }} 
      />
      <Tabs.Screen 
        name="settings" 
        options={{ 
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
        }} 
      />
    </Tabs>
  );
}
