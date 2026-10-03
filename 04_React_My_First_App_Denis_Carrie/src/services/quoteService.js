import axios from 'axios';

// No trailing space or slash. The site is "quoteslate", not "qouteslate".
const API_URL = 'https://quoteslate.vercel.app/api';

export const getRandomQuote = async (selectedTag = null) => {
  // TODO 17 [Dynamic Endpoint Interpolation]
  const endpoint = selectedTag
    ? `${API_URL}/quotes/random?tags=${encodeURIComponent(selectedTag)}`
    : `${API_URL}/quotes/random`;

  try {
    // TODO 18 [Asynchronous Request Handling]
    const response = await axios.get(endpoint);
    const { quote, author, tags } = response.data; // a single object, not an array
    return { text: quote, author, tags };
  } catch (err) {
    // TODO 19 [Resilient System Fallbacks]
    console.error('getRandomQuote failed:', err.message);
    return {
      text: 'Could not load a quote from quoteslate.vercel.app.',
      author: 'System',
      tags: [],
    };
  }
};

export const getTags = async () => {
  // TODO 20 [Asynchronous List Retrieval]
  try {
    const response = await axios.get(`${API_URL}/tags`);
    return response.data; // already an array of strings
  } catch (err) {
    console.error('getTags failed:', err.message);
    return [];
  }
};