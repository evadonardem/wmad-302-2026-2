/**
 * Tabs Layout - Cookbook App Navigation
 * Tabs: Discover, Search, Categories, Favorites (with count badge), Profile
 * Safe areas: screens sit below the status bar and the tab bar grows by the
 * phone's bottom inset. Colors come from the active (light/dark) theme.
 */
import { Tabs } from 'expo-router';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from 'react-native-paper';
import { useFavorites } from '@/context/FavoritesContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function TabsLayout() {
  const { count } = useFavorites();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const bottomPadding = Math.max(insets.bottom, 8);

  return (
    <Tabs
      // Keeps every screen below the status bar / notch
      sceneContainerStyle={{ backgroundColor: colors.background, paddingTop: insets.top }}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          // Room for icon + label, plus the phone's gesture/nav bar
          height: 60 + bottomPadding,
          paddingTop: 6,
          paddingBottom: bottomPadding,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Discover',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="stove" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="magnify" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: 'Categories',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="view-grid" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favorites',
          // Badge shows how many recipes are saved; hidden when there are none
          tabBarBadge: count > 0 ? count : undefined,
          tabBarBadgeStyle: { backgroundColor: colors.error },
          tabBarIcon: ({ focused, color }) => (
            <MaterialCommunityIcons
              name={focused ? 'heart' : 'heart-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused, color }) => (
            <MaterialCommunityIcons
              name={focused ? 'account' : 'account-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
