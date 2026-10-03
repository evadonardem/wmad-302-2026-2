import axios from 'axios';

const API_URL = 'https://api.quotable.io';
const api = axios.create({
    baseURL: API_URL,
    timeout: 10000,
});

const fallbackQuotes = [
    { text: 'Well done is better than well said.', author: 'Benjamin Franklin', tags: ['motivation', 'wisdom'] },
    { text: 'Knowledge is power.', author: 'Francis Bacon', tags: ['wisdom', 'learning'] },
    { text: 'I think, therefore I am.', author: 'René Descartes', tags: ['wisdom', 'life'] },
    { text: 'Brevity is the soul of wit.', author: 'William Shakespeare', tags: ['wisdom', 'creativity'] },
    { text: 'To be, or not to be: that is the question.', author: 'William Shakespeare', tags: ['life', 'curiosity'] },
    { text: 'There is no charm equal to tenderness of heart.', author: 'Jane Austen', tags: ['kindness', 'life'] },
    { text: 'The truth is rarely pure and never simple.', author: 'Oscar Wilde', tags: ['wisdom', 'truth'] },
    { text: 'I can resist everything except temptation.', author: 'Oscar Wilde', tags: ['humor', 'wit'] },
    { text: 'The unexamined life is not worth living.', author: 'Socrates', tags: ['life', 'wisdom'] },
    { text: 'That which does not kill us makes us stronger.', author: 'Friedrich Nietzsche', tags: ['strength', 'motivation'] },
];
const fallbackTags = [...new Set(fallbackQuotes.flatMap(({ tags }) => tags))];
let previousFallbackQuote = -1;
let quoteApiUnavailable = false;

const getFallbackQuote = (selectedTag) => {
    const taggedQuotes = fallbackQuotes
        .map((quote, index) => ({ ...quote, index }))
        .filter(({ tags }) => !selectedTag || tags.includes(selectedTag));
    const matchingQuotes = taggedQuotes.length > 0
        ? taggedQuotes
        : fallbackQuotes.map((quote, index) => ({ ...quote, index }));
    const availableQuotes = matchingQuotes.filter(({ index }) => index !== previousFallbackQuote);
    const pool = availableQuotes.length > 0 ? availableQuotes : matchingQuotes;

    if (pool.length === 0) {
        return {
            text: 'The best way forward is to take the next step.',
            author: 'AI-generated',
            tags: [],
            isFallback: true,
        };
    }

    const quote = pool[Math.floor(Math.random() * pool.length)];
    previousFallbackQuote = quote.index;
    return {
        text: quote.text,
        author: quote.author,
        tags: quote.tags,
        isFallback: true,
    };
};

export const getRandomQuote = async (selectedTag = null) => {
    if (!quoteApiUnavailable) {
        try {
            const { data } = await api.get('/quotes/random', {
                params: selectedTag ? { tags: selectedTag } : undefined,
            });
            const quote = Array.isArray(data) ? data[0] : data;
            const text = quote?.quote ?? quote?.content;

            if (typeof text !== 'string' || !text.trim()) {
                throw new Error('The quote API returned an invalid quote.');
            }

            return {
                text,
                author: quote.author || 'Unknown author',
                tags: Array.isArray(quote.tags)
                    ? quote.tags.map((tag) => typeof tag === 'string' ? tag : tag?.name ?? tag?.slug).filter(Boolean)
                    : [],
                isFallback: false,
            };
        } catch (error) {
            console.error('Unable to load a quote from the quote API. Using rotating offline quotes.', error);
            quoteApiUnavailable = true;
        }
    }

    return getFallbackQuote(selectedTag);
};

export const getTags = async () => {
    try {
        const { data } = await api.get('/tags');
        if (!Array.isArray(data)) {
            throw new Error('The quote API returned an invalid tag list.');
        }

        return data
            .map((tag) => typeof tag === 'string' ? tag : tag?.name ?? tag?.slug)
            .filter(Boolean);
    } catch (error) {
        console.error('Unable to load quote categories from the quote API.', error);
        return fallbackTags;
    }
};
