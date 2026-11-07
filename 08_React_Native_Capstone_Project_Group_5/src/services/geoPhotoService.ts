import axios from 'axios';

const PSGC_BASE_URL = 'https://psgc.gitlab.io/api';
const PEXELS_API_KEY = process.env.EXPO_PUBLIC_PEXELS_API_KEY ?? '';

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

export const getRegions = async () => {
  try {
    const response = await axios.get(`${PSGC_BASE_URL}/regions/`);
    return Array.isArray(response.data) ? response.data : [];
  } catch {
    return [];
  }
};

export const getCitiesMunicipalitiesByRegion = async (regionCode: string) => {
  if (!regionCode) return [];

  try {
    const response = await axios.get(`${PSGC_BASE_URL}/regions/${regionCode}/cities-municipalities/`);
    return Array.isArray(response.data) ? response.data : [];
  } catch {
    return [];
  }
};

export const searchPhotosByLocation = async (locationName: string) => {
  const trimmedLocation = locationName?.trim();
  if (!trimmedLocation) return [];

  const query = `${trimmedLocation} tourist spot`;
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=12`;

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: PEXELS_API_KEY,
      },
    });

    const photos = Array.isArray(response.data?.photos) ? response.data.photos : [];

    return photos.map((photo: any) => ({
      id: Number(photo.id),
      imageUrl: photo.src?.large2x ?? photo.src?.large ?? photo.src?.medium ?? '',
      photographer: photo.photographer ?? 'Unknown photographer',
      photographerUrl: photo.photographer_url ?? 'https://www.pexels.com',
      altText: photo.alt ?? `${trimmedLocation} tourist spot`,
    }));
  } catch {
    return [];
  }
};
