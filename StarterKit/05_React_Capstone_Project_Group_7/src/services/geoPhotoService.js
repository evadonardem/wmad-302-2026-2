import axios from 'axios';

// TODO 1.1 [Base Configuration]: Use the fixed PSGC Gitlab API trailing-slash structure format
const PSGC_BASE_URL = 'https://psgc.gitlab.io/api';

// Pexels search route (the handout's URL is garbled, this is the real endpoint)
const PEXELS_SEARCH_URL = 'https://api.pexels.com/v1/search';

// Vite exposes environment variables on the import.meta.env object
const PEXELS_API_KEY = import.meta.env.VITE_PEXELS_API_KEY;

// Minimum number of photos before we stop trying fallback searches
const MIN_RESULTS = 3;

// TODO 1.2 [Regions Retrieval]
export const getRegions = async () => {
  try {
    const response = await axios.get(`${PSGC_BASE_URL}/regions/`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch regions:', error);
    return [];
  }
};

// TODO 1.3 [Chained Location Population]
export const getCitiesMunicipalitiesByRegion = async (regionCode) => {
  if (!regionCode) return [];

  try {
    const response = await axios.get(
      `${PSGC_BASE_URL}/regions/${regionCode}/cities-municipalities/`
    );
    // Sort A-Z so the dropdown is easier to scan
    return [...response.data].sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error(`Failed to fetch cities for region ${regionCode}:`, error);
    return [];
  }
};

// Turns official PSGC names into names photographers actually use:
// "City of Manila" -> "Manila", "Baguio City" -> "Baguio", "Municipality of X" -> "X"
const cleanLocationName = (name) =>
  name
    .replace(/^(City|Municipality) of\s+/i, '')
    .replace(/\s+City$/i, '')
    .replace(/\s*\(.*?\)\s*/g, ' ') // remove parentheses like "(Capital)"
    .trim();

// One Pexels request. Returns [] on failure so callers never crash.
const fetchFromPexels = async (query) => {
  try {
    const response = await axios.get(PEXELS_SEARCH_URL, {
      params: { query, per_page: 12, orientation: 'landscape' },
      headers: { Authorization: PEXELS_API_KEY },
    });
    return response.data.photos || [];
  } catch (error) {
    console.error(`Pexels request failed for "${query}":`, error);
    return [];
  }
};

// TODO 1.4 [Pexels Query Resolution]
export const searchPhotosByLocation = async (locationName) => {
  if (!locationName) return [];

  if (!PEXELS_API_KEY) {
    console.error('Missing VITE_PEXELS_API_KEY. Check your .env.local file.');
    return [];
  }

  const cleanName = cleanLocationName(locationName);

  // Try the most specific query first, then broader ones if results are too few
  const queries = [
    `${cleanName} Philippines tourist spot`,
    `${cleanName} Philippines`,
    `${cleanName} landmark Philippines`,
  ];

  let photos = [];
  for (const query of queries) {
    photos = await fetchFromPexels(query);
    if (photos.length >= MIN_RESULTS) break;
  }

  return photos.map((photo) => ({
    id: photo.id,
    imageUrl: photo.src.large,
    photographer: photo.photographer,
    photographerUrl: photo.photographer_url,
    altText: photo.alt || `${cleanName} tourist spot`,
  }));
};