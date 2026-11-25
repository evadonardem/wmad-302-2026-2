/**
 * Profile Screen - Botanical Sage & Terracotta Theme
 */
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert, Modal, StyleSheet, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Card, Title, Button, List, Avatar, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { favoritesStorage } from '@/utils/storage';
import { APP_COLORS } from '@/constants/theme';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuth();

  const [favoriteCount, setFavoriteCount] = useState(0);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  useEffect(() => {
    loadFavoriteCount();
  }, []);

  const loadFavoriteCount = async () => {
    const ids = (await favoritesStorage.getIds()) || [];
    setFavoriteCount(ids.length);
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to sign out of Atelier?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.notLoggedIn}>Please sign in to view your chef profile</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.profileBanner}>
        <Avatar.Image
          size={80}
          source={{ uri: user?.image || 'https://dummyjson.com/icon/emilys/128' }}
          style={styles.avatar}
        />
        <View style={styles.nameContainer}>
          <Text style={styles.roleEyebrow}>HEAD CHEF</Text>
          <Text style={styles.name}>{user?.firstName} {user?.lastName}</Text>
          <Text style={styles.username}>@{user?.username}</Text>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{favoriteCount}</Text>
          <Text style={styles.statLabel}>Saved Dishes</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>3</Text>
          <Text style={styles.statLabel}>Folios</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Card style={styles.menuCard} elevation={1}>
          <List.Section style={{ marginVertical: 0 }}>
            <List.Item
              title="Weekly Meal Planner"
              titleStyle={styles.menuTitle}
              description="Organize your 7-day culinary schedule"
              descriptionStyle={styles.menuDesc}
              left={() => (
                <View style={styles.iconCircle}>
                  <MaterialCommunityIcons name="calendar-month-outline" size={20} color={APP_COLORS.primary} />
                </View>
              )}
              right={() => <MaterialCommunityIcons name="chevron-right" size={24} color={APP_COLORS.textSecondary} />}
              onPress={() => router.push('/(app)/(tabs)/planner' as any)}
            />
            <Divider style={{ backgroundColor: APP_COLORS.border }} />
            <List.Item
              title="Market Basket"
              titleStyle={styles.menuTitle}
              description="Grocery & ingredient checklist"
              descriptionStyle={styles.menuDesc}
              left={() => (
                <View style={styles.iconCircle}>
                  <MaterialCommunityIcons name="basket-outline" size={20} color={APP_COLORS.primary} />
                </View>
              )}
              right={() => <MaterialCommunityIcons name="chevron-right" size={24} color={APP_COLORS.textSecondary} />}
              onPress={() => router.push('/(app)/(tabs)/shopping' as any)}
            />
            <Divider style={{ backgroundColor: APP_COLORS.border }} />
            <List.Item
              title="Recipe Folios"
              titleStyle={styles.menuTitle}
              description="Curated recipe folders"
              descriptionStyle={styles.menuDesc}
              left={() => (
                <View style={styles.iconCircle}>
                  <MaterialCommunityIcons name="bookmark-multiple-outline" size={20} color={APP_COLORS.primary} />
                </View>
              )}
              right={() => <MaterialCommunityIcons name="chevron-right" size={24} color={APP_COLORS.textSecondary} />}
              onPress={() => router.push('/(app)/(tabs)/collections' as any)}
            />
            <Divider style={{ backgroundColor: APP_COLORS.border }} />
            <List.Item
              title="Kitchen Preferences"
              titleStyle={styles.menuTitle}
              description="Notifications & Theme"
              descriptionStyle={styles.menuDesc}
              left={() => (
                <View style={styles.iconCircle}>
                  <MaterialCommunityIcons name="tune-variant" size={20} color={APP_COLORS.primary} />
                </View>
              )}
              right={() => <MaterialCommunityIcons name="chevron-right" size={24} color={APP_COLORS.textSecondary} />}
              onPress={() => setSettingsModalVisible(true)}
            />
          </List.Section>
        </Card>
      </View>

      <Button
        mode="outlined"
        onPress={handleLogout}
        textColor={APP_COLORS.accent}
        style={styles.logoutButton}
      >
        Sign Out
      </Button>

      <Modal visible={settingsModalVisible} animationType="fade" transparent>
        <View style={modalStyles.overlay}>
          <View style={modalStyles.content}>
            <Title style={{ marginBottom: 16, color: APP_COLORS.textPrimary, fontWeight: '800' }}>
              Kitchen Preferences
            </Title>
            <View style={modalStyles.row}>
              <Text style={{ fontSize: 15, color: APP_COLORS.textPrimary, fontWeight: '600' }}>Dark Mode</Text>
              <Switch
                value={darkModeEnabled}
                onValueChange={setDarkModeEnabled}
                trackColor={{ false: APP_COLORS.border, true: APP_COLORS.primaryLight }}
                thumbColor="#FAF9F5"
              />
            </View>
            <Button
              mode="contained"
              onPress={() => setSettingsModalVisible(false)}
              buttonColor={APP_COLORS.primary}
              style={{ marginTop: 20, borderRadius: 12 }}
            >
              Done
            </Button>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: APP_COLORS.background },
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 120 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: APP_COLORS.background },
  notLoggedIn: { fontSize: 16, color: APP_COLORS.textSecondary },
  profileBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: APP_COLORS.primary,
    borderRadius: 22,
    padding: 20,
    marginBottom: 16,
  },
  avatar: { marginRight: 16, backgroundColor: APP_COLORS.primaryLight },
  nameContainer: { flex: 1 },
  roleEyebrow: { fontSize: 10, fontWeight: '800', color: '#95D5B2', letterSpacing: 1.5, marginBottom: 2 },
  name: { fontSize: 22, fontWeight: '800', color: '#FAF9F5' },
  username: { fontSize: 14, color: '#D8F3DC', fontWeight: '600', marginTop: 2 },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: APP_COLORS.surface,
    borderRadius: 18,
    paddingVertical: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
  },
  statItem: { alignItems: 'center', flex: 1 },
  statDivider: { width: 1, height: 32, backgroundColor: APP_COLORS.border },
  statValue: { fontSize: 22, fontWeight: '800', color: APP_COLORS.accent },
  statLabel: { fontSize: 12, color: APP_COLORS.textSecondary, fontWeight: '600', marginTop: 2 },
  section: { marginBottom: 20 },
  menuCard: {
    borderRadius: 18,
    backgroundColor: APP_COLORS.surface,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
    overflow: 'hidden',
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: APP_COLORS.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    alignSelf: 'center',
  },
  menuTitle: { fontSize: 15, fontWeight: '700', color: APP_COLORS.textPrimary },
  menuDesc: { fontSize: 12, color: APP_COLORS.textSecondary },
  logoutButton: {
    borderRadius: 14,
    borderColor: APP_COLORS.accent,
    borderWidth: 1.5,
    height: 48,
    justifyContent: 'center',
  },
});

const modalStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(26, 36, 33, 0.55)', justifyContent: 'center', padding: 20 },
  content: {
    backgroundColor: APP_COLORS.surface,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
});