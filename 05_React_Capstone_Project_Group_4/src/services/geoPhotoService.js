import axios from 'axios';

const PSGC_BASE_URL = 'https://psgc.gitlab.io/api';

// Vite exposes environment variables on the import.meta.env object
const PEXELS_API_KEY = (import.meta.env.VITE_PEXELS_API_KEY || '').trim();

const FALLBACK_IMAGE_URLS = [
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1200&q=80',
];

const logApiFailure = (label, error) => {
  console.error(label, {
    message: error?.message,
    status: error?.response?.status,
    data: error?.response?.data,
  });
};

const buildFallbackPhotos = (locationName) => {
  const keyword = `${locationName} tourist spot`;

  return FALLBACK_IMAGE_URLS.map((imageUrl, index) => ({
    id: `fallback-${index}-${locationName}`,
    imageUrl,
    photographer: 'Demo scenic photo',
    photographerUrl: 'https://unsplash.com',
    altText: `${keyword} ${index + 1}`,
  }));
};

export const getRegions = async () => {
  try {
    const response = await axios.get(`${PSGC_BASE_URL}/regions/`);
    return response.data;
  } catch (error) {
    logApiFailure('Failed to load PSGC regions', error);
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
    logApiFailure('Failed to load cities/municipalities for region', error);
    return [];
  }
};

export const searchPhotosByLocation = async (locationName) => {
  if (!locationName) return [];

  const keyword = `${locationName} tourist spot`;
  const endpoint = `https://api.pexels.com/v1/search?query=${encodeURIComponent(keyword)}&per_page=12`;

  if (!PEXELS_API_KEY) {
    console.warn('Missing VITE_PEXELS_API_KEY. Showing fallback images instead.');
    return buildFallbackPhotos(locationName);
  }

  try {
    const response = await axios.get(endpoint, {
      headers: { Authorization: PEXELS_API_KEY },
    });

    const photos = response.data.photos || [];

    if (photos.length === 0) {
      console.warn('Pexels returned no results for the provided query. Showing fallback images instead.');
      return buildFallbackPhotos(locationName);
    }

    return photos.map((photo) => ({
      id: photo.id,
      imageUrl: photo.src.large,
      photographer: photo.photographer,
      photographerUrl: photo.photographer_url,
      altText: photo.alt || keyword,
    }));
  } catch (error) {
    logApiFailure('Failed to search Pexels photos', error);
    return buildFallbackPhotos(locationName);
  }
};
