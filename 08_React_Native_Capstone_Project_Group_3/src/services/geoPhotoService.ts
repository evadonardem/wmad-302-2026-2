import axios from 'axios';

// TODO 1.1 [Base Configuration]
const PSGC_BASE_URL = 'https://psgc.gitlab.io/api';

// Expo only exposes environment variables prefixed with EXPO_PUBLIC_ (loaded from the .env file).
const PEXELS_API_KEY = process.env.EXPO_PUBLIC_PEXELS_API_KEY;

export type Region = {
  code: string;
  name: string;
  regionName: string;
  islandGroupCode: string;
  psgcCode: string;
};

export type Province = {
  code: string;
  name: string;
  regionCode: string;
  islandGroupCode: string;
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
};

const byName = (a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name);

// Tries each path in order and returns the first non-empty array
async function fetchList<T>(paths: string[]): Promise<T[]> {
  for (const path of paths) {
    try {
      const response = await axios.get<T[]>(`${PSGC_BASE_URL}${path}`);
      if (Array.isArray(response.data) && response.data.length > 0) {
        return response.data;
      }
    } catch (error) {
      console.warn(`PSGC request failed: ${path}`, error);
    }
  }
  return [];
}

export const getRegions = async (): Promise<Region[]> => {
  // TODO 1.2 [Regions Retrieval]
  try {
    const response = await axios.get<Region[]>(`${PSGC_BASE_URL}/regions/`);
    return response.data;
  } catch (error) {
    console.warn('Failed to fetch regions:', error);
    return [];
  }
};

// Provinces inside a region (NCR has none, so this returns [] for it)
export const getProvincesByRegion = async (regionCode: string): Promise<Province[]> => {
  if (!regionCode) return [];
  const list = await fetchList<Province>([
    `/regions/${regionCode}/provinces/`,
    `/regions/${regionCode}/provinces.json`,
  ]);
  return list.sort(byName);
};

// Cities and municipalities inside one province
export const getCitiesMunicipalitiesByProvince = async (provinceCode: string): Promise<City[]> => {
  if (!provinceCode) return [];
  const list = await fetchList<City>([
    `/provinces/${provinceCode}/cities-municipalities/`,
    `/provinces/${provinceCode}/cities-municipalities.json`,
  ]);
  return list.sort(byName);
};

export const getCitiesMunicipalitiesByRegion = async (regionCode: string): Promise<City[]> => {
  // TODO 1.3 [Chained Location Population]
  if (!regionCode) return [];

  // 1. Direct lookup (the path required by the TODO, then the .json variant)
  let list = await fetchList<City>([
    `/regions/${regionCode}/cities-municipalities/`,
    `/regions/${regionCode}/cities-municipalities.json`,
  ]);

  // 2. Fallback: go through the region's provinces
  if (list.length === 0) {
    const provinces = await getProvincesByRegion(regionCode);
    const perProvince = await Promise.all(
      provinces.map((province) => getCitiesMunicipalitiesByProvince(province.code)),
    );
    list = perProvince.flat();
  }

  return list.sort(byName);
};

type PexelsPhoto = {
  id: number;
  alt?: string;
  photographer: string;
  photographer_url: string;
  src: { large: string; landscape?: string };
};

export const searchPhotosByLocation = async (locationName: string): Promise<Photo[]> => {
  // TODO 1.4 [Pexels Query Resolution]
  const keyword = `${locationName} tourist spot`;

  try {
    const response = await axios.get<{ photos: PexelsPhoto[] }>(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(keyword)}&per_page=12`,
      {
        headers: { Authorization: PEXELS_API_KEY ?? '' },
      },
    );

    return (response.data.photos ?? []).map((photo) => ({
      id: photo.id,
      imageUrl: photo.src.large,
      photographer: photo.photographer,
      photographerUrl: photo.photographer_url,
      altText: photo.alt || `${locationName} tourist spot`,
    }));
  } catch (error) {
    console.warn(`Failed to fetch photos for "${locationName}":`, error);
    return [];
  }
};

// Scenic Philippine landscapes used for the page backgrounds (fetched once per session)
const BACKGROUND_QUERIES = [
  'Philippines beach island',
  'Philippines mountains rice terraces',
  'Philippines sunset sea',
  'Philippines waterfall nature',
];

let backgroundCache: Promise<string[]> | null = null;

export const getBackgroundPhotos = (): Promise<string[]> => {
  if (!PEXELS_API_KEY) return Promise.resolve([]);

  if (!backgroundCache) {
    backgroundCache = (async () => {
      const results = await Promise.allSettled(
        BACKGROUND_QUERIES.map((query) =>
          axios.get<{ photos: PexelsPhoto[] }>(
            `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=3&orientation=landscape`,
            { headers: { Authorization: PEXELS_API_KEY } },
          ),
        ),
      );

      const urls: string[] = [];
      for (const result of results) {
        if (result.status !== 'fulfilled') continue;
        for (const photo of result.value.data.photos ?? []) {
          const url = photo.src.landscape ?? photo.src.large;
          if (url && !urls.includes(url)) urls.push(url);
        }
      }

      // Let the next screen try again if nothing came back (offline, bad key…)
      if (urls.length === 0) backgroundCache = null;
      return urls;
    })();
  }

  return backgroundCache;
};