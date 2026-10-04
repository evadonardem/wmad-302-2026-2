const FAVORITES_KEY = 'favoriteSpots';

function normalizeFavoritePhoto(item) {
  if (!item || typeof item !== 'object') {
    return null;
  }

  return {
    id: String(item.id || item.name || Math.random().toString(36).slice(2)),
    imageUrl: item.imageUrl || '',
    altText: item.altText || 'Favorite place',
    photographer: item.photographer || 'Unknown photographer',
    photographerUrl: item.photographerUrl || '#',
    locationName: item.locationName || '',
  };
}

export function readFavorites() {
  try {
    const storedValue = JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');

    if (!Array.isArray(storedValue)) {
      return [];
    }

    return storedValue
      .map((item) => {
        if (typeof item === 'string' || typeof item === 'number') {
          return {
            id: String(item),
            imageUrl: '',
            altText: 'Saved favorite place',
            photographer: 'Unknown photographer',
            photographerUrl: '#',
            locationName: '',
          };
        }

        return normalizeFavoritePhoto(item);
      })
      .filter(Boolean);
  } catch {
    return [];
  }
}

export function saveFavorites(favorites) {
  try {
    const normalized = favorites.map((favorite) => normalizeFavoritePhoto(favorite)).filter(Boolean);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(normalized));
  } catch {
    // ignore storage errors (e.g. private browsing)
  }
}
