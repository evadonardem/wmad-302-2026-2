/**
 * Settings - Marketplace
 * Notification switches + default payment method. Every change is saved right away
 * (per account) and the default payment is preselected at Checkout.
 */
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Card, Divider, List, RadioButton, Switch } from 'react-native-paper';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useAuth } from '@/context/AuthContext';
import { PaymentMethod } from '@/types/product';
import { UserSettings } from '@/types/auth';
import { PAYMENT_METHODS } from '@/utils/orders';
import { DEFAULT_SETTINGS } from '@/utils/profile';
import { settingsStorage } from '@/utils/storage';
import { THEME_MODE_OPTIONS, ThemeMode } from '@/utils/theme';
import { useAppTheme, useThemedStyles } from '@/context/ThemeContext';
import type { ThemeColors } from '@/constants/colors';

export default function SettingsScreen() {
  const styles = useThemedStyles(createStyles);
  const { mode, setMode } = useAppTheme();
  const { user } = useAuth();
  const username = user?.username;
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [error, setError] = useState<string | null>(null);

  // Load this account's saved settings
  useEffect(() => {
    if (!username) return;
    let cancelled = false;
    settingsStorage
      .get(username)
      .then((saved) => {
        if (!cancelled && saved) setSettings({ ...DEFAULT_SETTINGS, ...saved });
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [username]);

  const update = (changes: Partial<UserSettings>) => {
    if (!username) return;
    const next = { ...settings, ...changes };
    setSettings(next); // update the screen immediately...
    setError(null);
    settingsStorage.set(username, next).catch(() => setError("Couldn't save your settings."));
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Settings" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        <Card style={styles.card} elevation={1}>
          <RadioButton.Group value={mode} onValueChange={(value) => setMode(value as ThemeMode)}>
            {THEME_MODE_OPTIONS.map((option) => (
              <RadioButton.Item
                key={option.value}
                value={option.value}
                label={`${option.label} - ${option.description}`}
                labelStyle={styles.radioLabel}
              />
            ))}
          </RadioButton.Group>
        </Card>

        <Text style={styles.sectionTitle}>Notifications</Text>
        <Card style={styles.card} elevation={1}>
          <List.Item
            title="Order updates"
            description="Shipping and delivery status"
            right={() => (
              <Switch
                value={settings.orderUpdates}
                onValueChange={(value) => update({ orderUpdates: value })}
                accessibilityLabel="Order updates"
              />
            )}
          />
          <Divider />
          <List.Item
            title="Promotions"
            description="Deals and flash sales"
            right={() => (
              <Switch
                value={settings.promotions}
                onValueChange={(value) => update({ promotions: value })}
                accessibilityLabel="Promotions"
              />
            )}
          />
        </Card>

        <Text style={styles.sectionTitle}>Default payment method</Text>
        <Card style={styles.card} elevation={1}>
          <RadioButton.Group
            value={settings.defaultPayment}
            onValueChange={(value) => update({ defaultPayment: value as PaymentMethod })}
          >
            {PAYMENT_METHODS.map((method) => (
              <RadioButton.Item
                key={method.value}
                value={method.value}
                label={`${method.label} - ${method.description}`}
                labelStyle={styles.radioLabel}
              />
            ))}
          </RadioButton.Group>
        </Card>

        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Text style={styles.note}>Notification and payment settings are saved for your account. Appearance applies to this whole device.</Text>
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 48 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: colors.textMuted, marginTop: 8, marginBottom: 8 },
  card: { borderRadius: 12, marginBottom: 16, overflow: 'hidden' },
  radioLabel: { fontSize: 14 },
  error: { color: colors.errorText, marginBottom: 8 },
  note: { fontSize: 12, color: colors.textMuted, textAlign: 'center', marginTop: 8 },
});
