import axios from 'axios';

// TODO 1.1 [Base Configuration]: Fixed PSGC Gitlab API base URL (no trailing slash; each path below adds its own).
const PSGC_BASE_URL = 'https://psgc.gitlab.io/api';

// Pexels search route (the README appendix shows a garbled URL; this is the real endpoint).
const PEXELS_SEARCH_URL = 'https://api.pexels.com/v1/search';

// Free geocoding API (no key) used to find the coordinates for the map pin.
const GEOCODE_URL = 'https://geocoding-api.open-meteo.com/v1/search';

// Expo only exposes environment variables prefixed with EXPO_PUBLIC_ (loaded from the .env file).
// .trim() guards against a stray space or line break at the end of the value in .env.
const PEXELS_API_KEY = process.env.EXPO_PUBLIC_PEXELS_API_KEY?.trim();

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
};

export type Photo = {
  id: number;
  imageUrl: string;
  photographer: string;
  photographerUrl: string;
  altText: string;
  // optional extras used by the details sheet and the map pin
  width?: number;
  height?: number;
  pexelsUrl?: string;
  placeName?: string;
  latitude?: number;
  longitude?: number;
};

// Shape of one item in the Pexels response (only the fields we read).
type PexelsPhoto = {
  id: number;
  alt?: string;
  photographer: string;
  photographer_url: string;
  src: { large: string };
  width: number;
  height: number;
  url: string;
};

type Coords = { latitude: number; longitude: number; label: string };
const geoCache = new Map<string, Coords | null>();

export const getRegions = async (): Promise<Region[]> => {
  // TODO 1.2 [Regions Retrieval]
  try {
    const response = await axios.get<Region[]>(`${PSGC_BASE_URL}/regions/`);
    return response.data;
  } catch (error) {
    console.warn('getRegions failed:', error);
    return [];
  }
};

export const getCitiesMunicipalitiesByRegion = async (regionCode: string): Promise<City[]> => {
  // TODO 1.3 [Chained Location Population]
  if (!regionCode) return [];

  try {
    const response = await axios.get<City[]>(
      `${PSGC_BASE_URL}/regions/${regionCode}/cities-municipalities/`,
    );
    return response.data;
  } catch (error) {
    console.warn('getCitiesMunicipalitiesByRegion failed:', error);
    return [];
  }
};

// Finds coordinates for the searched place. If this fails the photos still load, just without a pin.
const geocodePlace = async (locationName: string): Promise<Coords | null> => {
  if (geoCache.has(locationName)) return geoCache.get(locationName) ?? null;

  try {
    // "San Fernando (La Union)" -> query "San Fernando", hint "la union"
    const hint = locationName.match(/\((.*?)\)/)?.[1]?.toLowerCase();
    const clean = locationName.replace(/\(.*?\)/g, '').replace(/\bCity\b/i, '').trim();

    const response = await axios.get<{ results?: any[] }>(GEOCODE_URL, {
      params: { name: clean, count: 10, language: 'en', country_code: 'PH' },
    });

    const results = response.data.results ?? [];
    const best =
      (hint &&
        results.find((r) => `${r.admin1 ?? ''} ${r.admin2 ?? ''}`.toLowerCase().includes(hint))) ||
      results[0];

    const coords: Coords | null = best
      ? {
          latitude: best.latitude,
          longitude: best.longitude,
          label: [best.name, best.admin1].filter(Boolean).join(', '),
        }
      : null;

    geoCache.set(locationName, coords);
    return coords;
  } catch (error) {
    console.warn('geocodePlace failed (photos will still load, without a map pin):', error);
    return null;
  }
};

export const searchPhotosByLocation = async (locationName: string): Promise<Photo[]> => {
  // TODO 1.4 [Pexels Query Resolution]
  if (!locationName) return [];

  if (!PEXELS_API_KEY) {
    console.warn(
      'EXPO_PUBLIC_PEXELS_API_KEY is missing. Add it to .env (project root) and restart with: npx expo start -c',
    );
    return [];
  }

  // "Philippines" keeps names like "San Fernando" or "San Carlos" from matching other countries.
  const keyword = `${locationName} Philippines tourist spot`;

  try {
    // Photo search and place lookup run at the same time.
    const [response, place] = await Promise.all([
      axios.get<{ photos: PexelsPhoto[] }>(PEXELS_SEARCH_URL, {
        // axios URL-encodes these params for us
        params: { query: keyword, per_page: 12 },
        headers: { Authorization: PEXELS_API_KEY },
      }),
      geocodePlace(locationName),
    ]);

    const photos = response.data.photos ?? [];
    console.log(`[Pexels] "${keyword}" → ${photos.length} photos`);

    return photos.map((photo) => ({
      id: photo.id,
      imageUrl: photo.src.large,
      photographer: photo.photographer,
      photographerUrl: photo.photographer_url,
      altText: photo.alt || keyword,
      width: photo.width,
      height: photo.height,
      pexelsUrl: photo.url,
      placeName: place?.label ?? `${locationName}, Philippines`,
      latitude: place?.latitude,
      longitude: place?.longitude,
    }));
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const reason =
        status === 401
          ? 'API key rejected (401): check the key in .env'
          : status === 429
            ? 'Rate limit reached (429): wait a bit and try again'
            : status
              ? `HTTP ${status}`
              : 'No response (network or CORS problem)';
      console.warn(`[Pexels] search failed: ${reason}`, error.message);
    } else {
      console.warn('searchPhotosByLocation failed:', error);
    }
    return [];
  }
};