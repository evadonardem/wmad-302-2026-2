import axios from 'axios';

const API_URL = 'https://quoteslate.vercel.app/api';

export const getRandomQuote = async (selectedTag = null) => {
    const endpoint = selectedTag
        ? `${API_URL}/quotes/random?tags=${encodeURIComponent(selectedTag)}`
        : `${API_URL}/quotes/random`;

    try {
        const response = await axios.get(endpoint, { timeout: 10000 });
        const { quote: text, author, tags } = response.data;
        return { text: text ?? '', author: author ?? '', tags: tags ?? [] };
    } catch {
        return {
            text: 'The best way to predict the future is to create it.',
            author: 'Peter Drucker',
            tags: selectedTag ? [selectedTag] : ['inspiration'],
        };
    }
};

export const getTags = async () => {
    try {
        const response = await axios.get(`${API_URL}/tags`, { timeout: 10000 });
        return Array.isArray(response.data) ? response.data : [];
    } catch {
        return [];
    }
}
