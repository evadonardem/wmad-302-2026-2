import axios from 'axios';

const API_URL = 'https://quoteslate.vercel.app/api';

const fallbackQuotes = [
    { text: 'A calm mind brings inner strength and self-confidence.', author: 'Fallback Quote', tags: ['wisdom'] },
    { text: 'Success is the sum of small efforts, repeated day in and day out.', author: 'Fallback Quote', tags: ['success'] },
    { text: 'The future depends on what you do today.', author: 'Fallback Quote', tags: ['motivation'] },
    { text: 'Learning is a treasure that will follow its owner everywhere.', author: 'Fallback Quote', tags: ['learning'] },
    { text: 'It always seems impossible until it is done.', author: 'Fallback Quote', tags: ['motivation'] },
];

const fallbackTags = ['wisdom', 'success', 'motivation', 'learning'];

const getFallbackQuote = (selectedTag = null) => {
    const filtered = selectedTag
        ? fallbackQuotes.filter((item) => item.tags.includes(selectedTag))
        : fallbackQuotes;

    const source = filtered.length ? filtered : fallbackQuotes;
    return source[Math.floor(Math.random() * source.length)];
};

export const getRandomQuote = async (selectedTag = null) => {
    const endpoint = selectedTag
        ? `${API_URL}/quotes/random?tags=${selectedTag}`
        : `${API_URL}/quotes/random`;

    try {
        const response = await axios.get(endpoint);
        const { quote, author, tags } = response.data;

        return {
            text: quote,
            author,
            tags,
        };
    } catch {
        const fallback = getFallbackQuote(selectedTag);
        return {
            text: fallback.text,
            author: fallback.author,
            tags: fallback.tags,
        };
    }
};

export const getTags = async () => {
    try {
        const response = await axios.get(`${API_URL}/tags`);
        return Array.isArray(response.data) ? response.data : fallbackTags;
    } catch {
        return fallbackTags;
    }
};
