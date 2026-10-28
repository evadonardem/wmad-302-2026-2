import axios from 'axios';

const API_URL = 'https://quoteslate.vercel.app/api';

export type Quote = {
  text: string;
  author: string;
  tags: string[];
};

export const getRandomQuote = async (selectedTag: string | null = null): Promise<Quote> => {
  const endpoint = selectedTag ? `${API_URL}/quotes/random?tags=${selectedTag}` : `${API_URL}/quotes/random`;

  try {
    const response = await axios.get(endpoint);
    const { quote, author, tags } = response.data;

    return {
      text: quote,
      author,
      tags: Array.isArray(tags) ? tags : [],
    };
  } catch {
    return {
      text: 'Success is the sum of small efforts, repeated day in and day out.',
      author: 'Robert Collier',
      tags: ['motivation'],
    };
  }
};

export const getTags = async (): Promise<string[]> => {
  try {
    const response = await axios.get(`${API_URL}/tags`);
    return Array.isArray(response.data) ? response.data : [];
  } catch {
    return [];
  }
};
