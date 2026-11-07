import axios from 'axios';

// TODO 1.1 [Base Configuration]: Fixed PSGC Gitlab API base URL (no trailing slash; each path below adds its own).
const PSGC_BASE_URL = 'https://psgc.gitlab.io/api';

// Pexels search route (the README appendix shows a garbled URL; this is the real endpoint).
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

// Shape of one item in the Pexels response (only the fields we read).
type PexelsPhoto = {
  id: number;
  alt?: string;
  photographer: string;
  photographer_url: string;
  src: { large: string };
};

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

export const searchPhotosByLocation = async (locationName: string): Promise<Photo[]> => {
  // TODO 1.4 [Pexels Query Resolution]
  if (!locationName) return [];

  if (!PEXELS_API_KEY) {
    console.warn('EXPO_PUBLIC_PEXELS_API_KEY is missing. Create a .env file (see .env.example).');
    return [];
  }

  const keyword = `${locationName} tourist spot`;

  try {
    const response = await axios.get<{ photos: PexelsPhoto[] }>(PEXELS_SEARCH_URL, {
      // axios URL-encodes these params for us
      params: { query: keyword, per_page: 12 },
      headers: { Authorization: PEXELS_API_KEY },
    });

    return (response.data.photos ?? []).map((photo) => ({
      id: photo.id,
      imageUrl: photo.src.large,
      photographer: photo.photographer,
      photographerUrl: photo.photographer_url,
      altText: photo.alt || keyword,
    }));
  } catch (error) {
    console.warn('searchPhotosByLocation failed:', error);
    return [];
  }
};
