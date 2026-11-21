import axios from 'axios';

const API_URL = 'https://quoteslate.vercel.app/api';

// ---------------------------------------------------------------------------
// Backup data source
//
// quoteslate.vercel.app sometimes answers apps with a "Vercel Security Checkpoint" page
// (status 429) that only a real web browser can pass. When that happens the functions below
// fall back to the same quotes stored as plain JSON files on GitHub, and skip the blocked
// API for 5 minutes so the app does not wait for it on every tap.
// ---------------------------------------------------------------------------
const DATA_URL = 'https://raw.githubusercontent.com/Musheer360/QuoteSlate/main/data';
const API_SKIP_MS = 5 * 60 * 1000;
let apiDownUntil = 0;
const apiAvailable = () => Date.now() >= apiDownUntil;
const markApiDown = () => {
    apiDownUntil = Date.now() + API_SKIP_MS;
};

// DEBUG: prints the real reason a request failed in the Expo terminal (delete when everything works).
const logError = (where: string, error: any) => {
    console.log(`[${where}] failed`);
    console.log('  message :', error?.message);
    console.log('  status  :', error?.response?.status);
};

const loadJson = async (file: string): Promise<any> => {
    const response = await axios.get(`${DATA_URL}/${file}`);
    return typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
};

let allQuotesCache: any[] | null = null;
const loadAllQuotes = async (): Promise<any[]> => {
    if (!allQuotesCache) {
        allQuotesCache = await loadJson('quotes.json');
    }
    return allQuotesCache as any[];
};

export type Quote = {
    text: string;
    author: string;
    tags: string[];
};

const toQuote = (q: any): Quote => ({ text: q.quote, author: q.author, tags: q.tags ?? [] });

const localRandomQuote = async (tag: string | null): Promise<Quote | null> => {
    const all = await loadAllQuotes();
    const pool = tag
        ? all.filter((q) => (q.tags ?? []).some((t: string) => t.toLowerCase() === tag.toLowerCase()))
        : all;
    if (pool.length === 0) return null;
    return toQuote(pool[Math.floor(Math.random() * pool.length)]);
};

export const getRandomQuote = async (selectedTag: string | null = null): Promise<Quote> => {
    // TODO 17 [Dynamic Endpoint Interpolation]: Formulate the dynamic target endpoint string URL.
    // If a truthy 'selectedTag' value is provided, append '?tags=[selectedTag]' to the base random path URL.
    // Example Target: 'https://vercel.app/quotes/random?tags=wisdom'
    const endpoint = selectedTag
        ? `${API_URL}/quotes/random?tags=${encodeURIComponent(selectedTag)}`
        : `${API_URL}/quotes/random`;

    try {
        // TODO 18 [Asynchronous Request Handling]:
        // a. Execute an asynchronous GET network request using Axios targeting your calculated endpoint URL.
        // b. Extract the 'quote', 'author', and 'tags' properties from the resulting payload object.
        // c. Return a clean object structured with uniform mapping matching: { text: [extracted quote text], author, tags }
        if (!apiAvailable()) throw new Error('API skipped, using backup data');
        const response = await axios.get(endpoint);
        const { quote, author, tags } = response.data;
        return { text: quote, author, tags };
    } catch (error) {
        if (apiAvailable()) {
            logError('getRandomQuote', error);
            markApiDown();
        }
        // Backup: the same quotes from the static data file.
        try {
            const local = await localRandomQuote(selectedTag);
            if (local) return local;
        } catch (backupError) {
            logError('getRandomQuote backup', backupError);
        }
        // TODO 19 [Resilient System Fallbacks]: Return a hardcoded fallback quote object
        // with custom placeholder messages if an unexpected API or network timeout exception is encountered.
        return {
            text: 'Unable to load a quote right now. Please check your connection and try again.',
            author: 'Quote Generator',
            tags: [],
        };
    }
};

export const getTags = async (): Promise<string[]> => {
    // TODO 20 [Asynchronous List Retrieval]:
    // Fetch global category strings from the API endpoint path `${API_URL}/tags` using Axios.
    // Return the response data array on success, or return an empty array fallback inside the catch safety layer.
    try {
        if (!apiAvailable()) throw new Error('API skipped, using backup data');
        const response = await axios.get(`${API_URL}/tags`);
        return response.data;
    } catch (error) {
        if (apiAvailable()) {
            logError('getTags', error);
            markApiDown();
        }
        try {
            return await loadJson('tags.json');
        } catch (backupError) {
            logError('getTags backup', backupError);
            return [];
        }
    }
};