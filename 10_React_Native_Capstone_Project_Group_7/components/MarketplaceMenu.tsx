import React from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useAppPreferences } from '@/context/AppPreferencesContext';

type MarketplaceMenuProps = {
  visible: boolean;
  onDismiss: () => void;
};

const menuItems = [
  { label: 'Shop', route: '/(app)/(tabs)/home', icon: 'storefront-outline' },
  { label: 'Categories', route: '/(app)/(tabs)/categories', icon: 'view-grid-outline' },
  { label: 'Cart', route: '/(app)/(tabs)/cart', icon: 'cart-outline' },
  { label: 'Profile', route: '/(app)/(tabs)/profile', icon: 'account-outline' },
] as const;

export function MarketplaceMenu({ visible, onDismiss }: MarketplaceMenuProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const { itemCount } = useCart();
  const { colorMode, t } = useAppPreferences();
  const isDark = colorMode === 'dark';

  const navigateTo = (route: (typeof menuItems)[number]['route']) => {
    onDismiss();
    router.navigate(route);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
      statusBarTranslucent
    >
      <View style={{ flex: 1, flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.42)' }}>
        <View
          style={{
            width: 310,
            maxWidth: '84%',
            height: '100%',
            paddingTop: 56,
            paddingHorizontal: 18,
            backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
          }}
        >
          <View style={{ paddingHorizontal: 10, paddingBottom: 22 }}>
            <Text style={{ color: '#66BB6A', fontSize: 12, fontWeight: '800', letterSpacing: 1.2 }}>
              MARKETPLACE
            </Text>
            <Text style={{ color: isDark ? '#F5F5F5' : '#202124', fontSize: 20, fontWeight: '700', marginTop: 8 }}>
              {user ? `Hello, ${user.firstName}` : t('Your next great find')}
            </Text>
            <Text style={{ color: isDark ? '#BDBDBD' : '#5F6368', fontSize: 13, marginTop: 4 }}>
              {t('Shop your favorite finds')}
            </Text>
          </View>

          <View style={{ height: 1, backgroundColor: '#E8EAED', marginBottom: 12 }} />
          {menuItems.map((item) => {
            const selected = pathname.endsWith(item.route.split('/').pop() ?? '');
            return (
              <Pressable
                key={item.label}
                onPress={() => navigateTo(item.route)}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                style={{
                  minHeight: 52,
                  paddingHorizontal: 12,
                  marginVertical: 3,
                  borderRadius: 10,
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: selected ? (isDark ? '#243728' : '#E8F5E9') : (isDark ? '#1E1E1E' : '#FFFFFF'),
                }}
              >
                <MaterialCommunityIcons
                  name={item.icon}
                  size={22}
                  color={selected ? '#66BB6A' : (isDark ? '#BDBDBD' : '#5F6368')}
                />
                <Text
                  style={{
                    flex: 1,
                    marginLeft: 14,
                    color: selected ? '#66BB6A' : (isDark ? '#F5F5F5' : '#202124'),
                    fontSize: 15,
                    fontWeight: selected ? '700' : '500',
                  }}
                >
                  {t(item.label)}
                </Text>
                {item.label === 'Cart' && itemCount > 0 ? (
                  <View
                    style={{
                      minWidth: 22,
                      height: 22,
                      paddingHorizontal: 6,
                      borderRadius: 11,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#EA4335',
                    }}
                  >
                    <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '700' }}>
                      {itemCount}
                    </Text>
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </View>
        <Pressable
          style={{ flex: 1 }}
          onPress={onDismiss}
          accessibilityRole="button"
          accessibilityLabel="Close menu"
        />
      </View>
    </Modal>
  );
}
