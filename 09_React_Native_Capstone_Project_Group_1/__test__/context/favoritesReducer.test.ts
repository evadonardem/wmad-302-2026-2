/**
 * Unit tests - favoritesReducer
 */
import { favoritesReducer } from '@/context/FavoritesContext';
import type { FavoritesState } from '@/context/FavoritesContext';

const initialState: FavoritesState = { ids: [], isLoading: true };

describe('favoritesReducer', () => {
  it('FAVORITES_HYDRATE loads the saved ids and stops loading', () => {
    const state = favoritesReducer(initialState, { type: 'FAVORITES_HYDRATE', payload: [3, 1] });
    expect(state).toEqual({ ids: [3, 1], isLoading: false });
  });

  it('FAVORITES_ADD puts the newest favorite first', () => {
    const state = favoritesReducer(
      { ids: [1], isLoading: false },
      { type: 'FAVORITES_ADD', payload: 2 }
    );
    expect(state.ids).toEqual([2, 1]);
  });

  it('FAVORITES_ADD ignores duplicates', () => {
    const before: FavoritesState = { ids: [1, 2], isLoading: false };
    const state = favoritesReducer(before, { type: 'FAVORITES_ADD', payload: 2 });
    expect(state).toBe(before);
  });

  it('FAVORITES_REMOVE removes only that id', () => {
    const state = favoritesReducer(
      { ids: [1, 2, 3], isLoading: false },
      { type: 'FAVORITES_REMOVE', payload: 2 }
    );
    expect(state.ids).toEqual([1, 3]);
  });

  it('FAVORITES_REMOVE of an unknown id changes nothing', () => {
    const state = favoritesReducer(
      { ids: [1], isLoading: false },
      { type: 'FAVORITES_REMOVE', payload: 99 }
    );
    expect(state.ids).toEqual([1]);
  });

  it('FAVORITES_CLEAR empties the list', () => {
    const state = favoritesReducer(
      { ids: [1, 2], isLoading: false },
      { type: 'FAVORITES_CLEAR' }
    );
    expect(state.ids).toEqual([]);
  });
});