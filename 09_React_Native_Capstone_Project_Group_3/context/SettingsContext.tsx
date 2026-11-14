/**
 * Settings Context (useReducer) - dark mode + notifications, persisted to AsyncStorage
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  ReactNode,
} from 'react';
import { AppSettings, DEFAULT_SETTINGS, settingsStorage } from '@/utils/storage';

export interface SettingsState extends AppSettings {
  hydrated: boolean;
}

export type SettingsAction =
  | { type: 'SETTINGS_HYDRATE'; payload: AppSettings }
  | { type: 'SETTINGS_SET'; payload: Partial<AppSettings> };

export const initialSettingsState: SettingsState = { ...DEFAULT_SETTINGS, hydrated: false };

export function settingsReducer(state: SettingsState, action: SettingsAction): SettingsState {
  switch (action.type) {
    case 'SETTINGS_HYDRATE':
      return { ...action.payload, hydrated: true };
    case 'SETTINGS_SET':
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

interface SettingsContextType extends AppSettings {
  setDarkMode: (value: boolean) => void;
  setNotifications: (value: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(settingsReducer, initialSettingsState);

  useEffect(() => {
    let cancelled = false;
    settingsStorage
      .get()
      .then((settings) => {
        if (!cancelled) dispatch({ type: 'SETTINGS_HYDRATE', payload: settings });
      })
      .catch(() => {
        if (!cancelled) dispatch({ type: 'SETTINGS_HYDRATE', payload: DEFAULT_SETTINGS });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (state.hydrated) {
      settingsStorage
        .set({ darkMode: state.darkMode, notifications: state.notifications })
        .catch(() => undefined);
    }
  }, [state.darkMode, state.notifications, state.hydrated]);

  const setDarkMode = useCallback(
    (value: boolean) => dispatch({ type: 'SETTINGS_SET', payload: { darkMode: value } }),
    []
  );
  const setNotifications = useCallback(
    (value: boolean) => dispatch({ type: 'SETTINGS_SET', payload: { notifications: value } }),
    []
  );

  const value = useMemo<SettingsContextType>(
    () => ({
      darkMode: state.darkMode,
      notifications: state.notifications,
      setDarkMode,
      setNotifications,
    }),
    [state.darkMode, state.notifications, setDarkMode, setNotifications]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextType {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
