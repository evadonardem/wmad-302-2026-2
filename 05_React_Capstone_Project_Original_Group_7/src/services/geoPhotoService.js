import axios from 'axios';

const PSGC_BASE_URL = 'https://psgc.gitlab.io/api';
const PEXELS_SEARCH_URL = 'https://api.pexels.com/v1/search';

const PEXELS_API_KEY = import.meta.env.VITE_PEXELS_API_KEY;


const FEATURED_QUERIES = ['Philippines tourist spot', 'Philippines beach', 'Philippines'];

export const getRegions = async () => {
  try {
    const response = await axios.get(`${PSGC_BASE_URL}/regions/`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch regions:', error);
    return [];
  }
};

export const getCitiesMunicipalitiesByRegion = async (regionCode) => {
  if (!regionCode) return [];

  try {
    const response = await axios.get(
      `${PSGC_BASE_URL}/regions/${regionCode}/cities-municipalities/`
    );
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch cities/municipalities for region ${regionCode}:`, error);
    return [];
  }
};

const mapPhoto = (photo, location) => ({
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


const searchFirstMatch = async (queries, location) => {
  for (const query of queries) {
    const response = await axios.get(PEXELS_SEARCH_URL, {
      params: { query, per_page: 12 },
      headers: { Authorization: PEXELS_API_KEY },
    });

    if (response.data.photos.length > 0) {
      return response.data.photos.map((photo) => mapPhoto(photo, location));
    }
  }
  return [];
};

export const getFeaturedPhotos = async () => {
  try {
    return await searchFirstMatch(FEATURED_QUERIES, 'Philippines');
  } catch (error) {
    console.error('Failed to fetch featured photos:', error);
    return [];
  }
};

export const searchPhotosByLocation = async (locationName) => {

  const cleanName = locationName
    .replace(/^City of\s+/i, '')
    .replace(/\s*\(.*?\)\s*/g, '')
    .trim();

  const queries = [`${cleanName} tourist spot`, `${cleanName} Philippines`, cleanName];

  try {
    return await searchFirstMatch(queries, `${cleanName}, Philippines`);
  } catch (error) {
    console.error(`Failed to fetch photos for "${locationName}":`, error);
    return [];
  }
};