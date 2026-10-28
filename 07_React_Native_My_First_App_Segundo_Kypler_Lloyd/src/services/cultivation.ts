import axios from 'axios';
import { getAuthorProfile, type AuthorProfile } from '@/services/quoteService';

// ---------------------------------------------------------------------------
// Murim / cultivation honorific titles (extra feature, not part of the assignment)
//
// Rank   = FAME  -> yearly Wikipedia page views of the author
// Prefix = AGE   -> how long ago the author was born (parsed from the Wikipedia summary)
// ---------------------------------------------------------------------------

export type Honor = {
  name: string;   // the author this honor belongs to
  title: string;  // e.g. "Venerable Grand Patriarch"
};

// Fame ladder: highest tier first. 'min' is the number of Wikipedia page views in a year.
const FAME_TIERS = [
  { min: 5_000_000, rank: 'Grand Patriarch' },
  { min: 2_000_000, rank: 'Sect Leader' },
  { min: 800_000, rank: 'Great Elder' },
  { min: 300_000, rank: 'Elder' },
  { min: 100_000, rank: 'Senior Disciple' },
  { min: 0, rank: 'Junior Disciple' },
];

// Used when no fame data could be loaded at all.
const UNKNOWN_TIER = { rank: 'Wandering Cultivator' };

const CURRENT_YEAR = 2026;
const VIEWS_YEAR = 2025; // last full year of page-view data

// Age ladder: how many years ago the author was born -> seniority prefix.
const agePrefix = (birthYear: number | null): string => {
  if (birthYear === null) return '';
  const age = CURRENT_YEAR - birthYear;
  if (age >= 500) return 'Primordial';
  if (age >= 200) return 'Ancient';
  if (age >= 120) return 'Venerable';
  if (age >= 60) return 'Seasoned';
  return 'Rising';
};

// Wikipedia summaries usually start like "Albert Einstein (14 March 1879 – 18 April 1955) was ..."
const parseBirthYear = (extract: string): number | null => {
  const parentheses = extract.slice(0, 250).matchAll(/\(([^)]*)\)/g);
  for (const match of parentheses) {
    const inside = match[1];
    const digits = inside.match(/\d{3,4}/);
    if (digits) {
      const year = parseInt(digits[0], 10);
      return /BC/i.test(inside) ? -year : year;
    }
  }
  return null;
};

// Total Wikipedia page views for one article during VIEWS_YEAR.
const getYearlyViews = async (title: string): Promise<number | null> => {
  try {
    const article = encodeURIComponent(title.replace(/ /g, '_'));
    const response = await axios.get(
      `https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/all-access/user/${article}/monthly/${VIEWS_YEAR}010100/${VIEWS_YEAR}123100`,
    );
    return response.data.items.reduce((sum: number, item: any) => sum + item.views, 0);
  } catch {
    return null;
  }
};

// Remember results so the same author is not looked up again and again.
const cache = new Map<string, Honor>();

// Pass 'profile' if you already loaded it (saves one request); omit it to let this function load it.
export const getCultivationTitle = async (
  name: string,
  profile?: AuthorProfile | null,
): Promise<Honor> => {
  const cached = cache.get(name);
  if (cached) return cached;

  const resolved = profile !== undefined ? profile : await getAuthorProfile(name);
  const views = await getYearlyViews(resolved?.name ?? name);
  const birthYear = resolved ? parseBirthYear(resolved.extract) : null;

  const tier =
    views === null ? UNKNOWN_TIER : (FAME_TIERS.find((t) => views >= t.min) ?? UNKNOWN_TIER);

  const honor: Honor = {
    name,
    title: `${agePrefix(birthYear)} ${tier.rank}`.trim(),
  };

  // Only remember it when the fame lookup worked, so a network hiccup is not stored forever.
  if (views !== null) cache.set(name, honor);
  return honor;
};