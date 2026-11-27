/**
 * Component tests - ErrorBoundary and shared UI components
 */
import React from 'react';
import { Text } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import {
  RecipeCard,
  RecipeListItem,
  CategoryChip,
  EmptyState,
  LoadingOverlay,
  Skeleton,
  RecipeCardSkeleton,
  Logo,
} from '@/components/CommonComponents';
import { sampleRecipe } from '../../test-utils/fixtures';

describe('ErrorBoundary', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('shows its children when nothing is wrong', () => {
    const { getByText, queryByText } = render(
      <ErrorBoundary>
        <Text>All good</Text>
      </ErrorBoundary>
    );
    expect(getByText('All good')).toBeTruthy();
    expect(queryByText('Something went wrong')).toBeNull();
  });

  it('shows a friendly message and reports the error when a child crashes', () => {
    const onError = jest.fn();
    function Bomb(): React.ReactElement {
      throw new Error('boom');
    }

    const { getByText } = render(
      <ErrorBoundary onError={onError}>
        <Bomb />
      </ErrorBoundary>
    );

    expect(getByText('Something went wrong')).toBeTruthy();
    expect(getByText('Try again')).toBeTruthy();
    expect(onError).toHaveBeenCalledWith(expect.objectContaining({ message: 'boom' }), expect.anything());
  });

  it('"Try again" shows the children again once the problem is gone', () => {
    let shouldThrow = true;
    function Flaky(): React.ReactElement {
      if (shouldThrow) throw new Error('boom');
      return <Text>Recovered</Text>;
    }

    const { getByText, queryByText } = render(
      <ErrorBoundary>
        <Flaky />
      </ErrorBoundary>
    );
    expect(queryByText('Recovered')).toBeNull();

    shouldThrow = false;
    fireEvent.press(getByText('Try again'));
    expect(getByText('Recovered')).toBeTruthy();
  });
});

describe('RecipeCard', () => {
  it('shows the recipe details', () => {
    const { getByText } = render(<RecipeCard recipe={sampleRecipe} onPress={jest.fn()} />);
    expect(getByText('Classic Margherita Pizza')).toBeTruthy();
    expect(getByText('Easy')).toBeTruthy();
    expect(getByText('Italian')).toBeTruthy();
    expect(getByText('Dinner')).toBeTruthy();
    expect(getByText(/35 min/)).toBeTruthy();
    expect(getByText(/4\.6 \(98 reviews\)/)).toBeTruthy();
  });

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    const { getByText } = render(<RecipeCard recipe={sampleRecipe} onPress={onPress} />);
    fireEvent.press(getByText('Classic Margherita Pizza'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it.each(['Medium', 'Hard'] as const)('renders a %s recipe', (difficulty) => {
    const { getByText } = render(
      <RecipeCard recipe={{ ...sampleRecipe, difficulty }} onPress={jest.fn()} />
    );
    expect(getByText(difficulty)).toBeTruthy();
  });
});

describe('RecipeListItem', () => {
  it('shows the recipe and an optional right element', () => {
    const { getByText } = render(
      <RecipeListItem recipe={sampleRecipe} onPress={jest.fn()} right={<Text>Remove</Text>} />
    );
    expect(getByText('Classic Margherita Pizza')).toBeTruthy();
    expect(getByText('Remove')).toBeTruthy();
  });

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    const { getByText } = render(<RecipeListItem recipe={sampleRecipe} onPress={onPress} />);
    fireEvent.press(getByText('Classic Margherita Pizza'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});

describe('CategoryChip', () => {
  it('shows the label and handles presses', () => {
    const onPress = jest.fn();
    const { getByText } = render(<CategoryChip label="Pasta" onPress={onPress} />);
    fireEvent.press(getByText('Pasta'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders selected and with an icon', () => {
    const { getByText } = render(
      <CategoryChip label="Pizza" selected icon="pizza" onPress={jest.fn()} />
    );
    expect(getByText('Pizza')).toBeTruthy();
  });
});

describe('EmptyState', () => {
  it('shows the message and runs the action', () => {
    const onAction = jest.fn();
    const { getByText } = render(
      <EmptyState
        icon="heart-outline"
        title="No Favorites Yet"
        message="Recipes you love will appear here"
        actionLabel="Browse Recipes"
        onAction={onAction}
      />
    );
    expect(getByText('No Favorites Yet')).toBeTruthy();
    expect(getByText('Recipes you love will appear here')).toBeTruthy();
    fireEvent.press(getByText('Browse Recipes'));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('has no button without an action', () => {
    const { queryByText } = render(
      <EmptyState icon="magnify" title="Nothing" message="Try again" actionLabel="Go" />
    );
    expect(queryByText('Go')).toBeNull();
  });
});

describe('LoadingOverlay and skeletons', () => {
  it('LoadingOverlay only shows while visible', () => {
    const { queryByText, rerender } = render(<LoadingOverlay visible message="Please wait" />);
    expect(queryByText('Please wait')).toBeTruthy();
    rerender(<LoadingOverlay visible={false} />);
    expect(queryByText('Please wait')).toBeNull();
  });

  it('LoadingOverlay has a default message', () => {
    const { getByText } = render(<LoadingOverlay visible />);
    expect(getByText('Loading...')).toBeTruthy();
  });

  it('skeletons render without crashing', () => {
    const { toJSON, unmount } = render(
      <>
        <Skeleton height={10} width={50} />
        <RecipeCardSkeleton />
      </>
    );
    expect(toJSON()).not.toBeNull();
    unmount();
  });
});

describe('Logo', () => {
  it('shows the croc logo with an accessible label', () => {
    const { getByLabelText } = render(<Logo />);
    expect(getByLabelText('Croc Book logo')).toBeTruthy();
  });

  it('uses the size it is given', () => {
    const { getByLabelText } = render(<Logo size={120} />);
    expect(getByLabelText('Croc Book logo').props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ width: 120, height: 120 })])
    );
  });

  it('is shown on the error screen too', () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    function Bomb(): React.ReactElement {
      throw new Error('boom');
    }
    const { getByLabelText } = render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>
    );
    expect(getByLabelText('Croc Book logo')).toBeTruthy();
    jest.restoreAllMocks();
  });
});