import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// TODO 1.1 [Base Configuration]: Set the fixed PSGC Gitlab API trailing-slash base URL constant.
// Targeted Value: 'https://psgc.gitlab.io/api'
const PSGC_BASE_URL = 'https://psgc.gitlab.io/api';

// Expo only exposes environment variables prefixed with EXPO_PUBLIC_ (loaded from the .env file).
const PEXELS_API_KEY = process.env.EXPO_PUBLIC_PEXELS_API_KEY;

// How many photos are requested from Pexels per page. Most of them are dropped by the place
// filter below, so a big page is asked for to keep enough photos of the chosen area.
const RAW_PAGE_SIZE = 80;
// The start-screen cards only need one photo each, so a smaller page is enough (and faster).
const COVER_RAW_SIZE = 40;

// ---- Speed: remember answers so the same request is never made twice ----
const SEARCH_CACHE_MS = 10 * 60 * 1000; // photo searches are remembered for 10 minutes
const pexelsCache = new Map<string, { data: any; at: number }>();
let regionsCache: Region[] | null = null;
const citiesCache = new Map<string, City[]>();
const provinceCache = new Map<string, string>();

// Forgets the remembered photo searches (used by pull-to-refresh so it really fetches fresh photos).
export const clearSearchCache = () => pexelsCache.clear();

export type Region = {
  code: string;
  name: string;
  regionName: string;
  islandGroupCode: string;
  psgcCode: string;
};

export type City = {
  code: string;
  name: string;
  isCity: boolean;
  isMunicipality: boolean;
  provinceCode: string;
  regionCode: string;
  // Extra fields returned by the PSGC API that the area description uses
  isCapital?: boolean;
  islandGroupCode?: string;
};

// The same photo in the different sizes Pexels offers (used by the download size option).
export type PhotoSizes = {
  small: string;
  medium: string;
  large: string;
  large2x: string;
  original: string;
};

export type Photo = {
  id: number;
  imageUrl: string;
  photographer: string;
  photographerUrl: string;
  altText: string;
  // Extra fields for the bonus features. They are optional so old saved favorites still load.
  thumbUrl?: string;
  sizes?: PhotoSizes;
  place?: string;
};

// "City of Baguio" -> "Baguio", so searches match the real place name.
const cleanPlaceName = (locationName: string) =>
  locationName
    .replace(/\(.*?\)/g, ' ')
    .replace(/^(City of|Municipality of)\s+/i, '')
    .replace(/\s+/g, ' ')
    .trim();

// Lowercase and without accents, so "Ni\u00f1o" and "Nino" compare equal.
const normalize = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

// The name a photo must mention to count as a photo of this area: "Baguio City" -> "baguio".
const placeTerm = (locationName: string) =>
  normalize(cleanPlaceName(locationName).replace(/\s+(city|island)$/i, ''));

// Words that a photo must mention for each theme ("tag"). The default theme has no extra words.
const DEFAULT_TOPIC = 'tourist spot';
const TOPIC_KEYWORDS: Record<string, string[]> = {
  beach: ['beach', 'shore', 'coast', 'sand', 'sea', 'ocean', 'island', 'bay', 'lagoon', 'cove', 'resort'],
  mountain: ['mountain', 'peak', 'hill', 'volcano', 'highland', 'summit', 'trail'],
  'heritage church': ['church', 'heritage', 'historic', 'historical', 'cathedral', 'colonial', 'museum', 'fort', 'ruins', 'temple', 'shrine', 'ancestral'],
  food: ['food', 'dish', 'meal', 'restaurant', 'cuisine', 'market', 'delicacy', 'delicacies', 'cake', 'coffee', 'seafood', 'fruit'],
};

