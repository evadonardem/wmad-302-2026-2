/**
 * [ROLE C] Async & Storage Module - Student Starter Template
 */

const STORAGE_KEY = 'ebarangay_offline_applications';

const offlineProvinceData = [
  { code: '130000000', name: 'Metro Manila' },
  { code: '040000000', name: 'Cagayan Valley' },
  { code: '060000000', name: 'Central Luzon' },
  { code: '010000000', name: 'Ilocos Region' },
  { code: '070000000', name: 'CALABARZON' },
  { code: '080000000', name: 'MIMAROPA' },
  { code: '100000000', name: 'Davao Region' },
  { code: '170000000', name: 'Central Visayas' }
];

const offlineCityData = {
  '130000000': [
    { code: '130100000', name: 'City of Manila' },
    { code: '130200000', name: 'Quezon City' },
    { code: '130300000', name: 'Makati City' }
  ],
  '060000000': [
    { code: '060100000', name: 'San Fernando' },
    { code: '060200000', name: 'Angeles City' },
    { code: '060300000', name: 'Tarlac City' }
  ],
  '100000000': [
    { code: '100100000', name: 'Davao City' },
    { code: '100200000', name: 'Tagum City' },
    { code: '100300000', name: 'Samal' }
  ]
};

export async function fetchProvinces() {
  try {
    const response = await fetch('https://psgc.gitlab.io/api/provinces.json');

    if (!response.ok) {
      throw new Error('Province request failed');
    }

    const data = await response.json();
    const list = Array.isArray(data) ? data : [];

    return list
      .map((province) => ({
        code: province.code ?? province.provinceCode ?? province.id,
        name: province.name ?? province.provinceName ?? 'Unknown Province'
      }))
      .filter((province) => province.code && province.name)
      .sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    return offlineProvinceData.sort((a, b) => a.name.localeCompare(b.name));
  }
}

export async function fetchCitiesMunicipalities(provinceCode) {
  const normalizedCode = String(provinceCode ?? '');

  try {
    const response = await fetch('https://psgc.gitlab.io/api/cities-municipalities.json');

    if (!response.ok) {
      throw new Error('Cities request failed');
    }

    const data = await response.json();
    const list = Array.isArray(data) ? data : [];

    return list
      .filter((city) => {
        const cityProvinceCode = city.province_code ?? city.provinceCode ?? city.province?.code ?? '';
        return String(cityProvinceCode) === normalizedCode;
      })
      .map((city) => ({
        code: city.code ?? city.cityCode ?? city.id,
        name: city.name ?? city.cityName ?? 'Unknown City'
      }))
      .filter((city) => city.code && city.name)
      .sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    return (offlineCityData[normalizedCode] ?? []).sort((a, b) => a.name.localeCompare(b.name));
  }
}

export function getOfflineQueue() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    return [];
  }
}

export function saveToOfflineQueue(appData) {
  const queue = getOfflineQueue();
  const existing = appData && typeof appData === 'object' ? { ...appData } : {};
  const nextId = existing.id ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const currentIndex = queue.findIndex((item) => String(item.id) === String(nextId));
  const record = { ...existing, id: nextId };

  if (currentIndex >= 0) {
    queue[currentIndex] = record;
  } else {
    queue.push(record);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  return queue;
}

export function removeFromOfflineQueue(id) {
  const queue = getOfflineQueue().filter((item) => String(item.id) !== String(id));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  return queue;
}