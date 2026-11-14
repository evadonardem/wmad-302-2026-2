import { favoritesReducer, initialFavoritesState } from '@/context/FavoritesContext';
import { settingsReducer, initialSettingsState } from '@/context/SettingsContext';

describe('favoritesReducer', () => {
  it('hydrates persisted ids', () => {
    const state = favoritesReducer(initialFavoritesState, { type: 'FAVORITES_HYDRATE', payload: [1, 2] });
    expect(state).toEqual({ ids: [1, 2], hydrated: true });
  });

  it('toggles a recipe on and off', () => {
    const on = favoritesReducer(initialFavoritesState, { type: 'FAVORITES_TOGGLE', payload: 5 });
    expect(on.ids).toEqual([5]);
    const off = favoritesReducer(on, { type: 'FAVORITES_TOGGLE', payload: 5 });
    expect(off.ids).toEqual([]);
  });

  it('removes and clears', () => {
    const base = { ids: [1, 2, 3], hydrated: true };
    expect(favoritesReducer(base, { type: 'FAVORITES_REMOVE', payload: 2 }).ids).toEqual([1, 3]);
    expect(favoritesReducer(base, { type: 'FAVORITES_CLEAR' }).ids).toEqual([]);
  });
});

describe('settingsReducer', () => {
  it('hydrates and updates settings', () => {
    const hydrated = settingsReducer(initialSettingsState, {
      type: 'SETTINGS_HYDRATE',
      payload: { darkMode: true, notifications: false },
    });
    expect(hydrated).toEqual({ darkMode: true, notifications: false, hydrated: true });
    const updated = settingsReducer(hydrated, { type: 'SETTINGS_SET', payload: { darkMode: false } });
    expect(updated.darkMode).toBe(false);
    expect(updated.notifications).toBe(false);
  });
});
