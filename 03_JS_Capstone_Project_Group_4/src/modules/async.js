/**
 * [ROLE C] Async & Storage Module - Fixed Implementation
 */

// Key required by the Definition of Done
const OFFLINE_STORAGE_KEY = 'ebarangay_offline_applications';

// Fallback data formatted with standard property keys
const MOCK_PROVINCES = [
  { code: '012800000', name: 'Ilocos Norte' },
  { code: '012900000', name: 'Ilocos Sur' },
  { code: '013300000', name: 'La Union' },
  { code: '015500000', name: 'Pangasinan' }
];

const MOCK_CITIES_MUNICIPALITIES = {
  '012800000': [
    { code: '012801000', name: 'Adams' },
    { code: '012802000', name: 'Bacarra' },
    { code: '012805000', name: 'Laoag City' }
  ]
};

/**
 * Fetches all provinces from the PSGC API with offline fallback.
 * @returns {Promise<Array<{code: string, name: string}>>} Array of province objects
 */
export async function fetchProvinces() {
  // If browser is offline, skip network delay and return mock data immediately
  if (!navigator.onLine) {
    return MOCK_PROVINCES;
  }

  try {
    const response = await fetch('https://psgc.gitlab.io/api/provinces.json', {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    // Map response to ensure uniform { code, name } structure for UI components
    if (Array.isArray(data) && data.length > 0) {
      return data.map((item) => ({
        code: item.code || item.psgcCode || '',
        name: item.name || item.provinceName || 'Unknown Province'
      }));
    }

    return MOCK_PROVINCES;
  } catch (error) {
    console.warn('Network or CORS error when fetching provinces. Using fallback data:', error);
    return MOCK_PROVINCES;
  }
}

/**
 * Fetches cities/municipalities for a given province code with offline fallback.
 * @param {string} provinceCode - The code of the selected province
 * @returns {Promise<Array<{code: string, name: string}>>} Array of city/municipality objects
 */
export async function fetchCitiesMunicipalities(provinceCode) {
  if (!provinceCode) return [];

  if (!navigator.onLine) {
    return MOCK_CITIES_MUNICIPALITIES[provinceCode] || [];
  }

  try {
    const url = `https://psgc.gitlab.io/api/provinces/${provinceCode}/cities-municipalities.json`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    if (Array.isArray(data) && data.length > 0) {
      return data.map((item) => ({
        code: item.code || item.psgcCode || '',
        name: item.name || item.cityName || item.municipalityName || 'Unknown Municipality'
      }));
    }

    return MOCK_CITIES_MUNICIPALITIES[provinceCode] || [];
  } catch (error) {
    console.warn(`Network error fetching cities for code ${provinceCode}. Using fallback data:`, error);
    return MOCK_CITIES_MUNICIPALITIES[provinceCode] || [];
  }
}

/**
 * Retrieves stored applications from localStorage.
 * @returns {Array} List of stored application objects
 */
export function getOfflineQueue() {
  try {
    const data = localStorage.getItem(OFFLINE_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return [];
  }
}

/**
 * Saves application data into localStorage.
 * @param {Object} appData - Application payload
 */
export function saveToOfflineQueue(appData) {
  try {
    const currentQueue = getOfflineQueue();
    const newItem = { id: Date.now().toString(), ...appData };
    const updatedQueue = [...currentQueue, newItem];

    localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(updatedQueue));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

/**
 * Removes an application from localStorage by ID.
 * @param {string|number} id - Application identifier
 */
export function removeFromOfflineQueue(id) {
  try {
    const currentQueue = getOfflineQueue();
    const updatedQueue = currentQueue.filter((item) => String(item.id) !== String(id));

    localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(updatedQueue));
  } catch (error) {
    console.error('Error removing item from localStorage:', error);
  }
}
