import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/context/AuthContext';

export interface UserSettings {
  notificationsEnabled: boolean;
  darkModeEnabled: boolean;
  privateProfile: boolean;
}

export type SettingKey = keyof UserSettings;

export const DEFAULT_SETTINGS: UserSettings = {
  notificationsEnabled: false,
  darkModeEnabled: false,
  privateProfile: true,
};

function parseSettings(raw: string | null): UserSettings {
  if (raw === null) return DEFAULT_SETTINGS;

  const parsed: unknown = JSON.parse(raw);
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error('Stored settings have an invalid format');
  }

  const values = parsed as Record<string, unknown>;
  return {
    notificationsEnabled:
      typeof values.notificationsEnabled === 'boolean'
        ? values.notificationsEnabled
        : DEFAULT_SETTINGS.notificationsEnabled,
    darkModeEnabled:
      typeof values.darkModeEnabled === 'boolean'
        ? values.darkModeEnabled
        : DEFAULT_SETTINGS.darkModeEnabled,
    privateProfile:
      typeof values.privateProfile === 'boolean'
        ? values.privateProfile
        : DEFAULT_SETTINGS.privateProfile,
  };
}

interface SettingsContextValue {
  settings: UserSettings;
  isLoaded: boolean;
  isSaving: boolean;
  errorMessage: string | null;
  updateSetting: (key: SettingKey, value: boolean) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const storageKey = user ? `user_settings:${user.id}` : null;
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const settingsRef = useRef(settings);
  const savingRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    setIsLoaded(false);
    setSettings(DEFAULT_SETTINGS);
    settingsRef.current = DEFAULT_SETTINGS;
    setErrorMessage(null);

    const loadSettings = async () => {
      try {
        const raw = storageKey ? await AsyncStorage.getItem(storageKey) : null;
        const loaded = parseSettings(raw);
        if (!cancelled) {
          settingsRef.current = loaded;
          setSettings(loaded);
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
        if (!cancelled) setErrorMessage('Could not load your settings. Defaults are shown.');
      } finally {
        if (!cancelled) setIsLoaded(true);
      }
    };

    loadSettings();
    return () => {
      cancelled = true;
    };
  }, [storageKey]);

  const updateSetting = useCallback(
    async (key: SettingKey, value: boolean) => {
      if (!storageKey || !isLoaded || savingRef.current) return;

      const previous = settingsRef.current;
      const updated = { ...previous, [key]: value };
      savingRef.current = true;
      settingsRef.current = updated;
      setSettings(updated);
      setIsSaving(true);
      setErrorMessage(null);

      try {
        await AsyncStorage.setItem(storageKey, JSON.stringify(updated));
      } catch (error) {
        console.error('Failed to save settings:', error);
        settingsRef.current = previous;
        setSettings(previous);
        setErrorMessage('Could not save your settings. Please try again.');
        throw error;
      } finally {
        savingRef.current = false;
        setIsSaving(false);
      }
    },
    [isLoaded, storageKey]
  );

  const value = useMemo(
    () => ({ settings, isLoaded, isSaving, errorMessage, updateSetting }),
    [settings, isLoaded, isSaving, errorMessage, updateSetting]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
