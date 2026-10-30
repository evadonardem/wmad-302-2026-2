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
    const provinces = await fetchList<{ code: string }>([
      `/regions/${regionCode}/provinces/`,
      `/regions/${regionCode}/provinces.json`,
    ]);
    const perProvince = await Promise.all(
      provinces.map((province) =>
        fetchList<City>([
          `/provinces/${province.code}/cities-municipalities/`,
          `/provinces/${province.code}/cities-municipalities.json`,
        ]),
      ),
    );
    list = perProvince.flat();
  }

  return list.sort((a, b) => a.name.localeCompare(b.name));
};

type PexelsPhoto = {
  id: number;
  alt?: string;
  photographer: string;
  photographer_url: string;
  src: { large: string };
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