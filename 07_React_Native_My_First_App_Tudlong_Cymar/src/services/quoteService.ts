import axios from 'axios';

const API_URL = 'https://quoteslate.vercel.app/api';

export type Quote = {
    text: string;
    author: string;
    tags: string[];
};

export const getRandomQuote = async (selectedTag: string | null = null): Promise<Quote> => {
    // TODO 17
    const endpoint = selectedTag
        ? `${API_URL}/quotes/random?tags=${encodeURIComponent(selectedTag)}`
        : `${API_URL}/quotes/random`;

    try {
        // TODO 18
        const response = await axios.get(endpoint);
        const data = Array.isArray(response.data) ? response.data[0] : response.data;
        const { quote, author, tags } = data;
        return { text: quote, author, tags: tags ?? [] };
    } catch {
        // TODO 19
        return {
            text: 'Could not load a quote right now. Please try again.',
            author: 'Unknown',
            tags: [],
        };
    }
};

export const getTags = async (): Promise<string[]> => {
    // TODO 20
    try {
        const response = await axios.get(`${API_URL}/tags`);
        return Array.isArray(response.data) ? response.data : [];
    } catch {
        return [];
    }
};