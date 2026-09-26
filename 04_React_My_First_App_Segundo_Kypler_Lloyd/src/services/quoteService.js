import axios from 'axios';

const API_URL = 'https://vercel.app';

// API not working
const FALLBACK_QUOTES = [
  {
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
    tags: ["inspirational", "work"]
  },
  {
    text: "Life is what happens when you're busy making other plans.",
    author: "John Lennon",
    tags: ["life", "wisdom"]
  },
  {
    text: "In the middle of every difficulty lies opportunity.",
    author: "Albert Einstein",
    tags: ["wisdom", "inspirational"]
  },
  {
    text: "It does not matter how slowly you go as long as you do not stop.",
    author: "Confucius",
    tags: ["perseverance", "wisdom"]
  },
  {
    text: "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt",
    tags: ["inspirational", "dreams"]
  },
  {
    text: "Success is not final, failure is not fatal: It is the courage to continue that counts.",
    author: "Winston Churchill",
    tags: ["success", "perseverance"]
  },
  {
    text: "Believe you can and you're halfway there.",
    author: "Theodore Roosevelt",
    tags: ["inspirational", "belief"]
  }
];

const FALLBACK_TAGS = ["inspirational", "wisdom", "life", "work", "perseverance", "dreams", "success", "belief"];

export const getRandomQuote = async (selectedTag = null) => {
    // TODO 17 [Dynamic Endpoint Interpolation]: Formulate the dynamic target endpoint string URL.
    // If a truthy 'selectedTag' value is provided, append '?tags=[selectedTag]' to the base random path URL.
    // Example Target: 'https://vercel.app/quotes/random?tags=wisdom'
    const endpoint = selectedTag
        ? `${API_URL}/quotes/random?tags=${selectedTag}`
        : `${API_URL}/quotes/random`;

    try {
        // TODO 18 [Asynchronous Request Handling]:
        // a. Execute an asynchronous GET network request using Axios targeting your calculated endpoint URL.
        // b. Extract the 'quote', 'author', and 'tags' properties from the resulting payload object.
        // c. Return a clean object structured with uniform mapping matching: { text: [extracted quote text], author, tags }
        const response = await axios.get(endpoint);
        const { quote, author, tags } = response.data;

        return {
            text: quote,
            author,
            tags
        };
        
    } catch {
        // TODO 19 [Resilient System Fallbacks]: Return a hardcoded fallback quote object 
        // with custom placeholder messages if an unexpected API or network timeout exception is encountered.
        
        // Working offline fallback
        let filtered = FALLBACK_QUOTES;
        if (selectedTag) {
            filtered = FALLBACK_QUOTES.filter(q => q.tags.includes(selectedTag));
        }
        if (filtered.length === 0) filtered = FALLBACK_QUOTES;

        return filtered[Math.floor(Math.random() * filtered.length)];
    }
};

export const getTags = async () => {
    // TODO 20 [Asynchronous List Retrieval]:
    // Fetch global category strings from the API endpoint path `${API_URL}/tags` using Axios.
    // Return the response data array on success, or return an empty array fallback inside the catch safety layer.
    try {
        const response = await axios.get(`${API_URL}/tags`);
        return response.data;
    } catch {
        return FALLBACK_TAGS;
    }
};