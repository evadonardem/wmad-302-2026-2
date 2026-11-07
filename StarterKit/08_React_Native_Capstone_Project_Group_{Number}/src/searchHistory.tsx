import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

// Search history is intentionally kept in memory so reopening the app starts a fresh session.
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

  const value = useMemo(
    () => ({
      entries,
      recordSearch: (city: string) => {
        const trimmed = city.trim();
        if (!trimmed) return;
        setEntries((prev) => [trimmed, ...prev.filter((e) => e.toLowerCase() !== trimmed.toLowerCase())].slice(0, MAX_ENTRIES));
      },
    }),
    [entries],
  );

  return <SearchHistoryContext.Provider value={value}>{children}</SearchHistoryContext.Provider>;
}

export const useSearchHistory = () => useContext(SearchHistoryContext);
