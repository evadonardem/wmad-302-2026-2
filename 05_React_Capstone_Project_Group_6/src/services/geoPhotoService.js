import axios from 'axios';

const PSGC_BASE_URL = 'https://psgc.gitlab.io/api';

// Vite exposes environment variables on the import.meta.env object
const PEXELS_API_KEY = import.meta.env.VITE_PEXELS_API_KEY;

// How many photos each Pexels request returns (also used to detect "is there more?")
export const PHOTOS_PER_PAGE = 12;

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

// Shown when the very first search fails, so the UI still has something to render
const fallbackPhotos = (locationName) => [
  {
    id: 'fallback-1',
    imageUrl:
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect width="100%" height="100%" fill="%230a2a3a"/><text x="50%" y="50%" fill="%239FD8D6" font-size="32" text-anchor="middle">Photo Unavailable</text></svg>',
    photographer: 'Unknown',
    photographerUrl: 'https://www.pexels.com',
    altText: `No photo available for ${locationName}`,
  },
];

// page: 1 for a new search, 2, 3... for "Load more"
export const searchPhotosByLocation = async (locationName, page = 1) => {
  const keyword = `${locationName} Philippines tourist spot`;
  const url =
    `https://api.pexels.com/v1/search?query=${encodeURIComponent(keyword)}` +
    `&per_page=${PHOTOS_PER_PAGE}&page=${page}`;

  try {
    const response = await axios.get(url, {
      headers: { Authorization: PEXELS_API_KEY },
    });

    return response.data.photos.map((photo) => ({
      id: photo.id,
      imageUrl: photo.src.large,
      fullImageUrl: photo.src.large2x || photo.src.large,
      photographer: photo.photographer,
      photographerUrl: photo.photographer_url,
      altText: photo.alt || `${locationName} tourist spot`,
    }));
  } catch (error) {
    console.error(`Failed to fetch photos for ${locationName} (page ${page}):`, error);
    // Only the first page gets the placeholder; a failed "Load more" adds nothing
    return page === 1 ? fallbackPhotos(locationName) : [];
  }
};