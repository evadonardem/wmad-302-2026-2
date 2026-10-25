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
        const { quote, author, tags } = response.data;
        return { text: quote, author, tags: tags ?? [] };
    } catch (error) {
        console.log('getRandomQuote failed:', error);
        return {
            text: 'Could not load a quote right now. Please check your connection and try again.',
            author: 'Quote Generator',
            tags: [],
        };
    }
};

export const getTags = async (): Promise<string[]> => {
    // TODO 20
    try {
        const response = await axios.get(`${API_URL}/tags`);
        return response.data;
    } catch (error) {
        console.log('getTags failed:', error);
        return [];
    }
};