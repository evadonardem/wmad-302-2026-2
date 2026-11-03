import axios from 'axios';

// TODO 1.1 [Base Configuration]: Set the fixed PSGC Gitlab API trailing-slash base URL constant.
// Targeted Value: 'https://psgc.gitlab.io/api'
const PSGC_BASE_URL = 'https://psgc.gitlab.io/api';

// Expo only exposes environment variables prefixed with EXPO_PUBLIC_ (loaded from the .env file).
const PEXELS_API_KEY = process.env.EXPO_PUBLIC_PEXELS_API_KEY;

// Number of photos requested per Pexels page (also used to guess if another page exists).
export const PHOTOS_PER_PAGE = 12;

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

// The same photo in the different sizes Pexels offers (used by the download size option).
export type PhotoSizes = {
  small: string;
  medium: string;
  large: string;
  large2x: string;
  original: string;
};

export type Photo = {
  id: number;
  imageUrl: string;
  photographer: string;
  photographerUrl: string;
  altText: string;
  // Extra fields for the bonus features. They are optional so old saved favorites still load.
  thumbUrl?: string;
  sizes?: PhotoSizes;
  place?: string;
};

// "City of Baguio" -> "Baguio", so searches match the real place name.
const cleanPlaceName = (locationName: string) =>
  locationName
    .replace(/\(.*?\)/g, ' ')
    .replace(/^(City of|Municipality of)\s+/i, '')
    .replace(/\s+/g, ' ')
    .trim();

export const getRegions = async (): Promise<Region[]> => {
  // TODO 1.2 [Regions Retrieval]: Fetch the full array of regions from the PSGC host.
  // Perform an asynchronous GET request using axios targeting `${PSGC_BASE_URL}/regions/`,
  // return the response data array on success, and return an empty array fallback inside the catch safety layer.
  try {
    const response = await axios.get(`${PSGC_BASE_URL}/regions/`);
    return response.data;
  } catch {
    return [];
  }
};

export const getCitiesMunicipalitiesByRegion = async (regionCode: string): Promise<City[]> => {
  // TODO 1.3 [Chained Location Population]: Complete the dynamic lookup using string interpolation.
  // a. Validate that a truthy regionCode parameter is provided before generating a network request (return [] otherwise).
  // b. Execute an async GET request hitting the exact trailing-slash path directory:
  //    `${PSGC_BASE_URL}/regions/{regionCode}/cities-municipalities/`
  // c. Return the response data array, with an empty array fallback inside the catch layer.
  if (!regionCode) {
    return [];
  }
  try {
    const response = await axios.get(
      `${PSGC_BASE_URL}/regions/${regionCode}/cities-municipalities/`,
    );
    return response.data;
  } catch {
    return [];
  }
};

// 'page' and 'topic' are optional extras: page 2, 3... loads more photos, and 'topic' swaps the
// default "tourist spot" for another theme (beach, mountain...). With neither, it behaves as before.
export const searchPhotosByLocation = async (
  locationName: string,
  page: number = 1,
  topic: string = 'tourist spot',
): Promise<Photo[]> => {
  // TODO 1.4 [Pexels Query Resolution]: Build the photo search pipeline.
  // a. Create a combined query keyword string: `${locationName} tourist spot`.
  // b. Query the structural Pexels search endpoint: 'https://pexels.com{keyword}&per_page=12'
  //    (use the keyword from step a, URL-encoded, as the query parameter).
  // c. Inject your authentication token securely using an Authorization header configuration
  //    block reading from the PEXELS_API_KEY constant above.
  // d. Map through the resulting 'photos' array in the payload and return streamlined objects
  //    styled exactly like: { id, imageUrl: [large image src URL], photographer, photographerUrl, altText }
  // e. Provide a backup empty array (or placeholder photo array) inside your catch layer shield
  //    to handle error edge cases gracefully.
  // The keyword is "<place> Philippines <topic>": the clean place name plus "Philippines" keeps
  // photos from showing a same-named place in another country.
  const keyword = `${cleanPlaceName(locationName)} Philippines ${topic}`;
  try {
    const response = await axios.get(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(keyword)}&per_page=${PHOTOS_PER_PAGE}&page=${page}`,
      {
        headers: { Authorization: PEXELS_API_KEY ?? '' },
      },
    );
    return response.data.photos.map((photo: any) => ({
      id: photo.id,
      imageUrl: photo.src.large,
      photographer: photo.photographer,
      photographerUrl: photo.photographer_url,
      altText: photo.alt,
      thumbUrl: photo.src.medium,
      sizes: {
        small: photo.src.small,
        medium: photo.src.medium,
        large: photo.src.large,
        large2x: photo.src.large2x,
        original: photo.src.original,
      },
      place: locationName,
    }));
  } catch {
    return [];
  }
};

// Short description of a place (where it is, a bit of history) from Wikipedia. No API key needed.
export const getPlaceDescription = async (
  locationName: string,
): Promise<{ text: string; url: string } | null> => {
  try {
    const search = await axios.get('https://en.wikipedia.org/w/api.php', {
      params: {
        action: 'query',
        list: 'search',
        srsearch: `${cleanPlaceName(locationName)} Philippines`,
        srlimit: 1,
        format: 'json',
        origin: '*',
      },
    });
    const title: string | undefined = search.data?.query?.search?.[0]?.title;
    if (!title) return null;
    const summary = await axios.get(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/ /g, '_'))}`,
    );
    if (summary.data.type === 'disambiguation' || !summary.data.extract) return null;
    return {
      text: summary.data.extract,
      url: summary.data.content_urls?.desktop?.page ?? '',
    };
  } catch {
    return null;
  }
};