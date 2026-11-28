import { Alert, Platform } from 'react-native';

type AlertButtons = Parameters<typeof Alert.alert>[2];

type BrowserDialogs = typeof globalThis & {
  alert?: (message: string) => void;
  confirm?: (message: string) => boolean;
};

export function showAlert(title: string, message?: string, buttons?: AlertButtons): void {
  if (Platform.OS !== 'web') {
    Alert.alert(title, message, buttons);
    return;
  }

  const browserDialogs = globalThis as BrowserDialogs;
  const alertMessage = [title, message].filter(Boolean).join('\n\n');
  if (!browserDialogs.alert) {
    Alert.alert(title, message, buttons);
    return;
  }

  if (!buttons?.length) {
    browserDialogs.alert(alertMessage);
    return;
  }

  if (buttons.length === 1) {
    browserDialogs.alert(alertMessage);
    buttons[0].onPress?.();
    return;
  }

  const cancelButton = buttons.find((button) => button.style === 'cancel');
  const confirmButton = buttons.find((button) => button.style !== 'cancel') ?? buttons[0];
  const alternateButton = cancelButton ?? buttons.find((button) => button !== confirmButton);
  if (!browserDialogs.confirm) {
    browserDialogs.alert(alertMessage);
    return;
  }

  const choices = [confirmButton.text, alternateButton?.text].filter(Boolean).join(' / ');
  const accepted = browserDialogs.confirm(`${alertMessage}\n\n${choices}`);
  (accepted ? confirmButton : alternateButton)?.onPress?.();
}
