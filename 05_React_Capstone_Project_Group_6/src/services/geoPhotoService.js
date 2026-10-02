import axios from 'axios';

// TODO 1.1 [Base Configuration]: Use the fixed PSGC Gitlab API trailing-slash structure format
const PSGC_BASE_URL = 'https://psgc.gitlab.io/api';

// Vite exposes environment variables on the import.meta.env object
const PEXELS_API_KEY = import.meta.env.VITE_PEXELS_API_KEY;

export const getRegions = async () => {
  // TODO 1.2 [Regions Retrieval]: Fetch the full array of regions from the PSGC host.
  // Perform an asynchronous GET request using axios, catch errors smoothly, and return the dataset array.
  // Targeted Path Format: `${PSGC_BASE_URL}/regions/`
  try {
    const response = await axios.get(`${PSGC_BASE_URL}/regions/`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch regions:', error);
    return [];
  }
};

export const getCitiesMunicipalitiesByRegion = async (regionCode) => {
  // TODO 1.3 [Chained Location Population]: Complete the dynamic lookup using string interpolation.
  // Validate that a truthy regionCode parameter is provided prior to generating network requests.
  // Execute an async GET request hitting the exact trailing-slash path directory.
  // Targeted Path Format: `${PSGC_BASE_URL}/regions/{regionCode}/cities-municipalities/`
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
  // TODO 1.4 [Pexels Query Resolution]: Formulate the dynamic target endpoint string URL.
  // a. Create a combined query keyword string: "[locationName] tourist spot".
  // b. Query the structural Pexels endpoint path: 'https://pexels.com[keyword]&per_page=12'.
  // c. Ensure you inject your authentication token securely using an authorization header parameter configuration block.
  // d. Map through the resulting array and return streamlined objects styled exactly like: 
  //    { id, imageUrl: [large image src URL], photographer, photographerUrl, altText }
  // e. Provide a backup structural object array inside your catch layer shield to handle error edge cases.
  const keyword = `${locationName} Philippines tourist spot`;
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(keyword)}&per_page=12`;
 
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

    console.error(`Failed to fetch photos for ${locationName}:`, error);
    // Backup array so the UI still has something to render
    return [
      {
        id: 'fallback-1',
        imageUrl: 'https://via.placeholder.com/800x600?text=Photo+Unavailable',
        photographer: 'Unknown',
        photographerUrl: 'https://www.pexels.com',
        altText: `No photo available for ${locationName}`,
      },
    ];
  }
};
