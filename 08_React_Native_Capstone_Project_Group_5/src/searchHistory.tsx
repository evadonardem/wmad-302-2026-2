import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

// Pre-built search history store (not part of the assignment).
// The Search dashboard records each successful search (TODO 5.1) and the History screen
// renders the entries (TODO 5.2) and hands one back to Search (TODO 5.3).
// Kept in memory on purpose: re-opening the app starts a fresh session.
const MAX_ENTRIES = 10;

type SearchHistoryValue = {
  entries: string[];
  recordSearch: (city: string) => void;
};

const SearchHistoryContext = createContext<SearchHistoryValue>({
  entries: [],
  recordSearch: () => {},
});

export function SearchHistoryProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<string[]>([]);

  const recordSearch = useCallback((city: string) => {
    const trimmed = city.trim();
    if (!trimmed) return;
    setEntries((prev) => [
      trimmed,
      ...prev.filter((entry) => entry.toLowerCase() !== trimmed.toLowerCase()),
    ].slice(0, MAX_ENTRIES));
  }, []);

  const value = useMemo(
    () => ({ entries, recordSearch }),
    [entries, recordSearch],
  );

  return <SearchHistoryContext.Provider value={value}>{children}</SearchHistoryContext.Provider>;
}

export const useSearchHistory = () => useContext(SearchHistoryContext);
