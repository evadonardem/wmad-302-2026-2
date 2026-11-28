/**
 * Tabs Layout - Marketplace App Navigation
 * Tabs: Home (Shop), Categories, Cart, Profile
 */
import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCart } from '@/context/CartContext';
import { useAppTheme } from '@/context/ThemeContext';

export default function TabsLayout() {
  const { colors, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { totalQuantity } = useCart();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primaryText,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarStyle: {
          backgroundColor: colors.surface,
          // A shadow can't be seen on a dark background, so dark mode gets a thin line instead
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: colors.border,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          elevation: 8,
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: isDark ? 0 : 0.06,
          shadowRadius: 8,
          // Fixed height: icon (24) + label + padding. Without it the icons get squeezed.
          height: 64 + insets.bottom,
          paddingTop: 8,
          paddingBottom: 8 + insets.bottom,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Shop',
          tabBarIcon: ({ focused, color }) => (
            <MaterialCommunityIcons
              name={focused ? 'storefront' : 'storefront-outline'}
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
            <MaterialCommunityIcons name="magnify" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: 'Categories',
          tabBarIcon: ({ focused, color }) => (
            <MaterialCommunityIcons
              name={focused ? 'view-grid' : 'view-grid-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          // Yellow badge with the number of items; hidden when the cart is empty
          tabBarBadge: totalQuantity > 0 ? totalQuantity : undefined,
          tabBarBadgeStyle: { backgroundColor: colors.primary, color: colors.onPrimary, fontWeight: '700' },
          tabBarIcon: ({ focused, color }) => (
            <MaterialCommunityIcons
              name={focused ? 'cart' : 'cart-outline'}
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

      {/*
        Safety net: if an old *Styles.ts file is still sitting in this folder, expo-router
        would turn it into a tab. href: null keeps these out of the tab bar either way.
      */}
      <Tabs.Screen name="homeStyles" options={{ href: null }} />
      <Tabs.Screen name="searchStyles" options={{ href: null }} />
      <Tabs.Screen name="categoriesStyles" options={{ href: null }} />
      <Tabs.Screen name="cartStyles" options={{ href: null }} />
      <Tabs.Screen name="profileStyles" options={{ href: null }} />
    </Tabs>
  );
}