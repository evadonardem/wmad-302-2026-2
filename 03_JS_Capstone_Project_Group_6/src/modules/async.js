/**
 * [ROLE C] Async & Storage Module - Student Starter Template
 */

let cachedProvinces = [];
export async function fetchProvinces() {
  // TODO: Fetch provinces from https://psgc.gitlab.io/api/provinces.json
  // Include offline fallback array.
  try{
    const response = await fetch('https://psgc.gitlab.io/api/provinces.json');

    if (!response.ok){
      throw new Error (`API responded with ${response.status}`);
    }

    const data = await response.json();
    cachedProvinces = data;
    return data;

  } catch (error){
    console.warn("fetchProvinces: using cached data", error.message);
    return cachedProvinces;
  }
}

let cachedCitiesMunicipalities ={};
export async function fetchCitiesMunicipalities(provinceCode) {
  // TODO: Fetch cities/municipalities for the given province code from PSGC API with offline fallback.
  try{
    const response = await fetch(`https://psgc.gitlab.io/api/provinces/${provinceCode}/cities-municipalities.json`);

    if(!response.ok){
      throw new Error(`API responded with ${response.status}`);
    }

    const data = await response.json();
    cachedCitiesMunicipalities[provinceCode] = data;
    return data;

  } catch (error){
    console.warn("fetchCitiesMunicipalities: using cached data", error.message);
    return cachedCitiesMunicipalities[provinceCode] || [];
  }
}

export function getOfflineQueue() {
  // TODO: Retrieve stored applications from localStorage key 'ebarangay_offline_applications'
  const offlineApplications = localStorage.getItem('ebarangay_offline_applications');
  
  if (offlineApplications) {
    try {
      return JSON.parse(offlineApplications);
    } catch (error) {
      console.error("Error parsing offline applications from localStorage:", error);
      return [];
    }
  }

  return [];
}

export function saveToOfflineQueue(appData) {
  // TODO: Save application object to localStorage queue
  const currentQueue = getOfflineQueue();
  currentQueue.push(appData);
  localStorage.setItem('ebarangay_offline_applications', JSON.stringify(currentQueue));
}
  

export function removeFromOfflineQueue(id) {
  // TODO: Remove application from localStorage queue by id
  const currentQueue = getOfflineQueue();
  const updatedQueue = currentQueue.filter(app => app.id !== id);
  localStorage.setItem('ebarangay_offline_applications', JSON.stringify(updatedQueue));
}