/**
 * Settings - dark mode, notifications, data management
 */
import React, { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Card, Divider, List, Snackbar, Switch, useTheme } from 'react-native-paper';
import { useSettings } from '@/context/SettingsContext';
import { useFavorites } from '@/context/FavoritesContext';
import { ConfirmDialog } from '@/components/ConfirmDialog';

export default function SettingsScreen() {
  const theme = useTheme();
  const { darkMode, notifications, setDarkMode, setNotifications } = useSettings();
  const { count, clearFavorites } = useFavorites();
  const [confirmClear, setConfirmClear] = useState(false);
  const [snackbar, setSnackbar] = useState<string | null>(null);

  return (
    <ScrollView
      style={{ backgroundColor: theme.colors.background }}
      contentContainerStyle={styles.content}
    >
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={1}>
        <List.Item
          title="Dark mode"
          description="Easier on the eyes in low light"
          left={(props) => <List.Icon {...props} icon="theme-light-dark" />}
          right={() => (
            <Switch value={darkMode} onValueChange={setDarkMode} testID="dark-mode-switch" />
          )}
        />
        <Divider />
        <List.Item
          title="Cooking reminders"
          description="Notifications about saved recipes"
          left={(props) => <List.Icon {...props} icon="bell-outline" />}
          right={() => (
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              testID="notifications-switch"
            />
          )}
        />
      </Card>

      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={1}>
        <List.Item
          title="Clear favorites"
          description={`${count} saved ${count === 1 ? 'recipe' : 'recipes'}`}
          left={(props) => <List.Icon {...props} icon="heart-broken" />}
          onPress={() => count > 0 && setConfirmClear(true)}
          disabled={count === 0}
        />
        <Divider />
        <List.Item
          title="About"
          description="Cookbook v1.0.0 - WMAD 302 Capstone"
          left={(props) => <List.Icon {...props} icon="information-outline" />}
        />
      </Card>

      <ConfirmDialog
        visible={confirmClear}
        title="Clear favorites"
        message="This removes every recipe from your favorites."
        confirmLabel="Clear"
        destructive
        onConfirm={() => {
          clearFavorites();
          setConfirmClear(false);
          setSnackbar('Favorites cleared');
        }}
        onCancel={() => setConfirmClear(false)}
      />
      <Snackbar visible={snackbar !== null} onDismiss={() => setSnackbar(null)} duration={2000}>
        {snackbar ?? ''}
      </Snackbar>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16 },
  card: { marginBottom: 16, borderRadius: 16, overflow: 'hidden' },
});
