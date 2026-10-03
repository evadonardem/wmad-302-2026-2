import axios from 'axios';

// TODO 1.1 [Base Configuration]: Use the fixed PSGC Gitlab API trailing-slash structure format
const PSGC_BASE_URL = 'https://psgc.gitlab.io/api';

// Vite exposes environment variables on the import.meta.env object
const PEXELS_API_KEY = import.meta.env.VITE_PEXELS_API_KEY;

export const getRegions = async () => {
  // TODO 1.2 [Regions Retrieval]: Fetch the full array of regions from the PSGC host.
  // Perform an asynchronous GET request using axios, catch errors smoothly, and return the dataset array.
  // Targeted Path Format: `${PSGC_BASE_URL}/regions/`
  try {
    const response = await axios.get(`${PSGC_BASE_URL}/regions/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching regions:', error);
    return [];
  }
};

export const getCitiesMunicipalitiesByRegion = async (regionCode) => {
  // TODO 1.3 [Chained Location Population]: Complete the dynamic lookup using string interpolation.
  // Validate that a truthy regionCode parameter is provided prior to generating network requests.
  // Execute an async GET request hitting the exact trailing-slash path directory.
  // Targeted Path Format: `${PSGC_BASE_URL}/regions/{regionCode}/cities-municipalities/`
  if (!regionCode) return [];

  try {
    const response = await axios.get(
      `${PSGC_BASE_URL}/regions/${regionCode}/cities-municipalities/`
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching cities for region ${regionCode}:`, error);
    return [];
  }
};

// ---------- Helpers for matching photos to the chosen place ----------

// Strip "City of" / "Municipality of" / "City" so the name matches photo captions
const getShortName = (name) =>
  name
    .replace(/^(city of|municipality of)\s+/i, '')
    .replace(/\s+(city|municipality)$/i, '')
    .trim();

// Lowercase and remove accents (e.g. "Peñablanca" -> "penablanca")
const normalize = (text) =>
  (text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const searchPhotosByLocation = async (locationName) => {
  // TODO 1.4 [Pexels Query Resolution]: Formulate the dynamic target endpoint string URL.
  // a. Create a combined query keyword string: "[locationName] tourist spot".
  // b. Query the structural Pexels endpoint path: 'https://pexels.com[keyword]&per_page=12'.
  // c. Ensure you inject your authentication token securely using an authorization header parameter configuration block.
  // d. Map through the resulting array and return streamlined objects styled exactly like: 
  //    { id, imageUrl: [large image src URL], photographer, photographerUrl, altText }
  // e. Provide a backup structural object array inside your catch layer shield to handle error edge cases.
  if (!locationName) return [];

  const shortName = getShortName(locationName);
  const matcher = new RegExp(`\\b${escapeRegex(normalize(shortName))}\\b`);

  const queries = [
    `${shortName} Philippines`,
    `${shortName} Philippines tourist spot`,
  ];

  try {
    const responses = await Promise.all(
      queries.map((query) =>
        axios.get('https://api.pexels.com/v1/search', {
          params: { query, per_page: 40 },
          headers: { Authorization: PEXELS_API_KEY },
        })
      )
    );

    // Merge results and remove duplicates
    const seen = new Set();
    const allPhotos = responses
      .flatMap((res) => res.data.photos)
      .filter((photo) => {
        if (seen.has(photo.id)) return false;
        seen.add(photo.id);
        return true;
      });

    // Keep only photos whose caption actually mentions the place
    return allPhotos
      .filter((photo) => matcher.test(normalize(photo.alt)))
      .slice(0, 12)
      .map((photo) => ({
        id: photo.id,
        imageUrl: photo.src.large,
        photographer: photo.photographer,
        photographerUrl: photo.photographer_url,
        altText: photo.alt || `${locationName} tourist spot`,
      }));
  } catch (error) {
    console.error('Error fetching photos from Pexels:', error);
    return [];
  }
};

// Fetches a short Wikipedia summary (location + history) for the chosen place
export const getPlaceDescription = async (locationName) => {
  if (!locationName) return null;

  const shortName = getShortName(locationName);

  try {
    const response = await axios.get('https://en.wikipedia.org/w/api.php', {
      params: {
        action: 'query',
        generator: 'search',
        gsrsearch: `${shortName} Philippines`,
        gsrlimit: 1,
        prop: 'extracts',
        exintro: 1,
        explaintext: 1,
        exsentences: 4,
        format: 'json',
        origin: '*',
      },
    });

    const pages = response.data?.query?.pages;
    if (!pages) return null;

    const page = Object.values(pages)[0];

    // Reject results that aren't about the Philippines
    if (!page?.extract || !/philippines/i.test(page.extract)) return null;

    return {
      title: page.title,
      text: page.extract,
      url: `https://en.wikipedia.org/?curid=${page.pageid}`,
    };
  } catch (error) {
    console.error('Error fetching place description:', error);
    return null;
  }
};