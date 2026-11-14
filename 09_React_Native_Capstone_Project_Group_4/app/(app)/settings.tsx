import React from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { Appbar, Card, Divider, List } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { appColors } from '@/constants/theme';
import { SettingKey, useSettings } from '@/context/SettingsContext';

export default function SettingsScreen() {
  const router = useRouter();
  const { settings, isLoaded, isSaving, errorMessage, updateSetting } = useSettings();
  const colors = settings.darkModeEnabled ? appColors.dark : appColors.light;

  const settingRow = (
    title: string,
    description: string,
    key: SettingKey
  ) => (
    <List.Item
      title={title}
      description={description}
      titleStyle={{ color: colors.text }}
      descriptionStyle={{ color: colors.muted }}
      right={() => (
        <Switch
          value={settings[key]}
          onValueChange={(value) => {
            void updateSetting(key, value).catch(() => {});
          }}
          disabled={!isLoaded || isSaving}
          trackColor={{ false: colors.border, true: colors.accentSoft }}
          thumbColor={settings[key] ? colors.accent : '#FAFAFA'}
          accessibilityLabel={title}
        />
      )}
    />
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Appbar.Header style={{ backgroundColor: colors.background }}>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Settings" />
      </Appbar.Header>
      {!isLoaded ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#E85D04" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={[styles.sectionTitle, { color: colors.muted }]}>Preferences</Text>
          <Card style={styles.card}>
            {settingRow('Notifications', 'Save your notification preference', 'notificationsEnabled')}
            <Divider />
            {settingRow('Dark mode', 'Use a dark appearance throughout the app', 'darkModeEnabled')}
            <Divider />
            {settingRow('Private profile', 'Save your profile privacy preference', 'privateProfile')}
          </Card>
          {errorMessage && <Text style={[styles.error, { color: colors.error }]}>{errorMessage}</Text>}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
    marginLeft: 4,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: {
    marginTop: 12,
  },
});
