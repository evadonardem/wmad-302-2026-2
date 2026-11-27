/**
 * Unit tests - alert helpers (phone vs browser)
 */
import { Alert, Platform } from 'react-native';
import type { AlertButton } from 'react-native';
import { showMessage, confirmAction } from '@/utils/alerts';

type BrowserDialogs = { alert: jest.Mock; confirm: jest.Mock };
const browser = globalThis as unknown as BrowserDialogs;

let alertSpy: jest.SpyInstance;

beforeEach(() => {
  alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
  browser.alert = jest.fn();
  browser.confirm = jest.fn();
});

afterEach(() => {
  jest.restoreAllMocks();
});

// Buttons passed to Alert.alert in the last call
const lastButtons = (): AlertButton[] => alertSpy.mock.calls[0][2] as AlertButton[];

describe('on a phone', () => {
  it('showMessage opens a native alert and runs onClose when OK is pressed', () => {
    const onClose = jest.fn();
    showMessage('Login Failed', 'Wrong password', onClose);

    expect(alertSpy).toHaveBeenCalledWith('Login Failed', 'Wrong password', expect.any(Array));
    expect(browser.alert).not.toHaveBeenCalled();

    lastButtons()[0].onPress?.();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('confirmAction has Cancel and a confirm button', () => {
    const onConfirm = jest.fn();
    confirmAction({ title: 'Logout', message: 'Sure?', confirmText: 'Logout', destructive: true, onConfirm });

    const [cancel, confirm] = lastButtons();
    expect(cancel).toMatchObject({ text: 'Cancel', style: 'cancel' });
    expect(confirm).toMatchObject({ text: 'Logout', style: 'destructive' });

    cancel.onPress?.();
    expect(onConfirm).not.toHaveBeenCalled();
    confirm.onPress?.();
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('confirmAction defaults to a normal OK button', () => {
    confirmAction({ title: 'Continue', message: 'Go on?', onConfirm: jest.fn() });
    expect(lastButtons()[1]).toMatchObject({ text: 'OK', style: 'default' });
  });
});

describe('in the browser', () => {
  beforeEach(() => {
    jest.replaceProperty(Platform, 'OS', 'web');
  });

  it('showMessage uses window.alert and then calls onClose', () => {
    const onClose = jest.fn();
    showMessage('Error', 'Please enter a username', onClose);

    expect(browser.alert).toHaveBeenCalledWith('Error\n\nPlease enter a username');
    expect(alertSpy).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('showMessage works with only a title', () => {
    showMessage('Done');
    expect(browser.alert).toHaveBeenCalledWith('Done');
  });

  it('confirmAction runs onConfirm when the user agrees', () => {
    browser.confirm.mockReturnValue(true);
    const onConfirm = jest.fn();
    confirmAction({ title: 'Remove', message: 'Sure?', onConfirm });

    expect(browser.confirm).toHaveBeenCalledWith('Remove\n\nSure?');
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('confirmAction does nothing when the user cancels', () => {
    browser.confirm.mockReturnValue(false);
    const onConfirm = jest.fn();
    confirmAction({ title: 'Remove', message: 'Sure?', onConfirm });

    expect(onConfirm).not.toHaveBeenCalled();
    expect(alertSpy).not.toHaveBeenCalled();
  });
});