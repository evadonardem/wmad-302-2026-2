import axios from 'axios';

const PSGC_BASE_URL = 'https://psgc.gitlab.io/api';

// Vite exposes environment variables on the import.meta.env object
const PEXELS_API_KEY = import.meta.env.VITE_PEXELS_API_KEY;

export const getRegions = async () => {
  try {
    const response = await axios.get(`${PSGC_BASE_URL}/regions/`);
    return response.data;
  } catch {
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
  } catch {
    return [];
  }
};

export const searchPhotosByLocation = async (locationName) => {
  const keyword = `${locationName} tourist spot`;
  const endpoint = `https://api.pexels.com/v1/search?query=${encodeURIComponent(keyword)}&per_page=12`;

  try {
    const response = await axios.get(endpoint, {
      headers: { Authorization: PEXELS_API_KEY },
    });

    return response.data.photos.map((photo) => ({
      id: photo.id,
      imageUrl: photo.src.large,
      photographer: photo.photographer,
      photographerUrl: photo.photographer_url,
      altText: photo.alt || keyword,
    }));
  } catch {
    return [];
  }
};
