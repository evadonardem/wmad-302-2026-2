/* eslint-env jest */
import React from 'react';
import { Vibration } from 'react-native';
import { act, fireEvent, render } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import { StepTimer } from '@/components/StepTimer';

const renderTimer = (text: string) =>
  render(
    <PaperProvider>
      <StepTimer text={text} />
    </PaperProvider>
  );

const advance = (ms: number) =>
  act(() => {
    jest.advanceTimersByTime(ms);
  });

beforeEach(() => {
  jest.useFakeTimers();
  jest.spyOn(Vibration, 'vibrate').mockImplementation(() => undefined);
  jest.spyOn(Vibration, 'cancel').mockImplementation(() => undefined);
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

describe('StepTimer', () => {
  it('shows nothing when the step has no time', () => {
    const { queryByText } = renderTimer('Chop the onions.');
    expect(queryByText(/Start timer/)).toBeNull();
  });

  it('offers a start button with the time found in the step', () => {
    const { getByText } = renderTimer('Simmer the beef for 30 minutes.');
    expect(getByText('Start timer · 30 min')).toBeTruthy();
  });

  it('counts down once started', () => {
    const { getByText } = renderTimer('Simmer for 30 minutes.');
    fireEvent.press(getByText('Start timer · 30 min'));
    expect(getByText('30:00')).toBeTruthy();
    advance(5000);
    expect(getByText('29:55')).toBeTruthy();
  });

  it('pauses, keeps the time, and resumes', () => {
    const { getByText, getByLabelText } = renderTimer('Simmer for 30 minutes.');
    fireEvent.press(getByText('Start timer · 30 min'));
    advance(10000);
    fireEvent.press(getByLabelText('Pause timer'));
    advance(20000); // paused, so nothing changes
    expect(getByText('29:50')).toBeTruthy();
    fireEvent.press(getByLabelText('Resume timer'));
    advance(5000);
    expect(getByText('29:45')).toBeTruthy();
  });

  it('resets back to the start button', () => {
    const { getByText, getByLabelText } = renderTimer('Simmer for 30 minutes.');
    fireEvent.press(getByText('Start timer · 30 min'));
    advance(3000);
    fireEvent.press(getByLabelText('Reset timer'));
    expect(getByText('Start timer · 30 min')).toBeTruthy();
  });

  it('shows "Time\'s up" and vibrates when finished, then can be dismissed', () => {
    const { getByText } = renderTimer('Boil for 1 minute.');
    fireEvent.press(getByText('Start timer · 1 min'));
    advance(61000);
    expect(getByText(/Time's up/)).toBeTruthy();
    expect(Vibration.vibrate).toHaveBeenCalled();
    fireEvent.press(getByText('Dismiss'));
    expect(getByText('Start timer · 1 min')).toBeTruthy();
  });
});
