import axios from 'axios';

const API_URL = 'https://quoteslate.vercel.app/api';

export const getRandomQuote = async (selectedTag = null) => {
    // TODO 17 [Dynamic Endpoint Interpolation]: Formulate the dynamic target endpoint string URL.
    const queryParam = selectedTag ? `?tags=${selectedTag}` : '';
    const endpoint = `${API_URL}/quotes/random${queryParam}`;

    try {
        // TODO 18 [Asynchronous Request Handling]:
        const response = await axios.get(endpoint);
        const { quote: text, author, tags } = response.data;
        return {
            text,
            author,
            tags
        };

    } catch {
        // TODO 19 [Resilient System Fallbacks]: Return a hardcoded fallback quote object with custom placeholder messages if an unexpected API or network timeout exception is encountered.
        return {
            text: ' ',
            author: ' ',
            tags: []
        };
    }
};

export const getTags = async () => {
    // TODO 20 [Asynchronous List Retrieval]:
    const endpoint = `${API_URL}/tags`;
    try {
        const response = await axios.get(endpoint);
        return response.data;
    } catch {
        return [];
    }
}