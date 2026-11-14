/**
 * Tabs Layout - Cookbook App Navigation
 * Tabs: Discover, Search, Categories, Favorites (with count badge), Profile
 */
import React from 'react';
import { Tabs } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFavorites } from '@/context/FavoritesContext';
import type { IconName } from '@/components/CommonComponents';

function tabIcon(active: string, inactive: string) {
  const TabIcon = ({ focused, color }: { focused: boolean; color: string }) => (
    <MaterialCommunityIcons
      name={(focused ? active : inactive) as IconName}
      size={24}
      color={color}
    />
  );
  return TabIcon;
}

export default function TabsLayout() {
  const theme = useTheme();
  const { count } = useFavorites();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          paddingTop: 6,
          height: 62,
          paddingBottom: 6,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{ title: 'Discover', tabBarIcon: tabIcon('stove', 'stove') }}
      />
      <Tabs.Screen
        name="search"
        options={{ title: 'Search', tabBarIcon: tabIcon('magnify', 'magnify') }}
      />
      <Tabs.Screen
        name="categories"
        options={{ title: 'Categories', tabBarIcon: tabIcon('view-grid', 'view-grid-outline') }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favorites',
          tabBarIcon: tabIcon('heart', 'heart-outline'),
          tabBarBadge: count > 0 ? count : undefined,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profile', tabBarIcon: tabIcon('account', 'account-outline') }}
      />
    </Tabs>
  );
}
