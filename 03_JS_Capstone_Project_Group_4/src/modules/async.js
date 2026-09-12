/**
 * [ROLE C] Async & Storage Module - Student Starter Template
 */

export async function fetchProvinces() {
  // TODO: Fetch provinces from https://psgc.gitlab.io/api/provinces.json
  // Include offline fallback array.
  try {
    const response = await fetch('https://psgc.gitlab.io/api/provinces.json');
    if (!response.ok) throw new Error('Failed to fetch provinces');
    return await response.json();
  } catch (error) {
    return [
      { code: '012800000', name: 'Ilocos Norte' },
      { code: '012900000', name: 'Ilocos Sur' },
      { code: '013300000', name: 'La Union' },
      { code: '015500000', name: 'Pangasinan' }
    ];
  }
}

export async function fetchCitiesMunicipalities(provinceCode) {
  // TODO: Fetch cities/municipalities for the given province code from PSGC API with offline fallback.
  if (!provinceCode) return [];
  
  try {
    const response = await fetch(`https://psgc.gitlab.io/api/provinces/${provinceCode}/cities-municipalities.json`);
    if (!response.ok) throw new Error('Failed to fetch cities/municipalities');
    return await response.json();
  } catch (error) {
    const mockCascadingLookup = {
      '012800000': [
        { code: '012801000', name: 'Adams' },
        { code: '012802000', name: 'Bacarra' },
        { code: '012805000', name: 'Laoag City' }
      ]
    };
    return mockCascadingLookup[provinceCode] || [];
  }
}

export function getOfflineQueue() {
  // TODO: Retrieve stored applications from localStorage key 'ebarangay_offline_applications'
  const queueData = localStorage.getItem('ebarangay_offline_applications');
  return queueData ? JSON.parse(queueData) : [];
}

export function saveToOfflineQueue(appData) {
  // TODO: Save application object to localStorage queue
  const queue = getOfflineQueue();
  queue.push(appData);
  localStorage.setItem('ebarangay_offline_applications', JSON.stringify(queue));
}

export function removeFromOfflineQueue(id) {
  // TODO: Remove application from localStorage queue by id
  const queue = getOfflineQueue();
  const updatedQueue = queue.filter(app => app.id !== id);
  localStorage.setItem('ebarangay_offline_applications', JSON.stringify(updatedQueue));
}
