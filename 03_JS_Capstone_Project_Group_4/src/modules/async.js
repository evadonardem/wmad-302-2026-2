/**
 * [ROLE C] Async & Storage Module - Student Starter Template
 */

// Key required by the Definition of Done
const OFFLINE_STORAGE_KEY = 'ebarangay_offline_applications';

// Sample fallback data in case of network errors or offline state
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
 * @returns {Promise<Array>} Array of province objects
 */
export async function fetchProvinces() {
  try {
    const response = await fetch('https://psgc.gitlab.io/api/provinces.json');
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.warn('Network request failed for fetchProvinces. Using offline fallback.', error);
    return MOCK_PROVINCES;
  }
}

/**
 * Fetches cities and municipalities for a given province code with offline fallback.
 * @param {string} provinceCode - The code of the selected province
 * @returns {Promise<Array>} Array of city/municipality objects
 */
export async function fetchCitiesMunicipalities(provinceCode) {
  if (!provinceCode) return [];

  try {
    const url = `https://psgc.gitlab.io/api/provinces/${provinceCode}/cities-municipalities.json`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.warn(`Network request failed for fetchCitiesMunicipalities (${provinceCode}). Using offline fallback.`, error);
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
 * Appends a new application object to the offline queue in localStorage.
 * @param {Object} appData - Application object to store (should include a unique `id`)
 */
export function saveToOfflineQueue(appData) {
  try {
    const currentQueue = getOfflineQueue();
    // Ensure every record has a fallback ID if one isn't provided
    const newItem = { id: Date.now().toString(), ...appData };
    const updatedQueue = [...currentQueue, newItem];
    
    localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(updatedQueue));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

/**
 * Removes an application object from the offline queue by its ID.
 * @param {string|number} id - Unique identifier of the application to remove
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
