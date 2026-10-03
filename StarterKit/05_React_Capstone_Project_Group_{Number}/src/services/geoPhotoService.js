import axios from 'axios';


const PSGC_BASE_URL = 'https://psgc.gitlab.io/api';


const PEXELS_API_KEY = import.meta.env.VITE_PEXELS_API_KEY;

export const getRegions = async () => {
  try {
    const { data } = await axios.get(`${PSGC_BASE_URL}/regions/`);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Failed to fetch regions:', error);
    return [];
  }
};

export const getCitiesMunicipalitiesByRegion = async (regionCode) => {
  if (!regionCode) return [];
  try {
    const { data } = await axios.get(
      `${PSGC_BASE_URL}/regions/${regionCode}/cities-municipalities/`
    );
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Failed to fetch cities:', error);
    return [];
  }
};

export const searchPhotosByLocation = async (locationName) => {
  if (!locationName) return [];
  try {
    const { data } = await axios.get('https://api.pexels.com/v1/search?query=...&per_page=12', {
      headers: { Authorization: PEXELS_API_KEY },
      params: { query: `${locationName} tourist spot`, per_page: 12 },
    });
    return (data.photos ?? []).map((p) => ({
      id: p.id,
      imageUrl: p.src.large,
      photographer: p.photographer,
      photographerUrl: p.photographer_url,
      altText: p.alt || `${locationName} tourist spot`,
    }));
  } catch (error) {
    console.error('Pexels search failed:', error);
    return [];
  }
};
