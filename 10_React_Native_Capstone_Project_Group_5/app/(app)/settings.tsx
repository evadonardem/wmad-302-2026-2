import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { IconButton, Switch } from 'react-native-paper';
import { MarketplacePreferences, preferencesStorage } from '@/utils/marketplaceStorage';
import { marketplaceColors } from '@/constants/theme';
import { showAlert } from '@/utils/platformAlert';

const initialPreferences: MarketplacePreferences = {
  notificationsEnabled: true,
  promotionalEmailsEnabled: false,
};

export default function SettingsScreen() {
  const router = useRouter();
  const [preferences, setPreferences] = useState(initialPreferences);

  useFocusEffect(useCallback(() => {
    let active = true;
    preferencesStorage.get()
      .then((saved) => {
        if (active) setPreferences(saved);
      })
      .catch((error: unknown) => {
        showAlert('Could not load settings', error instanceof Error ? error.message : 'Please try again.');
      });
    return () => { active = false; };
  }, []));

  const updatePreference = async (key: keyof MarketplacePreferences, value: boolean) => {
    const updated = { ...preferences, [key]: value };
    setPreferences(updated);
    try {
      await preferencesStorage.set(updated);
    } catch (error) {
      setPreferences(preferences);
      showAlert('Could not save setting', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <IconButton icon="arrow-left" onPress={() => router.back()} accessibilityLabel="Go back" />
        <Text style={styles.heading}>Settings</Text>
      </View>
      <View style={styles.row}>
        <View style={styles.description}>
          <Text style={styles.title}>Order updates</Text>
          <Text style={styles.subtitle}>Notifications about demo order status</Text>
        </View>
        <Switch
          value={preferences.notificationsEnabled}
          onValueChange={(value) => void updatePreference('notificationsEnabled', value)}
          color="#75648A"
        />
      </View>
      <View style={styles.row}>
        <View style={styles.description}>
          <Text style={styles.title}>Promotional emails</Text>
          <Text style={styles.subtitle}>Offers and product announcements</Text>
        </View>
        <Switch
          value={preferences.promotionalEmailsEnabled}
          onValueChange={(value) => void updatePreference('promotionalEmailsEnabled', value)}
          color="#75648A"
        />
      </View>
      <Text style={styles.note}>These preferences are saved on this device. No notifications or emails are sent by the demo.</Text>
      <Text style={styles.section}>Payments</Text>
      <Text style={styles.note}>Checkout currently supports demo selection only. This app does not collect card data or process payments.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: marketplaceColors.background },
  content: { padding: 16, paddingBottom: 32 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  heading: { color: '#30283A', fontSize: 22, fontWeight: '800' },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderWidth: 1, borderColor: marketplaceColors.border, borderRadius: 16, padding: 16, marginBottom: 12 },
  description: { flex: 1, paddingRight: 10 },
  title: { color: '#30283A', fontWeight: '700', fontSize: 15 },
  subtitle: { color: '#746C7A', fontSize: 12, marginTop: 5, lineHeight: 17 },
  section: { color: '#30283A', fontSize: 18, fontWeight: '800', marginTop: 18 },
  note: { color: '#746C7A', fontSize: 12, lineHeight: 18, marginTop: 10, paddingHorizontal: 2 },
});
