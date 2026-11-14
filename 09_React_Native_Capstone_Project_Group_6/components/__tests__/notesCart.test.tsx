/* eslint-env jest */
import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PaperProvider } from 'react-native-paper';
import { CookbookProvider } from '@/context/CookbookContext';
import { CartButton } from '@/components/CartButton';
import { RecipeNotes } from '@/components/RecipeNotes';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));
jest.mock('@react-native-async-storage/async-storage', () =>
  jest.requireActual('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

const renderUi = (ui: React.ReactElement) =>
  render(
    <PaperProvider>
      <CookbookProvider>{ui}</CookbookProvider>
    </PaperProvider>
  );

// Let CookbookProvider finish reading AsyncStorage before the test acts,
// otherwise the late load would overwrite what the test just did.
const flushStorage = () =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

beforeEach(async () => {
  await AsyncStorage.clear();
  mockPush.mockClear();
});

describe('CartButton', () => {
  it('shows the number of items still to buy and opens the shopping list', async () => {
    await AsyncStorage.setItem(
      'cookbook_shopping',
      JSON.stringify([
        { id: 'a', name: 'Rice', checked: false, recipeIds: [] },
        { id: 'b', name: 'Salt', checked: false, recipeIds: [] },
        { id: 'c', name: 'Eggs', checked: true, recipeIds: [] },
      ])
    );
    const { getByText, getByLabelText } = renderUi(<CartButton />);
    await flushStorage();
    await waitFor(() => expect(getByText('2')).toBeTruthy());
    fireEvent.press(getByLabelText('Shopping list, 2 items to buy'));
    expect(mockPush).toHaveBeenCalledWith('/(app)/cookbook/shopping-list');
  });

  it('shows no badge when the list is empty', async () => {
    const { getByLabelText, queryByText } = renderUi(<CartButton />);
    await flushStorage();
    await waitFor(() => expect(getByLabelText('Shopping list')).toBeTruthy());
    expect(queryByText('0')).toBeNull();
  });
});

describe('RecipeNotes', () => {
  it('disables Save until the text changes, then saves the note', async () => {
    const onMessage = jest.fn();
    const { getByLabelText, getByText } = renderUi(<RecipeNotes recipeId={7} onMessage={onMessage} />);
    await flushStorage();
    fireEvent.changeText(getByLabelText('Recipe note'), 'Less salt next time');
    fireEvent.press(getByText('Save note'));
    await waitFor(() => expect(onMessage).toHaveBeenCalledWith('Note saved'));
    await waitFor(async () => {
      const saved = JSON.parse((await AsyncStorage.getItem('cookbook_notes')) as string);
      expect(saved[7]).toBe('Less salt next time');
    });
  });

  it('shows a note saved earlier', async () => {
    await AsyncStorage.setItem('cookbook_notes', JSON.stringify({ 7: 'Used oat milk' }));
    const { getByDisplayValue } = renderUi(<RecipeNotes recipeId={7} onMessage={() => undefined} />);
    await flushStorage();
    await waitFor(() => expect(getByDisplayValue('Used oat milk')).toBeTruthy());
  });

  it('removes the note when saved empty', async () => {
    await AsyncStorage.setItem('cookbook_notes', JSON.stringify({ 7: 'Used oat milk' }));
    const onMessage = jest.fn();
    const { getByLabelText, getByText, getByDisplayValue } = renderUi(
      <RecipeNotes recipeId={7} onMessage={onMessage} />
    );
    await flushStorage();
    await waitFor(() => expect(getByDisplayValue('Used oat milk')).toBeTruthy());
    fireEvent.changeText(getByLabelText('Recipe note'), '');
    fireEvent.press(getByText('Save note'));
    await waitFor(() => expect(onMessage).toHaveBeenCalledWith('Note removed'));
  });
});