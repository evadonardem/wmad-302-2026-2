import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'marketplace_search_counts';

type SearchCounts = Record<string, number>;

async function readSearchCounts(): Promise<SearchCounts> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return {};

  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      throw new Error('Invalid search history format.');
    }

    return Object.fromEntries(
      Object.entries(parsed).filter(
        ([term, count]) => term.length > 0 && typeof count === 'number' && count > 0
      )
    );
  } catch (error) {
    console.error('Could not read search history:', error);
    throw new Error('Saved search history is corrupted.');
  }
}

export async function recordSearch(term: string): Promise<void> {
  const normalizedTerm = term.trim().toLowerCase();
  if (!normalizedTerm) return;

  const counts = await readSearchCounts();
  counts[normalizedTerm] = (counts[normalizedTerm] ?? 0) + 1;
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(counts));
}

export async function getPopularSearches(limit = 4): Promise<string[]> {
  const counts = await readSearchCounts();
  return Object.entries(counts)
    .sort(([termA, countA], [termB, countB]) => countB - countA || termA.localeCompare(termB))
    .slice(0, limit)
    .map(([term]) => term);
}
