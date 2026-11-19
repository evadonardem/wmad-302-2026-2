/**
 * Tabs Layout - Marketplace App Navigation
 * Tabs: Home (Shop), Categories, Cart, Profile
 */
import { Tabs } from 'expo-router';
import React from 'react';
import { useCart } from '@/context/CartContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { marketplaceColors } from '@/constants/theme';

export default function TabsLayout() {
  const { totalQuantity } = useCart();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: marketplaceColors.primary,
        tabBarInactiveTintColor: '#81788A',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: marketplaceColors.border,
          elevation: 6,
          shadowColor: '#30283A',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.06,
          shadowRadius: 10,
          paddingTop: 6,
          paddingBottom: 6,
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
          tabBarBadge: totalQuantity > 0 ? totalQuantity : undefined,
          tabBarIcon: ({ focused, color }) => (
            <MaterialCommunityIcons
              name={focused ? 'cart' : 'cart-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen name="search" options={{ href: null, tabBarStyle: { display: 'none' } }} />
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