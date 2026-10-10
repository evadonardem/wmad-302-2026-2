import axios from 'axios';

// TODO 1.1 [Base Configuration]: Use the fixed PSGC Gitlab API trailing-slash structure format
const PSGC_BASE_URL = 'https://psgc.gitlab.io/api';

// Vite exposes environment variables on the import.meta.env object
const PEXELS_API_KEY = import.meta.env.VITE_PEXELS_API_KEY;

// Backup structural object array for the catch layer in TODO 1.4(e): same shape as a real photo.
const FALLBACK_IMAGE = `data:image/svg+xml;utf8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect width="800" height="600" fill="#cfd8dc"/><text x="400" y="310" font-family="Arial" font-size="40" text-anchor="middle" fill="#455a64">Photo unavailable</text></svg>'
)}`;
const FALLBACK_PHOTOS = [
  {
    id: 'fallback-1',
    imageUrl: FALLBACK_IMAGE,
    photographer: 'Pexels',
    photographerUrl: 'https://www.pexels.com',
    altText: 'Photos could not be loaded right now. Check your connection or API key and try again.',
  },
];

// Local Benguet photos added by the group (files live in public/images/benguet/).
// 'places' = words that must appear in the searched name (lowercase).
const LOCAL_PHOTOS = [
  { places: ['benguet'], id: 'local-1', imageUrl: '/images/benguet/botanical-garden-pagodas.jpg', photographer: 'Marcos Detourista', photographerUrl: '', altText: 'Pagodas at Baguio Botanical Garden' },
  { places: ['benguet'], id: 'local-2', imageUrl: '/images/benguet/botanical-garden-sign.jpg', photographer: 'Source unknown', photographerUrl: '', altText: 'Baguio Botanical Garden entrance with Igorot dancers' },
  { places: ['benguet'], id: 'local-3', imageUrl: '/images/benguet/botanical-garden-park.jpg', photographer: 'morefunwithjuan.com', photographerUrl: 'https://morefunwithjuan.com', altText: 'Garden pavilions at Baguio Botanical Garden' },
  { places: ['benguet'], id: 'local-4', imageUrl: '/images/benguet/colorful-hillside-houses.jpg', photographer: 'thepinaysolobackpacker.com', photographerUrl: 'https://thepinaysolobackpacker.com', altText: 'Colorful hillside houses in Benguet' },
  { places: ['benguet'], id: 'local-5', imageUrl: '/images/benguet/wright-park-pool.jpg', photographer: 'Source unknown', photographerUrl: '', altText: 'Reflecting pool and the green-roofed Mansion, Baguio City' },
  { places: ['benguet'], id: 'local-6', imageUrl: '/images/benguet/lions-head.jpg', photographer: 'Source unknown', photographerUrl: '', altText: "Lion's Head welcoming visitors to Baguio City" },
  { places: ['benguet'], id: 'local-7', imageUrl: '/images/benguet/mines-view-park.jpg', photographer: 'Angel Juarez (lakwatsero.com)', photographerUrl: 'https://lakwatsero.com', altText: 'Sunrise at Mines View Park, Baguio City' },
  { places: ['benguet'], id: 'local-8', imageUrl: '/images/benguet/atok-flower-farm.jpg', photographer: 'Source unknown', photographerUrl: '', altText: 'Northern Blossom Flower Farm, Atok, Benguet' },
];

const getLocalPhotos = (name) =>
  LOCAL_PHOTOS
    .filter((p) => p.places.some((word) => name.toLowerCase().includes(word)))
    .map(({ places, ...photo }) => photo);

export const getRegions = async () => {
  // TODO 1.2 [Regions Retrieval]: Fetch the full array of regions from the PSGC host.
  // Perform an asynchronous GET request using axios, catch errors smoothly, and return the dataset array.
  // Targeted Path Format: `${PSGC_BASE_URL}/regions/`
  try {
    const { data } = await axios.get(`${PSGC_BASE_URL}/regions/`);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Failed to load regions:', error.message);
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
    const { data } = await axios.get(`${PSGC_BASE_URL}/regions/${regionCode}/cities-municipalities/`);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Failed to load cities/municipalities:', error.message);
    return [];
  }
};

export const getProvincesByRegion = async (regionCode) => {
  // CHANGED: the second dropdown now lists provinces instead of cities/municipalities.
  // Targeted Path Format: `${PSGC_BASE_URL}/regions/{regionCode}/provinces/`
  if (!regionCode) return [];
  try {
    const { data } = await axios.get(`${PSGC_BASE_URL}/regions/${regionCode}/provinces/`);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Failed to load provinces:', error.message);
    return [];
  }
};

