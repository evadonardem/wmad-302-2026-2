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

// Remembers the cities/municipalities of the most recently loaded region, so the
// description lookup can find the province and type (city or municipality) by name
let cityIndex = {};

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

    cityIndex = {};
    response.data.forEach((city) => {
      cityIndex[city.name] = city;
    });

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

// ---------- Place description (Wikipedia first, PSGC-based fallback) ----------

const WIKI_API = 'https://en.wikipedia.org/w/api.php';

// Removes bracketed parts like "National Capital Region (NCR)" -> "National Capital Region"
const cleanName = (name) => (name || '').replace(/\s*\(.*?\)\s*/g, ' ').trim() || null;

// Looks up a province or region name from PSGC (cached)
const psgcNameCache = {};
const getPsgcName = async (path) => {
  if (psgcNameCache[path]) return psgcNameCache[path];
  try {
    const response = await axios.get(`${PSGC_BASE_URL}/${path}/`);
    psgcNameCache[path] = response.data.name;
    return response.data.name;
  } catch (error) {
    console.error(`Error fetching ${path}:`, error);
    return null;
  }
};

// Fetches Wikipedia page summaries (by exact title or by search)
const fetchWikiPages = async (params) => {
  const response = await axios.get(WIKI_API, {
    params: {
      action: 'query',
      prop: 'extracts|pageprops',
      ppprop: 'disambiguation',
      exintro: 1,
      explaintext: 1,
      exsentences: 4,
      exlimit: 'max',
      redirects: 1,
      format: 'json',
      origin: '*',
      ...params,
    },
  });
  return Object.values(response.data?.query?.pages || {});
};

// A page is usable if it exists, is not a disambiguation page, and is about the Philippines
const isUsablePage = (page, province) =>
  page &&
  !('missing' in page) &&
  page.extract &&
  !page.pageprops?.disambiguation &&
  (/philippines/i.test(page.extract) ||
    (province && normalize(page.extract).includes(normalize(province))));

const toDescription = (page) => ({
  title: page.title,
  text: page.extract,
  url: `https://en.wikipedia.org/?curid=${page.pageid}`,
});

export const getPlaceDescription = async (locationName) => {
  if (!locationName) return null;

  const shortName = cleanName(getShortName(locationName)) || locationName;
  const place = cityIndex[locationName]; // PSGC record of the selected place, if known

  // Province (or region for NCR) from PSGC, used for exact Wikipedia titles
  let province = null;
  let regionName = null;
  if (place?.provinceCode) {
    province = cleanName(await getPsgcName(`provinces/${place.provinceCode}`));
  }
  if (!province && place?.regionCode) {
    regionName = cleanName(await getPsgcName(`regions/${place.regionCode}`));
  }

  // 1. Try exact Wikipedia titles ("Sablan, Benguet", "Baguio", "Cebu City")
  const candidates = [
    province && `${shortName}, ${province}`,
    shortName,
    (!place || place.isCity) && `${shortName} City`,
  ].filter(Boolean);

  for (const title of candidates) {
    try {
      const [page] = await fetchWikiPages({ titles: title });
      if (isUsablePage(page, province)) return toDescription(page);
    } catch (error) {
      console.error(`Wikipedia lookup failed for "${title}":`, error);
    }
  }

  // 2. Search Wikipedia and pick the best matching result
  try {
    const searchText = `${shortName} ${province || ''} Philippines`.replace(/\s+/g, ' ').trim();
    const pages = await fetchWikiPages({
      generator: 'search',
      gsrsearch: searchText,
      gsrlimit: 5,
    });
    pages.sort((a, b) => a.index - b.index);
    const match = pages.find(
      (page) =>
        isUsablePage(page, province) &&
        normalize(page.title).startsWith(normalize(shortName))
    );
    if (match) return toDescription(match);
  } catch (error) {
    console.error('Error searching Wikipedia:', error);
  }

  // 3. Fallback: build a short description from PSGC data
  const kind = place ? (place.isCity ? 'city' : 'municipality') : 'place';
  let where = 'in the Philippines';
  if (province) where = `in the province of ${province}, Philippines`;
  else if (regionName) where = `in the ${regionName}, Philippines`;

  return {
    title: shortName,
    text: `${shortName} is a ${kind} ${where}. A detailed history of this place is not available yet.`,
    url: null,
  };
};

// ---------- Featured spot photos (one photo per spot, cached) ----------

const featuredPhotoCache = {};

export const getFeaturedPhoto = async (query) => {
  if (query in featuredPhotoCache) return featuredPhotoCache[query];

  try {
    const response = await axios.get('https://api.pexels.com/v1/search', {
      params: { query, per_page: 1, orientation: 'landscape' },
      headers: { Authorization: PEXELS_API_KEY },
    });

    const photo = response.data.photos[0];
    const result = photo
      ? {
          id: photo.id,
          imageUrl: photo.src.large,
          photographer: photo.photographer,
          photographerUrl: photo.photographer_url,
          altText: photo.alt,
        }
      : null;

    featuredPhotoCache[query] = result;
    return result;
  } catch (error) {
    console.error(`Error fetching featured photo for "${query}":`, error);
    return null; // not cached, so it can retry later
  }
};