import axios from 'axios';


const PSGC_BASE_URL = 'https://psgc.gitlab.io/api';


// Key comes from .env.local (VITE_PEXELS_API_KEY). When the page is opened as a plain
// HTML file, a key saved in the browser (see MediaGallery) is used instead.
const readSavedKey = () => {
  try { return localStorage.getItem('pexels-key') || ''; } catch { return ''; }
};
const PEXELS_API_KEY = import.meta.env.VITE_PEXELS_API_KEY || readSavedKey();

export const getRegions = async () => {
  try {
    const { data } = await axios.get(`${PSGC_BASE_URL}/regions/`);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Failed to fetch regions:', error);
    return [];
  }
};

export const getCitiesMunicipalitiesByRegion = async (regionCode) => {
  if (!regionCode) return [];
  try {
    const { data } = await axios.get(
      `${PSGC_BASE_URL}/regions/${regionCode}/cities-municipalities/`
    );
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Failed to fetch cities:', error);
    return [];
  }
};

export const searchPhotosByLocation = async (locationName, regionName = '') => {
  if (!locationName) return [];

  // "City of Vigan" / "Laoag City" -> "Vigan" / "Laoag"
  const cleanName = locationName
    .replace(/^City of\s+/i, '')
    .replace(/\s+City$/i, '')
    .trim();

  try {
    const { data } = await axios.get('https://api.pexels.com/v1/search', {
      headers: { Authorization: PEXELS_API_KEY },
      params: { query: `${cleanName} ${regionName} Philippines`, per_page: 40 },
    });

    const nameLower = cleanName.toLowerCase();

    return (data.photos ?? [])
      .filter((p) => (p.alt || '').toLowerCase().includes(nameLower))
      .slice(0, 12)
      .map((p) => ({
        id: p.id,
        imageUrl: p.src.large,
        photographer: p.photographer,
        photographerUrl: p.photographer_url,
        altText: p.alt || `${cleanName} tourist spot`,
      }));
  } catch (error) {
    console.error('Pexels search failed:', error);
    return [];
  }
};

// ---------------------------------------------------------------------------
// Added for the Region -> Province -> Cities/Municipalities search
// (the functions above are unchanged)
// ---------------------------------------------------------------------------

// Same request twice = no extra call (PSGC is a static API, Pexels has an hourly limit).
const cache = new Map();
const remember = async (key, load) => {
  if (cache.has(key)) return cache.get(key);
  const result = await load();
  if (Array.isArray(result) ? result.length > 0 : result) cache.set(key, result);
  return result;
};
const byName = (a, b) => a.name.localeCompare(b.name);

// GET /regions/{code}/provinces/
export const getProvincesByRegion = async (regionCode) => {
  if (!regionCode) return [];
  try {
    const { data } = await axios.get(`${PSGC_BASE_URL}/regions/${regionCode}/provinces/`);
    return Array.isArray(data) ? data.map((p) => ({ ...p, kind: 'province' })).sort(byName) : [];
  } catch (error) {
    console.error('Failed to fetch provinces:', error);
    return [];
  }
};

// GET /provinces/{code}/cities-municipalities/
export const getCitiesMunicipalitiesByProvince = async (provinceCode) => {
  if (!provinceCode) return [];
  try {
    const { data } = await axios.get(`${PSGC_BASE_URL}/provinces/${provinceCode}/cities-municipalities/`);
    return Array.isArray(data) ? [...data].sort(byName) : [];
  } catch (error) {
    console.error('Failed to fetch cities/municipalities:', error);
    return [];
  }
};

// Regions such as NCR have no provinces, so their cities are listed instead.
export const getProvincesOrCities = (regionCode) =>
  remember(`provinces-or-cities:${regionCode}`, async () => {
    const provinces = await getProvincesByRegion(regionCode);
    if (provinces.length) return provinces;
    const cities = await getCitiesMunicipalitiesByRegion(regionCode);
    return cities.map((c) => ({ ...c, kind: 'city' })).sort(byName);
  });

export const getTownsOfProvince = (provinceCode) =>
  remember(`towns:${provinceCode}`, () => getCitiesMunicipalitiesByProvince(provinceCode));

// Pexels search for any place. Unlike searchPhotosByLocation it keeps every result,
// so each place gets pictures. Returns the full details used by the photo viewer.
export const searchPhotos = async (query, perPage = 12, page = 1) => {
  if (!PEXELS_API_KEY) {
    throw new Error('Missing VITE_PEXELS_API_KEY in .env.local (restart npm run dev after adding it).');
  }
  return remember(`photos:${query}|${perPage}|${page}`, async () => {
    try {
      const { data } = await axios.get('https://api.pexels.com/v1/search', {
        headers: { Authorization: PEXELS_API_KEY },
        params: { query, per_page: perPage, page, orientation: 'landscape' },
      });
      return (data.photos ?? []).map((p) => ({
        id: p.id,
        imageUrl: p.src.large,
        fullUrl: p.src.large2x,
        altText: p.alt || query,
        photographer: p.photographer,
        photographerUrl: p.photographer_url,
        pageUrl: p.url,
        width: p.width,
        height: p.height,
        color: p.avg_color,
      }));
    } catch (error) {
      if (error.response?.status === 429) throw new Error('Pexels rate limit reached. Please try again in a while.');
      throw new Error(`Pexels request failed${error.response ? ` (${error.response.status})` : ''}.`);
    }
  });
};
