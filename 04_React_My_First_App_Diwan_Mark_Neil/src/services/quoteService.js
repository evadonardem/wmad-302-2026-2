import axios from 'axios';

const API_URL = 'https://quoteslate.vercel.app/api';

export const getRandomQuote = async (selectedTag = null) => {
    const endpoint = selectedTag
        ? `${API_URL}/quotes/random?tags=${selectedTag}`
        : `${API_URL}/quotes/random`;

    try {
        const response = await axios.get(endpoint);
        const { quote, author, tags } = response.data;
        return { text: quote, author, tags };
    } catch {
        return {
            text: 'Could not fetch a quote right now. Please try again later.',
            author: 'Unknown',
            tags: [],
        };
    }
};

export const getTags = async () => {
    try {
        const response = await axios.get(`${API_URL}/tags`);
        return response.data;
    } catch {
        return [];
    }
}