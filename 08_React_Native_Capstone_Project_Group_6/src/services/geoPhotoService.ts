import axios from 'axios';

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
  width?: number;
  height?: number;
};

export type PhotoPage = {
  photos: Photo[];
  hasMore: boolean;
  total: number;
};

export const getRegions = async (): Promise<Region[]> => {
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

/**
 * One page of results. THROWS on network errors so the UI can show
 * "Try again" / "Retry". `hasMore` comes from Pexels' own next_page field.
 */
export const searchPhotosPage = async (
  locationName: string,
  page = 1,
  perPage = 24
): Promise<PhotoPage> => {
  if (!locationName || !PEXELS_API_KEY) {
    console.warn('Missing location name or EXPO_PUBLIC_PEXELS_API_KEY');
    return { photos: [], hasMore: false, total: 0 };
  }

  const keyword = `${locationName} Philippines tourist spot`;

  const response = await axios.get('https://api.pexels.com/v1/search', {
    params: { query: keyword, per_page: perPage, page },
    headers: { Authorization: PEXELS_API_KEY },
  });

  const photos: Photo[] = (response.data.photos ?? []).map((photo: any): Photo => ({
    id: photo.id,
    imageUrl: photo.src.large,
    photographer: photo.photographer,
    photographerUrl: photo.photographer_url,
    altText: photo.alt || `${locationName} tourist spot`,
    width: photo.width,
    height: photo.height,
  }));

  return {
    photos,
    hasMore: Boolean(response.data.next_page),
    total: response.data.total_results ?? photos.length,
  };
};

/** Simple first-page helper (never throws). Used for the header polaroids. */
export const searchPhotosByLocation = async (locationName: string): Promise<Photo[]> => {
  try {
    const { photos } = await searchPhotosPage(locationName, 1, 12);
    return photos;
  } catch (error) {
    console.error('Failed to fetch photos:', error);
    return [];
  }
};