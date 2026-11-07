import axios from 'axios';

const PSGC_BASE_URL = 'https://psgc.gitlab.io/api';

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

export const getRegions = async () => {
  try {
    const { data } = await axios.get(`${PSGC_BASE_URL}/regions/`);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Failed to load PSGC regions', error);
    return [];
  }
};

export const getCitiesMunicipalitiesByRegion = async (regionCode: string) => {
  if (!regionCode) return [];

  try {
    const { data } = await axios.get(`${PSGC_BASE_URL}/regions/${regionCode}/cities-municipalities/`);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Failed to load cities or municipalities', error);
    return [];
  }
};

export const searchPhotosByLocation = async (locationName: string) => {
  const queryName = locationName?.trim();
  if (!queryName) return [];

  const keyword = `${queryName} tourist spot`;
  const encodedKeyword = encodeURIComponent(keyword);

  try {
    const { data } = await axios.get('https://api.pexels.com/v1/search', {
      params: {
        query: encodedKeyword,
        per_page: 12,
      },
      headers: {
        Authorization: PEXELS_API_KEY ?? '',
      },
    });

    const photos = Array.isArray(data?.photos) ? data.photos : [];

    return photos.map((photo: any) => ({
      id: photo.id,
      imageUrl: photo.src?.large ?? photo.src?.original ?? '',
      photographer: photo.photographer ?? 'Unknown photographer',
      photographerUrl: photo.photographer_url ?? 'https://www.pexels.com',
      altText: photo.alt ?? `${queryName} tourist spot`,
    }));
  } catch (error) {
    console.error('Failed to search photos', error);
    return [];
  }
};
