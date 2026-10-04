import axios from 'axios';

// Fixed PSGC Gitlab API trailing-slash structure format
const PSGC_BASE_URL = 'https://psgc.gitlab.io/api';
const PEXELS_SEARCH_URL = 'https://api.pexels.com/v1/search';

// Vite exposes environment variables on the import.meta.env object
const PEXELS_API_KEY = import.meta.env.VITE_PEXELS_API_KEY;

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

export const searchPhotosByLocation = async (locationName) => {
  // "City of Baguio" -> "Baguio"
  const cleanName = locationName
    .replace(/^City of\s+/i, '')
    .replace(/\s*\(.*?\)\s*/g, '')
    .trim();

  // Try the most specific query first, then simpler ones
  const queries = [`${cleanName} tourist spot`, `${cleanName} Philippines`, cleanName];

  try {
    for (const query of queries) {
      const response = await axios.get(PEXELS_SEARCH_URL, {
        params: { query, per_page: 12 },
        headers: { Authorization: PEXELS_API_KEY },
      });

      if (response.data.photos.length > 0) {
        return response.data.photos.map((photo) => ({
          id: photo.id,
          imageUrl: photo.src.large,
          photographer: photo.photographer,
          photographerUrl: photo.photographer_url,
          altText: photo.alt || `${cleanName} photo by ${photo.photographer}`,
        }));
      }
    }
    return [];
  } catch (error) {
    console.error(`Failed to fetch photos for "${locationName}":`, error);
    return [];
  }
};