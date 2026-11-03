import axios from 'axios';

// TODO 1.1 [Base Configuration]: Set the fixed PSGC Gitlab API trailing-slash base URL constant.
// Targeted Value: 'https://psgc.gitlab.io/api'
const PSGC_BASE_URL = 'https://psgc.gitlab.io/api';

// Expo only exposes environment variables prefixed with EXPO_PUBLIC_ (loaded from the .env file).
const PEXELS_API_KEY = process.env.EXPO_PUBLIC_PEXELS_API_KEY;

// How many photos are requested from Pexels per page. Most of them are dropped by the place
// filter below, so a big page is asked for to keep enough photos of the chosen area.
const RAW_PAGE_SIZE = 80;

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
  try {
    const response = await axios.get(`${PSGC_BASE_URL}/regions/`);
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
  try {
    const response = await axios.get(
      `${PSGC_BASE_URL}/regions/${regionCode}/cities-municipalities/`,
    );
    return response.data;
  } catch {
    return [];
  }
};

// Name of a province from the PSGC (used by the area description). Empty when it is unknown.
export const getProvinceName = async (provinceCode: string): Promise<string> => {
  if (!provinceCode) return '';
  try {
    const response = await axios.get(`${PSGC_BASE_URL}/provinces/${provinceCode}/`);
    return response.data?.name ?? '';
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
  try {
    const response = await axios.get(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(keyword)}&per_page=${RAW_PAGE_SIZE}&page=${page}`,
      {
        headers: { Authorization: PEXELS_API_KEY ?? '' },
      },
    );
    return response.data.photos
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
  try {
    const response = await axios.get(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(keyword)}&per_page=${RAW_PAGE_SIZE}&page=${page}`,
      {
        headers: { Authorization: PEXELS_API_KEY ?? '' },
      },
    );
    return {
      photos: response.data.photos
        .filter((photo: any) => belongsTo(photo, term, topic))
        .map((photo: any) => toPhoto(photo, locationName)),
      hasMore: !!response.data.next_page,
    };
  } catch {
    return { photos: [], hasMore: false };
  }
};

// One photo of a place for the start-screen cards. Remembered so each place is only asked once.
// When Pexels has no photo that mentions the place, the card simply has no picture.
const coverCache = new Map<string, Photo | null>();
export const getPlaceCoverPhoto = async (name: string): Promise<Photo | null> => {
  if (coverCache.has(name)) return coverCache.get(name) ?? null;
  const photos = await searchPhotosByLocation(name);
  const cover = photos[0] ?? null;
  // A failed request returns an empty list too, so only remember real answers.
  if (cover) coverCache.set(name, cover);
  return cover;
};