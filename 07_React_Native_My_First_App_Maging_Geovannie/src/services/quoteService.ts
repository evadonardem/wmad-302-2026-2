import axios from 'axios';

const API_URL = 'https://quoteslate.vercel.app/api';

export type Quote = {
  text: string;
  author: string;
  tags: string[];
};

const fallbackQuotes: Quote[] = [
  {
    text: 'A calm mind brings inner strength and self-confidence.',
    author: 'Fallback Quote',
    tags: ['wisdom'],
  },
  {
    text: 'Success is the sum of small efforts, repeated day in and day out.',
    author: 'Fallback Quote',
    tags: ['success'],
  },
  {
    text: 'The future depends on what you do today.',
    author: 'Fallback Quote',
    tags: ['motivation'],
  },
  {
    text: 'Learning is a treasure that will follow its owner everywhere.',
    author: 'Fallback Quote',
    tags: ['learning'],
  },
  {
    text: 'It always seems impossible until it is done.',
    author: 'Fallback Quote',
    tags: ['motivation'],
  },
];

const getFallbackQuote = (selectedTag: string | null = null) => {
  const filteredQuotes = selectedTag
    ? fallbackQuotes.filter((quote) => quote.tags.includes(selectedTag))
    : fallbackQuotes;
  const quotes = filteredQuotes.length ? filteredQuotes : fallbackQuotes;
  return quotes[Math.floor(Math.random() * quotes.length)];
};

export const getRandomQuote = async (selectedTag: string | null = null): Promise<Quote> => {
  const endpoint = selectedTag
    ? `${API_URL}/quotes/random?tags=${encodeURIComponent(selectedTag)}`
    : `${API_URL}/quotes/random`;

  try {
    const { data } = await axios.get<{
      quote: string;
      author: string;
      tags: string[];
    }>(endpoint);

    return {
      text: data.quote,
      author: data.author,
      tags: Array.isArray(data.tags) ? data.tags : [],
    };
  } catch {
    return getFallbackQuote(selectedTag);
  }
};

export const getTags = async (): Promise<string[]> => {
  try {
    const { data } = await axios.get<unknown>(`${API_URL}/tags`);
    const responseTags =
      Array.isArray(data)
        ? data
        : data !== null &&
            typeof data === 'object' &&
            'tags' in data &&
            Array.isArray(data.tags)
          ? data.tags
          : null;

    if (!responseTags) {
      throw new Error('The categories API returned an unexpected response.');
    }

    return responseTags.map((tag: unknown) => String(tag));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to load quote categories: ${message}`);
  }
};
