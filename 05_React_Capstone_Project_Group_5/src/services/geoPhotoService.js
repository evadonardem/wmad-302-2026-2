import axios from 'axios';

const PSGC_BASE_URL = 'https://psgc.gitlab.io/api/';

// Vite exposes environment variables on the import.meta.env object
const PEXELS_API_KEY = import.meta.env.VITE_PEXELS_API_KEY;

export const getRegions = async () => {
  try {
    const { data } = await axios.get(`${PSGC_BASE_URL}regions/`);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Unable to load regions:', error);
    return [];
  }
};

export const getCitiesMunicipalitiesByRegion = async (regionCode) => {
  if (!regionCode) return [];

  try {
    const { data } = await axios.get(
      `${PSGC_BASE_URL}regions/${encodeURIComponent(regionCode)}/cities-municipalities/`
    );
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Unable to load cities and municipalities:', error);
    return [];
  }
};

export const searchPhotosByLocation = async (locationName, locationContext) => {
  if (!locationName?.trim() || !PEXELS_API_KEY) {
    if (!PEXELS_API_KEY) {
      console.error('Missing VITE_PEXELS_API_KEY. Add it to .env.local and restart Vite.');
    }
    return [];
  }

  try {
    const query = [
      locationName.trim(),
      locationContext?.trim(),
      locationContext ? 'Philippines' : null,
      'tourist spot',
    ]
      .filter(Boolean)
      .join(' ');

    const { data } = await axios.get('https://api.pexels.com/v1/search', {
      params: {
        query,
        per_page: 12,
      },
      headers: {
        Authorization: PEXELS_API_KEY,
      },
    });

    return (Array.isArray(data.photos) ? data.photos : []).map((photo) => ({
      id: photo.id,
      imageUrl: photo.src?.large,
      photographer: photo.photographer,
      photographerUrl: photo.photographer_url,
      altText: photo.alt || `${locationName} tourist spot`,
    }));
  } catch (error) {
    console.error('Unable to search Pexels photos:', error);
    return [];
  }
};
