import axios from 'axios';

// TODO 1.1 [Base Configuration]: Set the fixed PSGC Gitlab API trailing-slash base URL constant.
// Targeted Value: 'https://psgc.gitlab.io/api'
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

export const getRegions = async (): Promise<Region[]> => {
  // TODO 1.2
  try {
    const response = await axios.get<Region[]>(`${PSGC_BASE_URL}/regions/`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch regions:', error);
    return [];
  }
};

export const getCitiesMunicipalitiesByRegion = async (
  regionCode: string
): Promise<City[]> => {
  // TODO 1.3
  if (!regionCode) return [];

  try {
    const response = await axios.get<City[]>(
      `${PSGC_BASE_URL}/regions/${regionCode}/cities-municipalities/`
    );
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch cities for region ${regionCode}:`, error);
    return [];
  }
};

export const searchPhotosByLocation = async (
  locationName: string
): Promise<Photo[]> => {
  // TODO 1.4
  if (!locationName || !PEXELS_API_KEY) {
    console.warn('Missing location name or EXPO_PUBLIC_PEXELS_API_KEY');
    return [];
  }

  const keyword = `${locationName} tourist spot`;

  try {
    const response = await axios.get('https://api.pexels.com/v1/search', {
      params: { query: keyword, per_page: 12 },
      headers: { Authorization: PEXELS_API_KEY },
    });

    return (response.data.photos ?? []).map((photo: any): Photo => ({
      id: photo.id,
      imageUrl: photo.src.large,
      photographer: photo.photographer,
      photographerUrl: photo.photographer_url,
      altText: photo.alt || `${locationName} tourist spot`,
    }));
  } catch (error) {
    console.error('Failed to fetch photos:', error);
    return [];
  }
};
