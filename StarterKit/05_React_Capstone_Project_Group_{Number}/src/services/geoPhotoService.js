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

export const searchPhotosByLocation = async (locationName, regionName = '') => {
  if (!locationName) return [];

  // "City of Vigan" / "Laoag City" -> "Vigan" / "Laoag"
  const cleanName = locationName
    .replace(/^City of\s+/i, '')
    .replace(/\s+City$/i, '')
    .trim();

  try {
    const { data } = await axios.get('https://api.pexels.com/v1/search', {
      headers: { Authorization: PEXELS_API_KEY },
      params: { query: `${cleanName} ${regionName} Philippines`, per_page: 40 },
    });

    const nameLower = cleanName.toLowerCase();

    return (data.photos ?? [])
      .filter((p) => (p.alt || '').toLowerCase().includes(nameLower))
      .slice(0, 12)
      .map((p) => ({
        id: p.id,
        imageUrl: p.src.large,
        photographer: p.photographer,
        photographerUrl: p.photographer_url,
        altText: p.alt || `${cleanName} tourist spot`,
      }));
  } catch (error) {
    console.error('Pexels search failed:', error);
    return [];
  }
};