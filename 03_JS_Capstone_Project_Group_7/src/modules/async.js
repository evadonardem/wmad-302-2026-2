/**
 * [ROLE C] Async & Storage Module - Student Starter Template
 */
const OFFLINE_KEY = "ebarangay_offline_applications";


// Mock data for offline use
const mockProvinces = [
  {
    code: "010280000",
    name: "Ilocos Norte"
  },
  {
    code: "020090000",
    name: "Cagayan"
  },
  {
    code: "030490000",
    name: "Nueva Ecija"
  },
  {
    code: "140010000",
    name: "Abra"
  }
];

export async function fetchProvinces() {
  // TODO: Fetch provinces from https://psgc.gitlab.io/api/provinces.json
  // Include offline fallback array.
  try {
    const response = await fetch(
      "https://psgc.gitlab.io/api/provinces.json"
    );

    if (!response.ok) {
      throw new Error("Failed to load provinces");
    }

    return await response.json();

  } catch (error) {
    console.log("Using offline province data.");

    return mockProvinces;
  }
}

export async function fetchCitiesMunicipalities(provinceCode) {
  // TODO: Fetch cities/municipalities for the given province code from PSGC API with offline fallback.
    try {
    const response = await fetch(
      `https://psgc.gitlab.io/api/provinces/${provinceCode}/cities-municipalities.json`
    );

    if (!response.ok) {
      throw new Error("Failed to load cities");
    }

    return await response.json();

  } catch (error) {
    console.log("Unable to load cities and municipalities.");

    return [];
  }
}

export function getOfflineQueue() {
  // TODO: Retrieve stored applications from localStorage key 'ebarangay_offline_applications'
    const savedData = localStorage.getItem(OFFLINE_KEY);

  if (!savedData) {
    return [];
  }

  try {
    return JSON.parse(savedData);
  } catch (error) {
    return [];
  }
}

export function saveToOfflineQueue(appData) {
  // TODO: Save application object to localStorage 
  const queue = getOfflineQueue();

  queue.push(appData);

  localStorage.setItem(
    OFFLINE_KEY,
    JSON.stringify(queue)
  );
}

export function removeFromOfflineQueue(id) {
  // TODO: Remove application from localStorage queue by 
    const queue = getOfflineQueue();

  const updatedQueue = queue.filter((item) => item.id !== id);

  localStorage.setItem(
    OFFLINE_KEY,
    JSON.stringify(updatedQueue)
  );
}