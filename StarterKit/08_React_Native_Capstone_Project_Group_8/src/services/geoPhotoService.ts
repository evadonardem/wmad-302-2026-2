import axios from 'axios';

// TODO 1.1 [Base Configuration]
const PSGC_BASE_URL = 'https://psgc.gitlab.io/api';

// The README's Pexels URL is garbled; this is the real endpoint
const PEXELS_SEARCH_URL = 'https://api.pexels.com/v1/search';

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

// TODO 1.2 [Regions Retrieval]
export const getRegions = async (): Promise<Region[]> => {
  try {
    const response = await axios.get<Region[]>(`${PSGC_BASE_URL}/regions/`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch regions:', error);
    return [];
  }
};

// TODO 1.3 [Chained Location Population]
export const getCitiesMunicipalitiesByRegion = async (regionCode: string): Promise<City[]> => {
  if (!regionCode) return [];

  try {
    const response = await axios.get<City[]>(
      `${PSGC_BASE_URL}/regions/${regionCode}/cities-municipalities/`
    );
    return [...response.data].sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error(`Failed to fetch cities for region ${regionCode}:`, error);
    return [];
  }
};

// TODO 1.4 [Pexels Query Resolution]
export const searchPhotosByLocation = async (locationName: string): Promise<Photo[]> => {
  if (!locationName) return [];

  if (!PEXELS_API_KEY) {
    console.error('Missing EXPO_PUBLIC_PEXELS_API_KEY. Check your .env file.');
    return [];
  }

  const keyword = `${locationName} tourist spot`;

  try {
    const response = await axios.get(PEXELS_SEARCH_URL, {
      params: { query: keyword, per_page: 12 },
      headers: { Authorization: PEXELS_API_KEY },
    });

    return (response.data.photos ?? []).map((photo: any) => ({
      id: photo.id,
      imageUrl: photo.src.large,
      photographer: photo.photographer,
      photographerUrl: photo.photographer_url,
      altText: photo.alt || keyword,
    }));
  } catch (error) {
    console.error('Failed to fetch photos:', error);
    return [];
  }
};