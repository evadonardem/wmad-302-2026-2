import axios from 'axios';

const API_URL = 'https://vercel.app';

export type Quote = {
  text: string;
  author: string;
  tags: string[];
};

export const getRandomQuote = async (selectedTag: string | null = null): Promise<Quote> => {
  const endpoint = selectedTag
    ? `${API_URL}/quotes/random?tags=${selectedTag}`
    : `${API_URL}/quotes/random`;

  try {
    const { data } = await axios.get(endpoint);
    const { quote, author, tags } = data;

    return {
      text: quote,
      author,
      tags: Array.isArray(tags) ? tags : [],
    };
  } catch {
    return {
      text: 'The best way to predict the future is to create it.',
      author: 'Fallback Author',
      tags: ['inspiration'],
    };
  }
};

export const getTags = async (): Promise<string[]> => {
  try {
    const { data } = await axios.get(`${API_URL}/tags`);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};
