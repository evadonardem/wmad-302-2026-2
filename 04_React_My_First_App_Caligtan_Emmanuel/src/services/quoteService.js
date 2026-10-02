import axios from 'axios';

const API_URL = 'https://quoteslate.vercel.app';

export const getRandomQuote = async (selectedTag = null) => {
    // TODO 17 [Dynamic Endpoint Interpolation]
    const endpoint = selectedTag
        ? `${API_URL}/quotes/random?tags=${selectedTag}`
        : `${API_URL}/quotes/random`;

    try {
        // TODO 18 [Asynchronous Request Handling]
        const response = await axios.get(endpoint);
        
        // Extract quote, author, and tags properties from the response payload
        const { quote, author, tags } = response.data;

        return {
            text: quote,
            author: author,
            tags: tags || []
        };

    } catch (error) {
        // TODO 19 [Resilient System Fallbacks]
        return {
            text: "The more you know, the more you know you don't know.",
            author: "Aristotle",
            tags: ["philosophy", "wisdom"]
        };
    }
};

export const getTags = async () => {
    // TODO 20 [Asynchronous List Retrieval]
    try {
        const response = await axios.get(`${API_URL}/tags`);
        return response.data;
    } catch (error) {
        return [];
    }
};