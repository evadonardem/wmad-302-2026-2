/* eslint-env jest */
import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import { CookbookProvider } from '@/context/CookbookContext';
import { OfflineBanner } from '@/components/OfflineBanner';
import { RecipeActions } from '@/components/RecipeActions';
import { RecipePickerDialog } from '@/components/RecipePickerDialog';
import { recipeApi } from '@/services/recipeApi';
import { SAMPLE_RECIPES } from '../../test-utils/fixtures';

jest.mock('@react-native-async-storage/async-storage', () =>
  jest.requireActual('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

const renderUi = (ui: React.ReactElement) =>
  render(
    <PaperProvider>
      <CookbookProvider>{ui}</CookbookProvider>
    </PaperProvider>
  );

describe('OfflineBanner', () => {
  afterEach(() => {
    recipeApi.isUsingCache = false;
  });

  it('is hidden when the data is live', () => {
    recipeApi.isUsingCache = false;
    const { queryByText } = renderUi(<OfflineBanner />);
    expect(queryByText(/Offline/)).toBeNull();
  });

  it('shows a message when the offline copy is used', () => {
    recipeApi.isUsingCache = true;
    const { getByText } = renderUi(<OfflineBanner />);
    expect(getByText(/Offline/)).toBeTruthy();
  });
});

describe('RecipeActions', () => {
  it('"Shopping list" reports how many ingredients were added', async () => {
    const onMessage = jest.fn();
    const { getByText } = renderUi(<RecipeActions recipe={SAMPLE_RECIPES[0]} onMessage={onMessage} />);
    fireEvent.press(getByText('Shopping list'));
    await waitFor(() =>
      expect(onMessage).toHaveBeenCalledWith('Added 3 ingredients to your shopping list')
    );
  });

  it('can create a collection and add the recipe to it', async () => {
    const onMessage = jest.fn();
    const { getByText, getByLabelText } = renderUi(
      <RecipeActions recipe={SAMPLE_RECIPES[0]} onMessage={onMessage} />
    );
    fireEvent.press(getByText('Collection'));
    fireEvent.changeText(getByLabelText('New collection'), 'Dinners');
    fireEvent.press(getByText('Create and add'));
    await waitFor(() => expect(onMessage).toHaveBeenCalledWith('Added to "Dinners"'));
  });

  it('can plan the meal', async () => {
    const onMessage = jest.fn();
    const { getByText } = renderUi(<RecipeActions recipe={SAMPLE_RECIPES[0]} onMessage={onMessage} />);
    fireEvent.press(getByText('Plan meal'));
    fireEvent.press(getByText('Add to plan'));
    await waitFor(() => expect(onMessage).toHaveBeenCalled());
    expect(onMessage.mock.calls[0][0]).toMatch(/^Planned for Dinner/);
  });
});

describe('RecipePickerDialog', () => {
  it('filters by name and returns the chosen recipe', () => {
    const onPick = jest.fn();
    const { getByPlaceholderText, getByLabelText, queryByText } = renderUi(
      <RecipePickerDialog
        visible
        title="Pick"
        recipes={SAMPLE_RECIPES}
        onDismiss={() => undefined}
        onPick={onPick}
      />
    );
    fireEvent.changeText(getByPlaceholderText('Search recipes'), 'avocado');
    expect(queryByText('Margherita Pizza')).toBeNull();
    fireEvent.press(getByLabelText('Choose Avocado Toast'));
    expect(onPick).toHaveBeenCalledWith(SAMPLE_RECIPES[2]);
  });

  it('shows a message when nothing matches', () => {
    const { getByPlaceholderText, getByText } = renderUi(
      <RecipePickerDialog visible title="Pick" recipes={SAMPLE_RECIPES} onDismiss={() => undefined} onPick={() => undefined} />
    );
    fireEvent.changeText(getByPlaceholderText('Search recipes'), 'zzz');
    expect(getByText('No recipes found')).toBeTruthy();
  });
});
