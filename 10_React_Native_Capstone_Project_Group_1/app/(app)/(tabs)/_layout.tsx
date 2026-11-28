/**
 * Tabs Layout - Marketplace App Navigation
 * Tabs: Shop, Search, Categories, Cart (badge), Profile
 */
import { Tabs } from 'expo-router';
import React from 'react';
import { useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCart } from '@/context/CartContext';
import { christmas } from '@/constants/theme';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

function tabIcon(focusedName: IconName, name: IconName) {
  function TabIcon({ focused, color }: { focused: boolean; color: string }) {
    return <MaterialCommunityIcons name={focused ? focusedName : name} size={24} color={color} />;
  }
  return TabIcon;
}

export default function TabsLayout() {
  const theme = useTheme();
  const { totals } = useCart();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopWidth: 3,
          borderTopColor: christmas.gold,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        tabBarBadgeStyle: { backgroundColor: christmas.pine, color: '#FFFFFF' },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '500' },
      }}
    >
      <Tabs.Screen name="home" options={{ title: 'Shop', tabBarIcon: tabIcon('storefront', 'storefront-outline') }} />
      <Tabs.Screen name="search" options={{ title: 'Search', tabBarIcon: tabIcon('magnify', 'magnify') }} />
      <Tabs.Screen
        name="categories"
        options={{ title: 'Categories', tabBarIcon: tabIcon('view-grid', 'view-grid-outline') }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarIcon: tabIcon('cart', 'cart-outline'),
          tabBarBadge: totals.totalQuantity > 0 ? totals.totalQuantity : undefined,
        }}
      />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: tabIcon('account', 'account-outline') }} />
    </Tabs>
  );
}
