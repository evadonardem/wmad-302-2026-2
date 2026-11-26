
/**
 * Settings Screen - Cookbook
 * Manages notifications and app appearance
 */

import React, { useEffect, useState } from 'react';

import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';

import {
  ActivityIndicator,
  Button,
  Card,
  Divider,
  List,
  RadioButton,
  Switch,
} from 'react-native-paper';

import {
  getStorageItem,
  setStorageItem,
} from '@/utils/storage';

import {
  useAppTheme,
  AppearanceMode,
} from '@/app/providers';

interface AppSettings {
  recipeNotifications: boolean;
  mealReminders: boolean;
  weeklyUpdates: boolean;
  appearance: AppearanceMode;
}

const DEFAULT_SETTINGS: AppSettings = {
  recipeNotifications: true,
  mealReminders: false,
  weeklyUpdates: true,
  appearance: 'light',
};

export default function SettingsScreen() {
  const { appearance, setAppearance } = useAppTheme();

  const [settings, setSettings] =
    useState<AppSettings>({
      ...DEFAULT_SETTINGS,
      appearance,
    });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load saved settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedSettings =
          await getStorageItem<AppSettings>('user_settings');

        if (savedSettings) {
          setSettings({
            ...DEFAULT_SETTINGS,
            ...savedSettings,
            appearance,
          });
        } else {
          setSettings((previous) => ({
            ...previous,
            appearance,
          }));
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [appearance]);

  // Update notification switches
  const updateNotification = (
    key:
      | 'recipeNotifications'
      | 'mealReminders'
      | 'weeklyUpdates',
    value: boolean
  ) => {
    setSettings((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  // Apply theme immediately
  const handleAppearanceChange = async (
    value: string
  ) => {
    const selectedAppearance = value as AppearanceMode;

    setSettings((previous) => ({
      ...previous,
      appearance: selectedAppearance,
    }));

    try {
      await setAppearance(selectedAppearance);
    } catch {
      Alert.alert(
        'Error',
        'Unable to save appearance preference.'
      );
    }
  };

  // Save all settings
  const handleSave = async () => {
    try {
      setSaving(true);

      await setStorageItem(
        'user_settings',
        settings
      );

      await setAppearance(settings.appearance);

      Alert.alert(
        'Success',
        'Your settings have been saved successfully.'
      );
    } catch {
      Alert.alert(
        'Error',
        'Unable to save your settings.'
      );
    } finally {
      setSaving(false);
    }
  };

  // Reset settings
  const handleReset = () => {
    Alert.alert(
      'Reset Settings',
      'Restore all settings to their default values?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              setSettings(DEFAULT_SETTINGS);
              await setStorageItem(
                'user_settings',
                DEFAULT_SETTINGS
              );
              await setAppearance('light');

              Alert.alert(
                'Success',
                'Settings have been restored to default.'
              );
            } catch {
              Alert.alert(
                'Error',
                'Unable to reset settings.'
              );
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={localStyles.center}>
        <ActivityIndicator
          size="large"
          color="#E85D04"
        />
        <Text style={localStyles.loadingText}>
          Loading settings...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={localStyles.container}
      contentContainerStyle={localStyles.content}
    >
      <Text style={localStyles.heading}>
        Settings
      </Text>

      <Text style={localStyles.subtitle}>
        Customize your Cookbook experience.
      </Text>

      {/* Notifications */}
      <Card style={localStyles.card}>
        <Card.Title
          title="Notifications"
          titleStyle={localStyles.cardTitle}
          left={(props) => (
            <List.Icon
              {...props}
              icon="bell-outline"
              color="#E85D04"
            />
          )}
        />

        <Divider />

        <List.Item
          title="Recipe Notifications"
          description="Receive recipe updates"
          right={() => (
            <Switch
              value={settings.recipeNotifications}
              onValueChange={(value) =>
                updateNotification(
                  'recipeNotifications',
                  value
                )
              }
              color="#E85D04"
            />
          )}
        />

        <Divider style={localStyles.divider} />

        <List.Item
          title="Meal Reminders"
          description="Enable meal planning reminders"
          right={() => (
            <Switch
              value={settings.mealReminders}
              onValueChange={(value) =>
                updateNotification(
                  'mealReminders',
                  value
                )
              }
              color="#E85D04"
            />
          )}
        />

        <Divider style={localStyles.divider} />

        <List.Item
          title="Weekly Recipe Updates"
          description="Receive weekly recipe updates"
          right={() => (
            <Switch
              value={settings.weeklyUpdates}
              onValueChange={(value) =>
                updateNotification(
                  'weeklyUpdates',
                  value
                )
              }
              color="#E85D04"
            />
          )}
        />
      </Card>

      {/* Appearance */}
      <Card style={localStyles.card}>
        <Card.Title
          title="Appearance"
          titleStyle={localStyles.cardTitle}
          left={(props) => (
            <List.Icon
              {...props}
              icon="theme-light-dark"
              color="#E85D04"
            />
          )}
        />

        <Divider />

        <Card.Content>
          <Text style={localStyles.sectionDescription}>
            Choose your preferred appearance.
          </Text>

          <RadioButton.Group
            onValueChange={handleAppearanceChange}
            value={appearance}
          >
            <RadioButton.Item
              label="Light"
              value="light"
              color="#E85D04"
            />

            <RadioButton.Item
              label="Dark"
              value="dark"
              color="#E85D04"
            />

            <RadioButton.Item
              label="System Default"
              value="system"
              color="#E85D04"
            />
          </RadioButton.Group>
        </Card.Content>
      </Card>

      {/* Save and Reset */}
      <View style={localStyles.buttons}>
        <Button
          mode="contained"
          onPress={handleSave}
          loading={saving}
          disabled={saving}
          buttonColor="#E85D04"
          style={localStyles.saveButton}
          contentStyle={localStyles.buttonContent}
        >
          Save Settings
        </Button>

        <Button
          mode="outlined"
          onPress={handleReset}
          disabled={saving}
          textColor="#C62828"
          style={localStyles.resetButton}
          contentStyle={localStyles.buttonContent}
        >
          Reset to Default
        </Button>
      </View>

      <Text style={localStyles.footer}>
        Cookbook Settings v1.0.0
      </Text>
    </ScrollView>
  );
}

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    padding: 16,
    paddingBottom: 50,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 24,
    opacity: 0.7,
  },
  card: {
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
  },
  cardTitle: {
    fontWeight: '700',
  },
  divider: {
    marginLeft: 16,
  },
  sectionDescription: {
    fontSize: 13,
    marginTop: 12,
    marginBottom: 8,
    opacity: 0.7,
  },
  buttons: {
    marginTop: 8,
    gap: 12,
  },
  saveButton: {
    borderRadius: 12,
  },
  resetButton: {
    borderRadius: 12,
    borderColor: '#C62828',
  },
  buttonContent: {
    height: 48,
  },
  footer: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 30,
    opacity: 0.5,
  },
});
