import axios from 'axios';

const API_URL = 'https://quoteslate.vercel.app';
const fallbackTags = ['motivation', 'inspiration', 'wisdom', 'success', 'discipline', 'courage'];
const fallbackQuotes = [
    {
        text: 'Success is the sum of small efforts, repeated day in and day out.',
        author: 'Robert Collier',
        tags: ['motivation'],
    },
    {
        text: 'The only way to do great work is to love what you do.',
        author: 'Steve Jobs',
        tags: ['inspiration'],
    },
    {
        text: 'It always seems impossible until it is done.',
        author: 'Nelson Mandela',
        tags: ['courage'],
    },
    {
        text: 'Discipline is choosing between what you want most and what you want now.',
        author: 'Abraham Lincoln',
        tags: ['discipline'],
    },
];

export const getRandomQuote = async (selectedTag = null) => {
    const params = new URLSearchParams();

    if (selectedTag) {
        params.set('tags', selectedTag);
    }

    params.set('_', Date.now().toString());
    const endpoint = `${API_URL}/api/quotes/random?${params.toString()}`;

    try {
        const response = await axios.get(endpoint);
        const payload = Array.isArray(response.data) ? response.data[0] : response.data;
        const { quote, author, tags } = payload ?? {};

        return {
            text: quote || 'No quote available right now.',
            author: author || 'Unknown author',
            tags: Array.isArray(tags) ? tags : [],
        };
    } catch {
        const fallback = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
        return {
            ...fallback,
            tags: Array.isArray(fallback.tags) ? fallback.tags : ['motivation'],
        };
    }
};

export const getTags = async () => {
    try {
        const response = await axios.get(`${API_URL}/api/tags`);
        return Array.isArray(response.data) ? response.data : fallbackTags;
    } catch {
        return fallbackTags;
    }
}
