/**
 * Alert helpers that work on phones AND in the browser.
 * React Native's Alert.alert does nothing on web, so we use the browser dialogs there.
 */
import { Alert, Platform } from 'react-native';

/**
 * Show a message with an OK button. `onClose` runs after the user dismisses it.
 */
export function showMessage(title: string, message?: string, onClose?: () => void): void {
  if (Platform.OS === 'web') {
    window.alert(message ? `${title}\n\n${message}` : title);
    onClose?.();
    return;
  }

  Alert.alert(title, message, [{ text: 'OK', onPress: onClose }]);
}

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  destructive?: boolean;
  onConfirm: () => void;
}

/**
 * Ask "Are you sure?" and run `onConfirm` only if the user agrees.
 */
export function confirmAction({
  title,
  message,
  confirmText = 'OK',
  destructive = false,
  onConfirm,
}: ConfirmOptions): void {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n\n${message}`)) onConfirm();
    return;
  }

  Alert.alert(title, message, [
    { text: 'Cancel', style: 'cancel' },
    { text: confirmText, style: destructive ? 'destructive' : 'default', onPress: onConfirm },
  ]);
}