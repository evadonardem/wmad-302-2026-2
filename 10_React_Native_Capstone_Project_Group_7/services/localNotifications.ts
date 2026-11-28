import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Marketplace updates',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

export async function sendLocalNotification(title: string, body: string): Promise<void> {
  if (Platform.OS === 'web') {
    throw new Error('Local notifications are only available on iOS and Android.');
  }
  await Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: null,
  });
}

export async function setDealNotificationsEnabled(enabled: boolean, title: string, body: string): Promise<void> {
  if (Platform.OS === 'web') {
    if (enabled) throw new Error('Local notifications are only available on iOS and Android.');
    return;
  }
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const dealNotifications = scheduled.filter(
    (notification) => notification.content.data?.kind === 'flash-deal'
  );
  await Promise.all(dealNotifications.map(({ identifier }) =>
    Notifications.cancelScheduledNotificationAsync(identifier)
  ));
  if (!enabled) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: { kind: 'flash-deal' },
    },
    trigger: { hour: 10, minute: 0, repeats: true },
  });
}
