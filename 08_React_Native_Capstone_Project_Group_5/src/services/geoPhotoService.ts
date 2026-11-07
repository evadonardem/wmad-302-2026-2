import axios from 'axios';

const PSGC_BASE_URL = 'https://psgc.gitlab.io/api';
const PEXELS_API_KEY = process.env.EXPO_PUBLIC_PEXELS_API_KEY ?? '';

export type Region = {
  code: string;
  name: string;
  regionName: string;
  islandGroupCode: string;
  psgc10DigitCode: string;
};

export type Province = {
  code: string;
  name: string;
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

type PexelsPhoto = {
  id: number;
  src?: {
    large2x?: string;
    large?: string;
    medium?: string;
  };
  photographer?: string;
  photographer_url?: string;
  alt?: string;
};

const sortByName = <T extends { name: string }>(items: T[]) =>
  [...items].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));

export const isPexelsConfigured = Boolean(PEXELS_API_KEY);

export const getRegions = async (): Promise<Region[]> => {
  try {
    const response = await axios.get(`${PSGC_BASE_URL}/regions/`);
    return Array.isArray(response.data) ? sortByName(response.data) : [];
  } catch (error) {
    console.error('Unable to load regions:', error);
    throw new Error('Unable to load regions. Check your connection and try again.');
  }
};

export const getProvincesByRegion = async (regionCode: string): Promise<Province[]> => {
  if (!regionCode) return [];

  try {
    const response = await axios.get(
      `${PSGC_BASE_URL}/regions/${encodeURIComponent(regionCode)}/provinces/`,
    );
    return Array.isArray(response.data) ? sortByName(response.data) : [];
  } catch (error) {
    console.error('Unable to load provinces:', error);
    throw new Error('Unable to load provinces. Check your connection and try again.');
  }
};

export const getCitiesMunicipalitiesByRegion = async (regionCode: string): Promise<City[]> => {
  if (!regionCode) return [];

  try {
    const response = await axios.get(
      `${PSGC_BASE_URL}/regions/${encodeURIComponent(regionCode)}/cities-municipalities/`,
    );
    return Array.isArray(response.data) ? sortByName(response.data) : [];
  } catch (error) {
    console.error('Unable to load cities and municipalities:', error);
    throw new Error('Unable to load cities and municipalities. Check your connection and try again.');
  }
};

export const getCitiesMunicipalitiesByProvince = async (provinceCode: string): Promise<City[]> => {
  if (!provinceCode) return [];

  try {
    const response = await axios.get(
      `${PSGC_BASE_URL}/provinces/${encodeURIComponent(provinceCode)}/cities-municipalities/`,
    );
    return Array.isArray(response.data) ? sortByName(response.data) : [];
  } catch (error) {
    console.error('Unable to load cities and municipalities:', error);
    throw new Error('Unable to load cities and municipalities. Check your connection and try again.');
  }
};

export const searchPhotosByLocation = async (
  locationName: string,
  locationContext?: string,
): Promise<Photo[]> => {
  const trimmedLocation = locationName?.trim();
  if (!trimmedLocation) return [];
  if (!PEXELS_API_KEY) {
    throw new Error('Add EXPO_PUBLIC_PEXELS_API_KEY to your local environment to search photos.');
  }

  const query = [
    trimmedLocation,
    locationContext?.trim(),
    locationContext ? 'Philippines' : null,
    'tourist spot',
  ]
    .filter(Boolean)
    .join(' ');

  try {
    const response = await axios.get('https://api.pexels.com/v1/search', {
      params: {
        query,
        per_page: 12,
      },
      headers: {
        Authorization: PEXELS_API_KEY,
      },
    });

    const photos: PexelsPhoto[] = Array.isArray(response.data?.photos) ? response.data.photos : [];
    return photos
      .filter((photo) => photo.src?.large2x || photo.src?.large || photo.src?.medium)
      .map((photo) => ({
        id: photo.id,
        imageUrl: photo.src?.large2x ?? photo.src?.large ?? photo.src?.medium ?? '',
        photographer: photo.photographer ?? 'Unknown photographer',
        photographerUrl: photo.photographer_url ?? 'https://www.pexels.com',
        altText: photo.alt ?? `${trimmedLocation} tourist spot`,
      }));
  } catch (error) {
    console.error('Unable to search Pexels photos:', error);
    throw new Error('Unable to search photos. Check your connection and try again.');
  }
};
