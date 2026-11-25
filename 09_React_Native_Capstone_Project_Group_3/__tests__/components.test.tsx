import React from 'react';
import { Text } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import { theme } from '@/constants/theme';
import {
  CategoryChip,
  EmptyState,
  ErrorState,
  RecipeCard,
  StarRating,
} from '@/components/CommonComponents';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { makeRecipe } from '@/test-utils/fixtures';

const wrap = (ui: React.ReactElement) => render(<PaperProvider theme={theme}>{ui}</PaperProvider>);

describe('RecipeCard', () => {
  const recipe = makeRecipe();

  it('shows the recipe details and handles presses', () => {
    const onPress = jest.fn();
    const onToggleFavorite = jest.fn();
    const { getByText, getByTestId } = wrap(
      <RecipeCard recipe={recipe} onPress={onPress} onToggleFavorite={onToggleFavorite} />
    );

    expect(getByText('Classic Margherita Pizza')).toBeTruthy();
    expect(getByText('Easy')).toBeTruthy();
    expect(getByText(/35 min/)).toBeTruthy();

    fireEvent.press(getByTestId('recipe-card-1'));
    expect(onPress).toHaveBeenCalledTimes(1);

    fireEvent.press(getByTestId('favorite-button-1'));
    expect(onToggleFavorite).toHaveBeenCalledTimes(1);
  });

  it('renders the compact variant and omits the heart without a handler', () => {
    const { getByText, queryByTestId } = wrap(
      <RecipeCard recipe={recipe} variant="compact" onPress={jest.fn()} />
    );
    expect(getByText('Italian')).toBeTruthy();
    expect(queryByTestId('favorite-button-1')).toBeNull();
  });
});

describe('state components', () => {
  it('EmptyState triggers its call to action', () => {
    const onAction = jest.fn();
    const { getByText } = wrap(
      <EmptyState icon="heart-outline" title="No Favorites Yet" message="Save some" actionLabel="Browse" onAction={onAction} />
    );
    expect(getByText('No Favorites Yet')).toBeTruthy();
    fireEvent.press(getByText('Browse'));
    expect(onAction).toHaveBeenCalled();
  });

  it('ErrorState shows the message and retries', () => {
    const onRetry = jest.fn();
    const { getByText } = wrap(<ErrorState message="Network down" onRetry={onRetry} />);
    expect(getByText('Network down')).toBeTruthy();
    fireEvent.press(getByText('Try again'));
    expect(onRetry).toHaveBeenCalled();
  });

  it('CategoryChip reports selection state and presses', () => {
    const onPress = jest.fn();
    const { getByText, getByRole } = wrap(<CategoryChip label="Pasta" selected onPress={onPress} />);
    fireEvent.press(getByText('Pasta'));
    expect(onPress).toHaveBeenCalled();
    expect(getByRole('button').props.accessibilityState).toEqual({ selected: true });
  });

  it('StarRating exposes an accessible label', () => {
    const { getByLabelText } = wrap(<StarRating rating={4.5} />);
    expect(getByLabelText('Rated 4.5 out of 5')).toBeTruthy();
  });
});

describe('ConfirmDialog', () => {
  it('calls confirm and cancel handlers', () => {
    const onConfirm = jest.fn();
    const onCancel = jest.fn();
    const { getByText } = wrap(
      <ConfirmDialog visible title="Logout" message="Sure?" confirmLabel="Yes" onConfirm={onConfirm} onCancel={onCancel} />
    );
    fireEvent.press(getByText('Yes'));
    fireEvent.press(getByText('Cancel'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});

describe('ErrorBoundary', () => {
  function Boom({ explode }: { explode: boolean }) {
    if (explode) throw new Error('kaboom');
    return <Text>All good</Text>;
  }

  it('renders children when nothing fails', () => {
    const { getByText } = wrap(
      <ErrorBoundary>
        <Boom explode={false} />
      </ErrorBoundary>
    );
    expect(getByText('All good')).toBeTruthy();
  });

  it('shows a friendly fallback and recovers after "Try again"', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    let explode = true;
    const Flaky = () => <Boom explode={explode} />;

    const { getByTestId, getByText, queryByTestId } = wrap(
      <ErrorBoundary>
        <Flaky />
      </ErrorBoundary>
    );
    expect(getByTestId('error-boundary-fallback')).toBeTruthy();
    expect(getByText('Oops, something went wrong')).toBeTruthy();

    explode = false;
    fireEvent.press(getByText('Try again'));
    expect(queryByTestId('error-boundary-fallback')).toBeNull();
    expect(getByText('All good')).toBeTruthy();
    spy.mockRestore();
  });
});