// Pexels has no location filter, so photos are checked by their description and page address.
// A photo is kept only when it mentions the chosen place, and (for themes like Beaches)
// the theme too. Photos of other places are never used as a replacement.
const belongsTo = (rawPhoto: any, term: string, topic: string): boolean => {
  const text = normalize(`${rawPhoto.alt ?? ''} ${String(rawPhoto.url ?? '').replace(/[-/:.]/g, ' ')}`);
  if (!text.includes(term)) return false;
  const keywords = TOPIC_KEYWORDS[topic];
  return !keywords || keywords.some((word) => text.includes(word));
};

const toPhoto = (rawPhoto: any, locationName: string): Photo => ({
  id: rawPhoto.id,
  imageUrl: rawPhoto.src.large,
  photographer: rawPhoto.photographer,
  photographerUrl: rawPhoto.photographer_url,
  altText: rawPhoto.alt,
  thumbUrl: rawPhoto.src.medium,
  sizes: {
    small: rawPhoto.src.small,
    medium: rawPhoto.src.medium,
    large: rawPhoto.src.large,
    large2x: rawPhoto.src.large2x,
    original: rawPhoto.src.original,
  },
  place: locationName,
});

export const getRegions = async (): Promise<Region[]> => {
  // TODO 1.2 [Regions Retrieval]: Fetch the full array of regions from the PSGC host.
  // Perform an asynchronous GET request using axios targeting `${PSGC_BASE_URL}/regions/`,
  // return the response data array on success, and return an empty array fallback inside the catch safety layer.
  if (regionsCache) {
    return regionsCache;
  }
  try {
    const response = await axios.get(`${PSGC_BASE_URL}/regions/`);
    regionsCache = response.data;
    return response.data;
  } catch {
    return [];
  }
};

export const getCitiesMunicipalitiesByRegion = async (regionCode: string): Promise<City[]> => {
  // TODO 1.3 [Chained Location Population]: Complete the dynamic lookup using string interpolation.
  // a. Validate that a truthy regionCode parameter is provided before generating a network request (return [] otherwise).
  // b. Execute an async GET request hitting the exact trailing-slash path directory:
  //    `${PSGC_BASE_URL}/regions/{regionCode}/cities-municipalities/`
  // c. Return the response data array, with an empty array fallback inside the catch layer.
  if (!regionCode) {
    return [];
  }
  const remembered = citiesCache.get(regionCode);
  if (remembered) {
    return remembered;
  }
  try {
    const response = await axios.get(
      `${PSGC_BASE_URL}/regions/${regionCode}/cities-municipalities/`,
    );
    citiesCache.set(regionCode, response.data);
    return response.data;
  } catch {
    return [];
  }
};

// Name of a province from the PSGC (used by the area description). Empty when it is unknown.
export const getProvinceName = async (provinceCode: string): Promise<string> => {
  if (!provinceCode) return '';
  const remembered = provinceCache.get(provinceCode);
  if (remembered !== undefined) return remembered;
  try {
    const response = await axios.get(`${PSGC_BASE_URL}/provinces/${provinceCode}/`);
    const name = response.data?.name ?? '';
    provinceCache.set(provinceCode, name);
    return name;
  } catch {
    return '';
  }
};

