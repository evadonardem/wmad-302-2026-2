import axios from 'axios';

// TODO 1.1 [Base Configuration]: Fixed PSGC base URL (no trailing slash).
const PSGC_BASE_URL = 'https://psgc.gitlab.io/api';
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
  imageUrlLarge: string;
  photographer: string;
  photographerUrl: string;
  pexelsUrl: string;
  location: string;
  description: string;
  altText: string;
};

type PexelsPhoto = {
  id: number;
  url: string;
  photographer: string;
  photographer_url: string;
  alt: string | null;
  src: { large: string; large2x: string };
};

type PexelsSearchResponse = {
  photos: PexelsPhoto[];
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
      `${PSGC_BASE_URL}/regions/${regionCode}/cities-municipalities/`,
    );
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch cities/municipalities for region ${regionCode}:`, error);
    return [];
  }
};

// TODO 1.4 [Pexels Query Resolution]
const mapPhoto = (photo: PexelsPhoto, location: string): Photo => ({
  id: photo.id,
  imageUrl: photo.src.large,
  imageUrlLarge: photo.src.large2x || photo.src.large,
  photographer: photo.photographer,
  photographerUrl: photo.photographer_url,
  pexelsUrl: photo.url,
  location,
  description: photo.alt || '',
  altText: photo.alt || `${location} photo by ${photo.photographer}`,
});

export const searchPhotosByLocation = async (locationName: string): Promise<Photo[]> => {
  const query = `${locationName} tourist spot`;

  try {
    const response = await axios.get<PexelsSearchResponse>(PEXELS_SEARCH_URL, {
      params: { query, per_page: 12 },
      headers: { Authorization: PEXELS_API_KEY },
    });

    return response.data.photos.map((photo) => mapPhoto(photo, locationName));
  } catch (error) {
    console.error(`Failed to fetch photos for "${locationName}":`, error);
    return [];
  }
};