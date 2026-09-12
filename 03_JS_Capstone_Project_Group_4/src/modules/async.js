/**
 * [ROLE C] Async & Storage Module - Student Starter Template
 */

const OFFLINE_QUEUE_KEY = 'ebarangay_offline_applications';

// Minimal offline fallbacks (you can expand these as needed)
const OFFLINE_PROVINCES_FALLBACK = [
  { code: '010000000', name: 'Ilocos Norte', regionCode: '010000000' },
  { code: '010200000', name: 'Ilocos Sur', regionCode: '010000000' },
  { code: '130000000', name: 'National Capital Region (NCR)', regionCode: '130000000' },
];

const OFFLINE_CITIES_MUNICIPALITIES_FALLBACK = {
  '010000000': [
    { code: '0100101000', name: 'Laoag City', provinceCode: '010000000' },
    { code: '0100201000', name: 'Batac City', provinceCode: '010000000' },
  ],
  '010200000': [
    { code: '0102010000', name: 'Candon City', provinceCode: '010200000' },
    { code: '0102020000', name: 'Vigan City', provinceCode: '010200000' },
  ],
  '130000000': [
    { code: '1301010000', name: 'Manila', provinceCode: '130000000' },
    { code: '1302010000', name: 'Quezon City', provinceCode: '130000000' },
  ],
};

/**
 * Fetch provinces from PSGC API with offline fallback on network error.
 */
export async function fetchProvinces() {
  try {
    const res = await fetch('https://psgc.gitlab.io/api/provinces.json');
    if (!res.ok) {
      throw new Error(`PSGC provinces request failed: ${res.status}`);
    }
    const data = await res.json();
    // PSGC returns an array; ensure we return an array even if empty
    return Array.isArray(data) ? data : [];
  } catch (err) {
    // Fallback to mock data on network error or parse error
    console.warn('fetchProvinces: using offline fallback due to', err);
    return OFFLINE_PROVINCES_FALLBACK;
  }
}

/**
 * Fetch cities/municipalities for a given province code from PSGC API.
 * Uses cascading lookup: tries API first, then offline fallback.
 */
export async function fetchCitiesMunicipalities(provinceCode) {
  if (!provinceCode) {
    console.warn('fetchCitiesMunicipalities: no provinceCode provided');
    return [];
  }

  try {
    // PSGC pattern: /api/provinces/{provinceCode}/cities-municipalities.json
    const url = `https://psgc.gitlab.io/api/provinces/${provinceCode}/cities-municipalities.json`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`PSGC cities/municipalities request failed: ${res.status}`);
    }
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    // Fallback to offline data
    console.warn(
      'fetchCitiesMunicipalities: using offline fallback due to',
      err
    );
    return OFFLINE_CITIES_MUNICIPALITIES_FALLBACK[provinceCode] || [];
  }
}

/**
 * Retrieve stored applications from localStorage key 'ebarangay_offline_applications'.
 */
export function getOfflineQueue() {
  if (typeof localStorage === 'undefined') {
    console.warn('getOfflineQueue: localStorage not available');
    return [];
  }

  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('getOfflineQueue: failed to parse offline queue', err);
    return [];
  }
}

/**
 * Save application object to localStorage queue.
 * Assumes appData has a unique `id` field.
 */
export function saveToOfflineQueue(appData) {
  if (typeof localStorage === 'undefined') {
    console.warn('saveToOfflineQueue: localStorage not available');
    return;
  }

  try {
    const queue = getOfflineQueue();

    // Avoid duplicates by id if present
    const existingIndex = queue.findIndex(
      (item) => item && item.id === appData.id
    );

    if (existingIndex >= 0) {
      // Update existing entry
      queue[existingIndex] = appData;
    } else {
      // Append new entry
      queue.push(appData);
    }

    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  } catch (err) {
    console.error('saveToOfflineQueue: failed to save to localStorage', err);
  }
}

/**
 * Remove application from localStorage queue by id.
 */
export function removeFromOfflineQueue(id) {
  if (typeof localStorage === 'undefined') {
    console.warn('removeFromOfflineQueue: localStorage not available');
    return;
  }

  try {
    const queue = getOfflineQueue();
    const filtered = queue.filter((item) => !(item && item.id === id));

    // Only write back if something was removed
    if (filtered.length !== queue.length) {
      localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(filtered));
    }
  } catch (err) {
    console.error('removeFromOfflineQueue: failed to remove from localStorage', err);
  }
}
