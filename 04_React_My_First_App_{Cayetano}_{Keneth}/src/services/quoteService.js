import axios from 'axios';

const API_URL = 'https://quoteslate.vercel.app/api';

export const getRandomQuote = async (selectedTag = null) => {
    const queryParam = selectedTag ? `?tags=${selectedTag}` : '';
    const endpoint = `${API_URL}/quotes/random${queryParam}`;

    try {
        const response = await axios.get(endpoint);
        const { quote, author, tags } = response.data;

        return {
            text: quote,
            author,
            tags,
        };
    } catch {
        return {
            text: 'No quote available right now.',
            author: 'System',
            tags: ['general'],
        };
    }
};

export const getTags = async () => {
    const endpoint = `${API_URL}/tags`;

    try {
        const response = await axios.get(endpoint);
        return response.data;
    } catch {
        return [];
    }
};
