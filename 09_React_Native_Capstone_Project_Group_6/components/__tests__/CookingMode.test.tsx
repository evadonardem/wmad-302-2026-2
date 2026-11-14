/* eslint-env jest */
import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { CookingMode } from '@/components/CookingMode';
import { makeRecipe } from '../../test-utils/fixtures';

jest.mock('expo-keep-awake', () => ({
  activateKeepAwakeAsync: jest.fn(() => Promise.resolve()),
  deactivateKeepAwake: jest.fn(() => Promise.resolve()),
}));

const recipe = makeRecipe({
  instructions: ['Roll the dough', 'Bake for 15 minutes', 'Serve warm'],
});

const renderMode = (onExit = jest.fn()) =>
  render(
    <PaperProvider>
      <CookingMode recipe={recipe} onExit={onExit} />
    </PaperProvider>
  );

beforeEach(() => {
  jest.clearAllMocks();
});

describe('CookingMode', () => {
  it('starts on step 1 and shows its text', () => {
    const { getByText } = renderMode();
    expect(getByText('Step 1 of 3')).toBeTruthy();
    expect(getByText('Roll the dough')).toBeTruthy();
  });

  it('Previous is disabled on the first step', () => {
    const { getByText } = renderMode();
    fireEvent.press(getByText('Previous'));
    expect(getByText('Step 1 of 3')).toBeTruthy();
  });

  it('Next and Previous move between steps', () => {
    const { getByText } = renderMode();
    fireEvent.press(getByText('Next'));
    expect(getByText('Step 2 of 3')).toBeTruthy();
    fireEvent.press(getByText('Next'));
    expect(getByText('Step 3 of 3')).toBeTruthy();
    fireEvent.press(getByText('Previous'));
    expect(getByText('Step 2 of 3')).toBeTruthy();
  });

  it('the last step shows Finish, which exits', () => {
    const onExit = jest.fn();
    const { getByText, queryByText } = renderMode(onExit);
    fireEvent.press(getByText('Next'));
    fireEvent.press(getByText('Next'));
    expect(queryByText('Next')).toBeNull();
    fireEvent.press(getByText('Finish'));
    expect(onExit).toHaveBeenCalledTimes(1);
  });

  it('the close button exits', () => {
    const onExit = jest.fn();
    const { getByLabelText } = renderMode(onExit);
    fireEvent.press(getByLabelText('Exit cooking mode'));
    expect(onExit).toHaveBeenCalledTimes(1);
  });

  it('opens the ingredient list', () => {
    const { getByLabelText, getByText } = renderMode();
    fireEvent.press(getByLabelText('Show ingredients'));
    expect(getByText('• Tomato')).toBeTruthy();
  });

  it('keeps the screen awake while open and releases it when closed', () => {
    const { unmount } = renderMode();
    expect(activateKeepAwakeAsync).toHaveBeenCalledWith('cooking-mode');
    unmount();
    expect(deactivateKeepAwake).toHaveBeenCalledWith('cooking-mode');
  });

  it('the switch turns keep-awake off', () => {
    const { getByLabelText } = renderMode();
    fireEvent(getByLabelText('Keep screen awake'), 'valueChange', false);
    expect(deactivateKeepAwake).toHaveBeenCalledWith('cooking-mode');
  });

  it('shows a message when the recipe has no steps', () => {
    const empty = makeRecipe({ instructions: [] });
    const { getByText } = render(
      <PaperProvider>
        <CookingMode recipe={empty} onExit={() => undefined} />
      </PaperProvider>
    );
    expect(getByText('No steps for this recipe')).toBeTruthy();
  });
});
