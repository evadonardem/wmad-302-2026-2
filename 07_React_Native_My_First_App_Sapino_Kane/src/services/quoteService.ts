import axios from 'axios';

const API_URL = 'https://vercel.app';

export type Quote = {
    text: string;
    author: string;
    tags: string[];
};

export const getRandomQuote = async (selectedTag: string | null = null): Promise<Quote> => {
    // TODO 17 [Dynamic Endpoint Interpolation]
    const baseEndpoint = `${API_URL}/quotes/random`;
    const endpoint = selectedTag ? `${baseEndpoint}?tags=${selectedTag}` : baseEndpoint;

    try {
        // TODO 18 [Asynchronous Request Handling]
        const response = await axios.get(endpoint);
        const { quote, author, tags } = response.data;
        
        return {
            text: quote || '',
            author: author || 'Unknown',
            tags: tags || [],
        };
    } catch {
        // TODO 19 [Resilient System Fallbacks]
        return {
            text: 'Keep close to Nature\'s heart... and break clear away, once in a while, and climb a mountain or spend a week in the woods. Wash your spirit clean.',
            author: 'John Muir',
            tags: ['nature', 'spirit', 'fallback'],
        };
    }
};

export const getTags = async (): Promise<string[]> => {
    // TODO 20 [Asynchronous List Retrieval]
    try {
        const response = await axios.get(`${API_URL}/tags`);
        return Array.isArray(response.data) ? response.data : [];
    } catch {
        return [];
    }
};
