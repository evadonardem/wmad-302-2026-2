import axios from 'axios';

const API_URL = 'https://quoteslate.vercel.app/api';

export type Quote = {
    text: string;
    author: string;
    tags: string[];
};

const FALLBACK_QUOTE: Quote = {
    text: 'Could not reach the quote server. Check your connection and try again.',
    author: 'Offline Mode',
    tags: ['offline'],
};

export const getRandomQuote = async (selectedTag: string | null = null): Promise<Quote> => {
    // TODO 17: add ?tags=<tag> only when a tag is selected
    const endpoint = selectedTag
        ? `${API_URL}/quotes/random?tags=${encodeURIComponent(selectedTag)}`
        : `${API_URL}/quotes/random`;

    try {
        // TODO 18: GET the quote and map it to our Quote shape
        const response = await axios.get(endpoint);
        const data = Array.isArray(response.data) ? response.data[0] : response.data;
        const { quote, author, tags } = data;
        return { text: quote, author, tags: tags ?? [] };
    } catch {
        // TODO 19: fallback so the UI never crashes
        return FALLBACK_QUOTE;
    }
};

export const getTags = async (): Promise<string[]> => {
    // TODO 20: fetch tag list, empty array on failure
    try {
        const response = await axios.get(`${API_URL}/tags`);
        return Array.isArray(response.data) ? response.data : [];
    } catch {
        return [];
    }
};