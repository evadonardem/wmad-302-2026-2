import React, { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { IconButton, Switch } from 'react-native-paper';
import { MarketplacePreferences, preferencesStorage } from '@/utils/marketplaceStorage';

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
        Alert.alert('Could not load settings', error instanceof Error ? error.message : 'Please try again.');
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
      Alert.alert('Could not save setting', error instanceof Error ? error.message : 'Please try again.');
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
          color="#EE4D2D"
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
          color="#EE4D2D"
        />
      </View>
      <Text style={styles.note}>These preferences are saved on this device. No notifications or emails are sent by the demo.</Text>
      <Text style={styles.section}>Payments</Text>
      <Text style={styles.note}>Checkout currently supports demo selection only. This app does not collect card data or process payments.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFF' },
  content: { padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  heading: { color: '#222', fontSize: 22, fontWeight: '800' },
  row: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#EEE', paddingVertical: 14 },
  description: { flex: 1, paddingRight: 10 },
  title: { color: '#222', fontWeight: '700' },
  subtitle: { color: '#777', fontSize: 12, marginTop: 4 },
  section: { color: '#222', fontSize: 17, fontWeight: '700', marginTop: 24 },
  note: { color: '#777', fontSize: 12, lineHeight: 18, marginTop: 10 },
});
