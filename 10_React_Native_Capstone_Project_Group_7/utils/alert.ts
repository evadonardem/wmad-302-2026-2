import { Alert as NativeAlert, Platform } from 'react-native';

type AlertArguments = Parameters<typeof NativeAlert.alert>;
type AlertButton = NonNullable<AlertArguments[2]>[number];

export const Alert = {
  alert(...args: AlertArguments): void {
    const [title, message, buttons] = args;
    if (Platform.OS !== 'web' || typeof window === 'undefined') {
      NativeAlert.alert(...args);
      return;
    }

    const text = [title, message].filter(Boolean).join('\n\n');
    if (!buttons?.length) {
      window.alert(text);
      return;
    }

    if (buttons.length === 1) {
      window.alert(text);
      buttons[0].onPress?.();
      return;
    }

    const cancelButton = buttons.find((button: AlertButton) => button.style === 'cancel');
    const actionButton = buttons.find((button: AlertButton) => button.style !== 'cancel') ?? buttons[0];
    if (window.confirm(text)) {
      actionButton.onPress?.();
    } else {
      cancelButton?.onPress?.();
    }

  },
};
