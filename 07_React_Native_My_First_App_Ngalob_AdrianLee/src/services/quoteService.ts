import axios from 'axios';

const API_URL = 'https://api.quotable.io';

export type Quote = {
  text: string;
  author: string;
  tags: string[];
  isOffline?: boolean;
};

const offlineQuotes: Quote[] = [
  { text: 'The next small step is still progress.', author: 'Offline Generator', tags: ['motivation', 'success'] },
  { text: 'A little patience can make room for a better answer.', author: 'Offline Generator', tags: ['wisdom', 'life'] },
  { text: 'Curiosity turns ordinary days into discoveries.', author: 'Offline Generator', tags: ['inspiration', 'learning'] },
  { text: 'Courage is beginning before you feel completely ready.', author: 'Offline Generator', tags: ['courage', 'motivation'] },
  { text: 'Make time for the people who make you feel at home.', author: 'Offline Generator', tags: ['friendship', 'happiness'] },
  { text: 'A setback is a moment to adjust, not a reason to stop.', author: 'Offline Generator', tags: ['perseverance', 'success'] },
  { text: 'Kindness is a small choice with a long reach.', author: 'Offline Generator', tags: ['kindness', 'life'] },
  { text: 'You do not need the whole map to take the first step.', author: 'Offline Generator', tags: ['inspiration', 'courage'] },
  { text: 'Rest is part of the work, too.', author: 'Offline Generator', tags: ['wisdom', 'happiness'] },
  { text: 'Keep asking good questions; they open new doors.', author: 'Offline Generator', tags: ['learning', 'inspiration'] },
  { text: 'Progress grows when you show up again.', author: 'Offline Generator', tags: ['perseverance', 'motivation'] },
  { text: 'Celebrate how far you have come while choosing where to go next.', author: 'Offline Generator', tags: ['success', 'life'] },
];

const offlineTags = [...new Set(offlineQuotes.flatMap((quote) => quote.tags))];

type QuoteApiResponse = {
  quote?: unknown;
  content?: unknown;
  author?: unknown;
  tags?: unknown;
};

export const getRandomQuote = async (selectedTag: string | null = null) => {
  const endpoint = `${API_URL}/quotes/random${
    selectedTag ? `?tags=${encodeURIComponent(selectedTag)}` : ''
  }`;

  try {
    const response = await axios.get<QuoteApiResponse>(endpoint, { timeout: 10000 });
    const { quote, content, author, tags } = response.data;
    const text = typeof quote === 'string' ? quote : content;

    if (
      typeof text !== 'string' ||
      typeof author !== 'string' ||
      !Array.isArray(tags) ||
      !tags.every((tag): tag is string => typeof tag === 'string')
    ) {
      throw new Error('The quote service returned an unexpected response.');
    }

    return { text, author, tags };
  } catch (error) {
    console.error('Failed to fetch a random quote:', error);
    const matchingQuotes = selectedTag
      ? offlineQuotes.filter((quote) => quote.tags.includes(selectedTag))
      : offlineQuotes;
    const availableQuotes = matchingQuotes.length > 0 ? matchingQuotes : offlineQuotes;
    const quote = availableQuotes[Math.floor(Math.random() * availableQuotes.length)];
    return { ...quote, isOffline: true };
  }
};

export const getTags = async () => {
  try {
    const response = await axios.get<unknown>(`${API_URL}/tags`, { timeout: 10000 });
    if (!Array.isArray(response.data)) {
      throw new Error('The quote service returned an unexpected tag list.');
    }

    return response.data.map((tag: unknown) => {
      if (typeof tag === 'string') {
        return tag;
      }
      if (
        typeof tag === 'object' &&
        tag !== null &&
        'name' in tag &&
        typeof tag.name === 'string'
      ) {
        return tag.name;
      }
      throw new Error('The quote service returned an invalid tag.');
    });
  } catch (error) {
    console.error('Failed to fetch quote tags:', error);
    return offlineTags;
  }
};
