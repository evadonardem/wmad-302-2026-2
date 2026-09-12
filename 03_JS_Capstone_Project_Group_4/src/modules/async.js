/**
 * [ROLE C] Async & Storage Module
 */

const OFFLINE_STORAGE_KEY = 'ebarangay_offline_applications';

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
 * Fetches all provinces with multi-level endpoint fallback handling.
 */
export async function fetchProvinces() {
  // Primary endpoint required by prompt
  const PRIMARY_URL = 'https://psgc.gitlab.io/api/provinces.json';
  // Secondary modern public API fallback
  const SECONDARY_URL = 'https://psgc.cloud/api/provinces';

  try {
    const res = await fetch(PRIMARY_URL);
    if (res.ok) {
      // Handles cases where psgc.gitlab.io returns text/html content-type
      const text = await res.text();
      return JSON.parse(text);
    }
  } catch (err) {
    console.warn('GitLab PSGC API failed, trying secondary URL...', err);
  }

  try {
    const res = await fetch(SECONDARY_URL);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Secondary PSGC API failed, returning offline mock data...', err);
  }

  return MOCK_PROVINCES;
}

/**
 * Fetches cities/municipalities by province code.
 */
export async function fetchCitiesMunicipalities(provinceCode) {
  if (!provinceCode) return [];

  const PRIMARY_URL = `https://psgc.gitlab.io/api/provinces/${provinceCode}/cities-municipalities.json`;
  const SECONDARY_URL = `https://psgc.cloud/api/provinces/${provinceCode}/cities-municipalities`;

  try {
    const res = await fetch(PRIMARY_URL);
    if (res.ok) {
      const text = await res.text();
      return JSON.parse(text);
    }
  } catch (err) {
    console.warn(`GitLab API failed for province ${provinceCode}, trying secondary...`, err);
  }

  try {
    const res = await fetch(SECONDARY_URL);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn(`Secondary API failed for province ${provinceCode}, using offline fallback...`, err);
  }

  return MOCK_CITIES_MUNICIPALITIES[provinceCode] || [];
}

/**
 * Retrieves stored applications from localStorage.
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
 * Saves application data into localStorage queue.
 */
export function saveToOfflineQueue(appData) {
  try {
    const currentQueue = getOfflineQueue();
    const newItem = { id: appData.id || Date.now().toString(), ...appData };
    const updatedQueue = [...currentQueue, newItem];
    localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(updatedQueue));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

/**
 * Removes application from localStorage queue by ID.
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
