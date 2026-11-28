/**
 * Settings - notification preferences (persisted with AsyncStorage)
 */
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Card, Divider, List, Switch, useTheme } from 'react-native-paper';
import { useAsyncStorage } from '@/hooks';
import { AppSettings, DEFAULT_SETTINGS } from '@/types/user';
import { LoadingView } from '@/components/CommonComponents';
import { STORAGE_KEYS } from '@/utils/storage';
import { spacing } from '@/constants/layout';

export default function SettingsScreen() {
  const theme = useTheme();
  const [settings, setSettings, loading] = useAsyncStorage<AppSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);

  if (loading) return <LoadingView message="Loading settings..." />;

  const toggle = (key: keyof AppSettings) => setSettings({ ...settings, [key]: !settings[key] });

  return (
    <ScrollView style={{ backgroundColor: theme.colors.background }} contentContainerStyle={styles.content}>
      <View style={styles.column}>
        <Text style={[styles.heading, { color: theme.colors.onSurface }]}>Notifications</Text>
        <Card elevation={1} style={styles.card}>
          <List.Item
            title="Order updates"
            description="Status changes for your orders"
            right={() => (
              <Switch value={settings.orderNotifications} onValueChange={() => toggle('orderNotifications')} />
            )}
          />
          <Divider />
          <List.Item
            title="Deals & offers"
            description="Flash deals and discounts"
            right={() => (
              <Switch value={settings.dealNotifications} onValueChange={() => toggle('dealNotifications')} />
            )}
          />
        </Card>

        <Text style={[styles.heading, { color: theme.colors.onSurface }]}>About</Text>
        <Card elevation={1} style={styles.card}>
          <List.Item title="Version" description="Marketplace v1.0.0" />
          <Divider />
          <List.Item title="Data source" description="DummyJSON (dummyjson.com)" />
        </Card>

        <Button mode="outlined" style={styles.reset} onPress={() => setSettings(DEFAULT_SETTINGS)}>
          Reset to defaults
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg },
  column: { width: '100%', maxWidth: 560, alignSelf: 'center' },
  heading: { fontSize: 16, fontWeight: '700', marginTop: spacing.lg, marginBottom: spacing.sm },
  card: { borderRadius: 12, overflow: 'hidden' },
  reset: { marginTop: spacing.xl },
});
