import axios from 'axios';

const API_URL = 'https://api.quotable.io';

export type Quote = {
  text: string;
  author: string;
  tags: string[];
};

type QuoteApiResponse = {
  quote?: unknown;
  content?: unknown;
  author?: unknown;
  tags?: unknown;
};

export const getRandomQuote = async (selectedTag: string | null = null) => {
  const endpoint = `${API_URL}/quotes/random${
    selectedTag ? `?tags=${encodeURIComponent(selectedTag)}` : ''
  }`;

  try {
    const response = await axios.get<QuoteApiResponse>(endpoint, { timeout: 10000 });
    const { quote, content, author, tags } = response.data;
    const text = typeof quote === 'string' ? quote : content;

    if (
      typeof text !== 'string' ||
      typeof author !== 'string' ||
      !Array.isArray(tags) ||
      !tags.every((tag): tag is string => typeof tag === 'string')
    ) {
      throw new Error('The quote service returned an unexpected response.');
    }

    return { text, author, tags };
  } catch (error) {
    console.error('Failed to fetch a random quote:', error);
    return {
      text: 'A quote is unavailable right now. Please try again.',
      author: 'Quote service',
      tags: [],
    };
  }
};

export const getTags = async () => {
  try {
    const response = await axios.get<unknown>(`${API_URL}/tags`, { timeout: 10000 });
    if (!Array.isArray(response.data)) {
      throw new Error('The quote service returned an unexpected tag list.');
    }

    return response.data.map((tag: unknown) => {
      if (typeof tag === 'string') {
        return tag;
      }
      if (
        typeof tag === 'object' &&
        tag !== null &&
        'name' in tag &&
        typeof tag.name === 'string'
      ) {
        return tag.name;
      }
      throw new Error('The quote service returned an invalid tag.');
    });
  } catch (error) {
    console.error('Failed to fetch quote tags:', error);
    return [];
  }
};
