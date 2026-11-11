
import axios from 'axios';

const API_URL = 'https://dummyjson.com';

export type Quote = {
  text: string;
  author: string;
  tags: string[];
};

const fallbackQuotes: Quote[] = [
  {
    text: 'Small steps, taken consistently, can lead to remarkable change.',
    author: 'Unknown',
    tags: ['growth', 'motivation'],
  },
  {
    text: 'Make room for the things that help you feel fully alive.',
    author: 'Unknown',
    tags: ['mindfulness', 'life'],
  },
  {
    text: 'A new perspective can turn an obstacle into an opportunity.',
    author: 'Unknown',
    tags: ['wisdom', 'growth'],
  },
  {
    text: 'Your pace is still progress, even when it is slow.',
    author: 'Unknown',
    tags: ['motivation', 'life'],
  },
  {
    text: 'Kindness is a quiet strength that changes every room it enters.',
    author: 'Unknown',
    tags: ['kindness', 'wisdom'],
  },
  {
    text: 'Choose patience with yourself as generously as you offer it to others.',
    author: 'Unknown',
    tags: ['kindness', 'mindfulness'],
  },
];

const fallbackTags = [...new Set(fallbackQuotes.flatMap(({ tags }) => tags))];
let lastFallbackText: string | null = null;

const getFallbackQuote = (selectedTag: string | null, previousQuote?: string): Quote => {
  const taggedQuotes = selectedTag
    ? fallbackQuotes.filter((item) => item.tags.includes(selectedTag))
    : fallbackQuotes;
  const matchingQuotes = taggedQuotes.filter(
    (item) =>
      item.text !== (previousQuote ?? lastFallbackText),
  );
  const availableQuotes =
    matchingQuotes.length > 0
      ? matchingQuotes
      : taggedQuotes.length > 0
        ? taggedQuotes
        : fallbackQuotes;
  const quote = availableQuotes[Math.floor(Math.random() * availableQuotes.length)];
  lastFallbackText = quote.text;
  return quote;
};

export const getRandomQuote = async (
  selectedTag: string | null = null,
  previousQuote?: string,
): Promise<Quote> => {
  if (selectedTag) {
    return getFallbackQuote(selectedTag, previousQuote);
  }

  try {
    const response = await axios.get(`${API_URL}/quotes/random`);

    const { quote, author } = response.data;
    const text = typeof quote === 'string' ? quote : '';

    if (!text || text === previousQuote) {
      return getFallbackQuote(null, previousQuote);
    }

    return { text, author: author || 'Unknown', tags: [] };
  } catch {
    console.warn('Unable to load a quote from the quote service; using an offline quote.');
    return getFallbackQuote(null, previousQuote);
  }
};

export const getTags = async () => {
  return fallbackTags;
};
