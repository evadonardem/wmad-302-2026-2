import axios from 'axios';

const BASE_URL = 'https://dummyjson.com/quotes';

export interface Quote {
  id: number;
  quote: string;
  author: string;
}

export interface Tag {
  slug: string;
  name: string;
}

/*TODO 17: Fetch a random quote from the API endpoint*/
export const fetchRandomQuote = async (): Promise<Quote> => {
  try {
    const response = await axios.get(`${BASE_URL}/random`);
    return response.data;
  } catch (error) {
    console.error('Error fetching random quote:', error);
    //Fallback object shield
    return {
      id: 0,
      quote: 'Life is what happens when you are busy making other plans.',
      author: 'John Lennon',
    };
  }
};

/*TODO 18: Fetch available tags/categories from the API endpoint*/
export const fetchTags = async (): Promise<Tag[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/tags`);
    return response.data;
  } catch (error) {
    console.error('Error fetching tags:', error);
    return [
      { slug: 'inspirational', name: 'Inspirational' },
      { slug: 'life', name: 'Life' },
    ];
  }
};

/*TODO 19: Fetch quotes filtered by tag slug*/
export const fetchQuotesByTag = async (tagSlug: string): Promise<Quote[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/tag/${tagSlug}`);
    return response.data.quotes || [];
  } catch (error) {
    console.error(`Error fetching quotes for tag ${tagSlug}:`, error);
    return [];
  }
};

/*TODO 20: Utility helper to fetch a quote based on current ref tag criteria*/
export const fetchQuoteByRefTag = async (selectedTag: string | null): Promise<Quote> => {
  if (!selectedTag) {
    return await fetchRandomQuote();
  }
  const quotes = await fetchQuotesByTag(selectedTag);
  if (quotes.length > 0) {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    return quotes[randomIndex];
  }
  return await fetchRandomQuote();
};