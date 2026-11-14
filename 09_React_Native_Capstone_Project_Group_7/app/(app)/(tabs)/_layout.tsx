/**
 * Custom Left Drawer Layout - Botanical Sage & Terracotta Theme
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable, Dimensions } from 'react-native';
import { Slot, useRouter, usePathname } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { APP_COLORS } from '@/constants/theme';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function DrawerLayout() {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const menuItems = [
    { name: 'Discover', route: '/(app)/(tabs)/home', icon: 'compass-outline' },
    { name: 'Search', route: '/(app)/(tabs)/search', icon: 'magnify' },
    { name: 'Favorites', route: '/(app)/(tabs)/favorites', icon: 'heart-outline' },
    { name: 'Categories', route: '/(app)/(tabs)/categories', icon: 'shape-outline' },
    { name: 'Meal Planner', route: '/(app)/(tabs)/planner', icon: 'calendar-month-outline' },
    { name: 'Shopping List', route: '/(app)/(tabs)/shopping', icon: 'basket-outline' },
    { name: 'Collections', route: '/(app)/(tabs)/collections', icon: 'bookmark-multiple-outline' },
    { name: 'Profile', route: '/(app)/(tabs)/profile', icon: 'account-circle-outline' },
  ];

  const handleNavigate = (route: string) => {
    setDrawerVisible(false);
    router.push(route as any);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={styles.hamburgerButton}
          onPress={() => setDrawerVisible(true)}
          accessibilityLabel="Open Menu"
        >
          <MaterialCommunityIcons name="menu" size={26} color={APP_COLORS.primary} />
        </TouchableOpacity>
        <View style={styles.brandRow}>
          <MaterialCommunityIcons name="leaf" size={20} color={APP_COLORS.accent} style={{ marginRight: 6 }} />
          <Text style={styles.headerTitle}>ATELIER COOKBOOK</Text>
        </View>
        <View style={{ width: 38 }} />
      </View>

      <View style={styles.content}>
        <Slot />
      </View>

      <Modal
        visible={drawerVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDrawerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.drawerContainer, { paddingTop: insets.top + 20 }]}>
            <View style={styles.drawerHeader}>
              <View>
                <Text style={styles.drawerTitle}>Atelier</Text>
                <Text style={styles.drawerSubtitle}>Culinary Kitchen</Text>
              </View>
              <TouchableOpacity onPress={() => setDrawerVisible(false)} style={styles.closeBtn}>
                <MaterialCommunityIcons name="close" size={22} color={APP_COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.menuList}>
              {menuItems.map((item) => {
                const isActive = pathname.includes(item.route.split('/').pop() || '');
                return (
                  <TouchableOpacity
                    key={item.name}
                    style={[styles.menuItem, isActive && styles.activeMenuItem]}
                    onPress={() => handleNavigate(item.route)}
                  >
                    <MaterialCommunityIcons
                      name={item.icon as any}
                      size={22}
                      color={isActive ? APP_COLORS.surface : APP_COLORS.textSecondary}
                      style={styles.menuIcon}
                    />
                    <Text style={[styles.menuText, isActive && styles.activeMenuText]}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <Pressable style={styles.backdropPressable} onPress={() => setDrawerVisible(false)} />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: APP_COLORS.background },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: APP_COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: APP_COLORS.border,
    zIndex: 10,
  },
  hamburgerButton: {
    padding: 6,
    backgroundColor: APP_COLORS.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: APP_COLORS.primary,
  },
  content: { flex: 1 },
  modalOverlay: { flex: 1, flexDirection: 'row', backgroundColor: 'rgba(26, 36, 33, 0.55)' },
  drawerContainer: {
    width: SCREEN_WIDTH * 0.68,
    maxWidth: 300,
    backgroundColor: APP_COLORS.surface,
    height: '100%',
    paddingHorizontal: 18,
    borderRightWidth: 1,
    borderRightColor: APP_COLORS.border,
    zIndex: 20,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: APP_COLORS.border,
  },
  drawerTitle: { fontSize: 22, fontWeight: '800', color: APP_COLORS.primary, letterSpacing: 0.5 },
  drawerSubtitle: { fontSize: 12, color: APP_COLORS.accent, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  closeBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: APP_COLORS.background,
  },
  menuList: { gap: 6 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  activeMenuItem: {
    backgroundColor: APP_COLORS.primary,
  },
  menuIcon: { marginRight: 14 },
  menuText: { fontSize: 15, fontWeight: '600', color: APP_COLORS.textSecondary },
  activeMenuText: { color: APP_COLORS.surface, fontWeight: '700' },
  backdropPressable: { flex: 1 },
});