// CHANGED: the Region and Province dropdowns now use the group's own list of regions and provinces.
const PH_REGIONS = {
  'Region I – Ilocos Region': ['Ilocos Norte', 'Ilocos Sur', 'La Union', 'Pangasinan'],
  'Region II – Cagayan Valley': ['Batanes', 'Cagayan', 'Isabela', 'Nueva Vizcaya', 'Quirino'],
  'Region III – Central Luzon': ['Aurora', 'Bataan', 'Bulacan', 'Nueva Ecija', 'Pampanga', 'Tarlac', 'Zambales'],
  'Region IV-A – CALABARZON': ['Batangas', 'Cavite', 'Laguna', 'Quezon', 'Rizal'],
  'Region IV-B – MIMAROPA': ['Marinduque', 'Occidental Mindoro', 'Oriental Mindoro', 'Palawan', 'Romblon'],
  'Region V – Bicol Region': ['Albay', 'Camarines Norte', 'Camarines Sur', 'Catanduanes', 'Masbate', 'Sorsogon'],
  'Region VI – Western Visayas': ['Aklan', 'Antique', 'Capiz', 'Guimaras', 'Iloilo'],
  'Region VII – Central Visayas': ['Bohol', 'Cebu', 'Siquijor'],
  'Region VIII – Eastern Visayas': ['Biliran', 'Eastern Samar', 'Leyte', 'Northern Samar', 'Samar', 'Southern Leyte'],
  'Region IX – Zamboanga Peninsula': ['Sulu', 'Zamboanga del Norte', 'Zamboanga del Sur', 'Zamboanga Sibugay'],
  'Region X – Northern Mindanao': ['Bukidnon', 'Camiguin', 'Lanao del Norte', 'Misamis Occidental', 'Misamis Oriental'],
  'Region XI – Davao Region': ['Davao de Oro', 'Davao del Norte', 'Davao del Sur', 'Davao Occidental', 'Davao Oriental'],
  'Region XII – SOCCSKSARGEN': ['Cotabato', 'South Cotabato', 'Sultan Kudarat', 'Sarangani'],
  'Region XIII – Caraga': ['Agusan del Norte', 'Agusan del Sur', 'Dinagat Islands', 'Surigao del Norte', 'Surigao del Sur'],
  'BARMM – Bangsamoro Autonomous Region in Muslim Mindanao': ['Basilan', 'Lanao del Sur', 'Maguindanao del Norte', 'Maguindanao del Sur', 'Sulu', 'Tawi-Tawi'],
  'CAR – Cordillera Administrative Region': ['Abra', 'Apayao', 'Benguet', 'Ifugao', 'Kalinga', 'Mountain Province'],
  'NCR – National Capital Region': ['Metro Manila'],
  'NIR – Negros Island Region': ['Negros Occidental', 'Negros Oriental', 'Siquijor'],
};

export const getLocalRegions = () => Object.keys(PH_REGIONS);

export const getLocalProvincesByRegion = (regionName) => PH_REGIONS[regionName] ?? [];

export const searchPhotosByLocation = async (locationName) => {
  // TODO 1.4 [Pexels Query Resolution]: Formulate the dynamic target endpoint string URL.
  // a. Create a combined query keyword string: "[locationName] tourist spot".
  // b. Query the structural Pexels endpoint path: 'https://pexels.com[keyword]&per_page=12'.
  // c. Ensure you inject your authentication token securely using an authorization header parameter configuration block.
  // d. Map through the resulting array and return streamlined objects styled exactly like: 
  //    { id, imageUrl: [large image src URL], photographer, photographerUrl, altText }
  // e. Provide a backup structural object array inside your catch layer shield to handle error edge cases.
  // ORIGINAL (kept): const localPhotos = getLocalPhotos(locationName);
  const localPhotos = []; // CHANGED: local Benguet photos turned off, only Pexels photos are shown
  try {
    if (!PEXELS_API_KEY) throw new Error('Missing VITE_PEXELS_API_KEY in .env.local');
    // "City of Vigan" -> "Vigan City", so the keyword reads naturally.
    const name = locationName.replace(/^City of (.+)$/i, '$1 City');
    const keyword = `${name} tourist spot`;
    // The real Pexels search route is api.pexels.com/v1/search
    const { data } = await axios.get(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(keyword)}&per_page=12`,
      { headers: { Authorization: PEXELS_API_KEY } }
    );
    const apiPhotos = (data.photos ?? []).map((photo) => ({
      id: photo.id,
      imageUrl: photo.src.large,
      photographer: photo.photographer,
      photographerUrl: photo.photographer_url,
      altText: photo.alt || keyword,
    }));
    return [...localPhotos, ...apiPhotos];
  } catch (error) {
    console.error('Failed to load photos:', error.message);
    return localPhotos.length ? localPhotos : FALLBACK_PHOTOS;
  }
};