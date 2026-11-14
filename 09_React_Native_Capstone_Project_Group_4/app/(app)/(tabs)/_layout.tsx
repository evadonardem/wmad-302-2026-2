/**
 * Tabs Layout - Cookbook App Navigation
 * Tabs: Home (Discover), Search, Favorites, Profile
 */
import { Tabs } from 'expo-router';
import React from 'react';
import { useFavorites } from '@/context/FavoritesContext';
import { useSettings } from '@/context/SettingsContext';
import { appColors } from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function TabsLayout() {
  const { count: favoritesCount } = useFavorites();
  const { settings } = useSettings();
  const colors = settings.darkModeEnabled ? appColors.dark : appColors.light;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          paddingTop: 8,
          paddingBottom: 8,
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
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="chef-hat"
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="magnify"
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favorites',
          tabBarBadge: favoritesCount > 0 ? favoritesCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: colors.accent,
            color: settings.darkModeEnabled ? '#24170F' : '#FFFFFF',
          },
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
      {/* Reachable from Home ("See All"), but not shown in the tab bar */}
      <Tabs.Screen name="categories" options={{ href: null }} />
    </Tabs>
  );
}