// 'page' and 'topic' are optional extras: page 2, 3... loads more photos, and 'topic' swaps the
// default "tourist spot" for another theme (beach, mountain...). With neither, it behaves as before.
// Only photos that really belong to the chosen place (and theme) are returned.
export const searchPhotosByLocation = async (
  locationName: string,
  page: number = 1,
  topic: string = DEFAULT_TOPIC,
  perPage: number = RAW_PAGE_SIZE,
): Promise<Photo[]> => {
  // TODO 1.4 [Pexels Query Resolution]: Build the photo search pipeline.
  // a. Create a combined query keyword string: `${locationName} tourist spot`.
  // b. Query the structural Pexels search endpoint: 'https://pexels.com{keyword}&per_page=12'
  //    (use the keyword from step a, URL-encoded, as the query parameter).
  // c. Inject your authentication token securely using an Authorization header configuration
  //    block reading from the PEXELS_API_KEY constant above.
  // d. Map through the resulting 'photos' array in the payload and return streamlined objects
  //    styled exactly like: { id, imageUrl: [large image src URL], photographer, photographerUrl, altText }
  // e. Provide a backup empty array (or placeholder photo array) inside your catch layer shield
  //    to handle error edge cases gracefully.
  // The keyword is "<place> Philippines <topic>": the clean place name plus "Philippines" keeps
  // the search on the right country. The results are then filtered to the chosen place.
  const keyword = `${cleanPlaceName(locationName)} Philippines ${topic}`;
  const term = placeTerm(locationName);
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(keyword)}&per_page=${perPage}&page=${page}`;
  try {
    // Speed: the same search is answered from memory for a few minutes.
    const cached = pexelsCache.get(url);
    let data = cached && Date.now() - cached.at < SEARCH_CACHE_MS ? cached.data : null;
    if (!data) {
      const response = await axios.get(url, {
        headers: { Authorization: PEXELS_API_KEY ?? '' },
      });
      data = response.data;
      pexelsCache.set(url, { data, at: Date.now() });
    }
    return data.photos
      .filter((photo: any) => belongsTo(photo, term, topic))
      .map((photo: any) => toPhoto(photo, locationName));
  } catch {
    return [];
  }
};

// Same search, but also tells whether Pexels has more pages (used by the "Load more" button).
export const searchPhotosPage = async (
  locationName: string,
  page: number,
  topic: string = DEFAULT_TOPIC,
): Promise<{ photos: Photo[]; hasMore: boolean }> => {
  const keyword = `${cleanPlaceName(locationName)} Philippines ${topic}`;
  const term = placeTerm(locationName);
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(keyword)}&per_page=${RAW_PAGE_SIZE}&page=${page}`;
  try {
    const cached = pexelsCache.get(url);
    let data = cached && Date.now() - cached.at < SEARCH_CACHE_MS ? cached.data : null;
    if (!data) {
      const response = await axios.get(url, {
        headers: { Authorization: PEXELS_API_KEY ?? '' },
      });
      data = response.data;
      pexelsCache.set(url, { data, at: Date.now() });
    }
    return {
      photos: data.photos
        .filter((photo: any) => belongsTo(photo, term, topic))
        .map((photo: any) => toPhoto(photo, locationName)),
      hasMore: !!data.next_page,
    };
  } catch {
    return { photos: [], hasMore: false };
  }
};

// One photo of a place for the start-screen cards.
// Speed: the covers are saved on the device for 7 days, so after the first time the start screen
// shows its pictures straight away. When Pexels has no photo that mentions the place, the card
// simply has no picture instead of a photo of another place.
const COVER_KEY = 'lakbay_covers_v1';
const COVER_TTL_MS = 7 * 24 * 60 * 60 * 1000;
type CoverStore = Record<string, { photo: Photo; savedAt: number }>;
let coverStorePromise: Promise<CoverStore> | null = null;

// Loaded once and shared, so many cards asking at the same time use the same object.
const loadCoverStore = (): Promise<CoverStore> => {
  if (!coverStorePromise) {
    coverStorePromise = AsyncStorage.getItem(COVER_KEY)
      .then((raw) => (raw ? (JSON.parse(raw) as CoverStore) : {}))
      .catch(() => ({}) as CoverStore);
  }
  return coverStorePromise;
};

export const getPlaceCoverPhoto = async (name: string): Promise<Photo | null> => {
  const store = await loadCoverStore();
  const saved = store[name];
  if (saved && Date.now() - saved.savedAt < COVER_TTL_MS) {
    return saved.photo;
  }
  const photos = await searchPhotosByLocation(name, 1, DEFAULT_TOPIC, COVER_RAW_SIZE);
  const cover = photos[0] ?? null;
  // A failed request returns an empty list too, so only save real answers.
  if (cover) {
    store[name] = { photo: cover, savedAt: Date.now() };
    AsyncStorage.setItem(COVER_KEY, JSON.stringify(store)).catch(() => {
      // Saving is only a speed-up; ignore failures.
    });
  }
  return cover;
};