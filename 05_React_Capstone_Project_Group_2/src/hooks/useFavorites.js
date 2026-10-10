import { useState, useEffect, useCallback } from 'react';

const KEY = 'lakbay-favorites';

const read = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
};

// Call once in a parent component and pass isFav/toggle down to the cards.
export default function useFavorites() {
  const [favs, setFavs] = useState(read);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(favs));
    } catch {
      /* storage unavailable */
    }
  }, [favs]);

  const toggle = useCallback(
    (id) => setFavs((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])),
    []
  );
  const isFav = useCallback((id) => favs.includes(id), [favs]);

  return { favs, isFav, toggle };
}
