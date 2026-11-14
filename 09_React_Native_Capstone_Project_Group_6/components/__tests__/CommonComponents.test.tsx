/* eslint-env jest */
import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import {
  EmptyState,
  ErrorState,
  LoadingState,
  RecipeListItem,
} from '@/components/CommonComponents';
import { makeRecipe } from '../../test-utils/fixtures';

const renderUi = (ui: React.ReactElement) => render(<PaperProvider>{ui}</PaperProvider>);

describe('LoadingState', () => {
  it('shows the message', () => {
    const { getByText } = renderUi(<LoadingState message="Loading recipes..." />);
    expect(getByText('Loading recipes...')).toBeTruthy();
  });
});

describe('EmptyState', () => {
  it('shows title, message and an action that works', () => {
    const onAction = jest.fn();
    const { getByText } = renderUi(
      <EmptyState
        icon="heart-outline"
        title="No Favorites Yet"
        message="Tap the heart"
        actionLabel="Browse Recipes"
        onAction={onAction}
      />,
    );
    expect(getByText('No Favorites Yet')).toBeTruthy();
    expect(getByText('Tap the heart')).toBeTruthy();
    fireEvent.press(getByText('Browse Recipes'));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('hides the button when there is no action', () => {
    const { queryByText } = renderUi(<EmptyState icon="heart-outline" title="Nothing" />);
    expect(queryByText('Browse Recipes')).toBeNull();
  });
});

describe('ErrorState', () => {
  it('shows the error and retries', () => {
    const onRetry = jest.fn();
    const { getByText } = renderUi(<ErrorState message="Network Error" onRetry={onRetry} />);
    expect(getByText('Something went wrong')).toBeTruthy();
    expect(getByText('Network Error')).toBeTruthy();
    fireEvent.press(getByText('Try again'));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('has no retry button without onRetry', () => {
    const { queryByText } = renderUi(<ErrorState message="Oops" />);
    expect(queryByText('Try again')).toBeNull();
  });
});

describe('RecipeListItem', () => {
  const recipe = makeRecipe();

  it('shows the recipe details', () => {
    const { getByText } = renderUi(
      <RecipeListItem
        recipe={recipe}
        onPress={jest.fn()}
        isFavorite={false}
        onToggleFavorite={jest.fn()}
      />,
    );
    expect(getByText('Margherita Pizza')).toBeTruthy();
    expect(getByText('Italian')).toBeTruthy();
    expect(getByText('Easy')).toBeTruthy();
  });

  it('opens the recipe when the row is pressed', () => {
    const onPress = jest.fn();
    const { getByText } = renderUi(
      <RecipeListItem
        recipe={recipe}
        onPress={onPress}
        isFavorite={false}
        onToggleFavorite={jest.fn()}
      />,
    );
    fireEvent.press(getByText('Margherita Pizza'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('toggles the favorite from the heart and labels it correctly', () => {
    const onToggle = jest.fn();
    const { getByLabelText, rerender } = renderUi(
      <RecipeListItem
        recipe={recipe}
        onPress={jest.fn()}
        isFavorite={false}
        onToggleFavorite={onToggle}
      />,
    );
    fireEvent.press(getByLabelText('Add to favorites'));
    expect(onToggle).toHaveBeenCalledTimes(1);

    rerender(
      <PaperProvider>
        <RecipeListItem
          recipe={recipe}
          onPress={jest.fn()}
          isFavorite
          onToggleFavorite={onToggle}
        />
      </PaperProvider>,
    );
    expect(getByLabelText('Remove from favorites')).toBeTruthy();
  });
});
