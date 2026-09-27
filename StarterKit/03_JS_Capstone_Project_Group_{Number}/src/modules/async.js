/**
 * [ROLE C] Async & Storage Module - Student Starter Template
 */

const STORAGE_KEY = 'ebarangay_offline_applications';

const OFFLINE_PROVINCES_FALLBACK = [
  { code: '0128', name: 'Pampanga' },
  { code: '1339', name: 'Metro Manila' },
];

const OFFLINE_CITIES_FALLBACK = {
  '0128': [{ code: '012803', name: 'Angeles City' }],
};

export async function fetchProvinces() {
  try {
    const response = await fetch('https://psgc.gitlab.io/api/provinces.json');
    if (!response.ok) throw new Error('Failed to fetch provinces');
    return await response.json();
  } catch (error) {
    console.warn('Using offline province fallback:', error.message);
    return OFFLINE_PROVINCES_FALLBACK;
  }
}

export async function fetchCitiesMunicipalities(provinceCode) {
  try {
    const response = await fetch(
      `https://psgc.gitlab.io/api/provinces/${provinceCode}/cities-municipalities.json`
    );
    if (!response.ok) throw new Error('Failed to fetch cities/municipalities');
    return await response.json();
  } catch (error) {
    console.warn('Using offline city fallback:', error.message);
    return OFFLINE_CITIES_FALLBACK[provinceCode] || [];
  }
}

export function getOfflineQueue() {
  const raw = localStorage.getItem(STORAGE_KEY);
  try {
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveToOfflineQueue(appData) {
  const queue = getOfflineQueue();
  const entry = { id: crypto.randomUUID(), ...appData, savedAt: new Date().toISOString() };
  queue.push(entry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  return entry;
}

export function removeFromOfflineQueue(id) {
  const queue = getOfflineQueue().filter(item => item.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
}