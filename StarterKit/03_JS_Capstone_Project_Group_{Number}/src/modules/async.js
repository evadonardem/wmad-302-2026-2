/**
 * [ROLE C] Async & Storage Module
 */

const STORAGE_KEY = "ebarangay_offline_applications";

const OFFLINE_PROVINCES = [
  {
    code: "141100000",
    name: "Benguet"
  },
  {
    code: "140100000",
    name: "Abra"
  },
  {
    code: "142700000",
    name: "Ifugao"
  },
  {
    code: "143200000",
    name: "Kalinga"
  },
  {
    code: "144400000",
    name: "Mountain Province"
  },
  {
    code: "148100000",
    name: "Apayao"
  }
];

const OFFLINE_CITIES = {
  "141100000": [
    {
      code: "141102000",
      name: "La Trinidad"
    },
    {
      code: "141101000",
      name: "Baguio City"
    }
  ]
};


/* =========================
   FETCH PROVINCES
   ========================= */

export async function fetchProvinces() {
  try {
    const response = await fetch(
      "https://psgc.gitlab.io/api/provinces.json"
    );

    if (!response.ok) {
      throw new Error(
        `Province request failed: ${response.status}`
      );
    }

    const provinces = await response.json();

    return provinces.sort((a, b) =>
      a.name.localeCompare(b.name)
    );

  } catch (error) {
    console.warn(
      "PSGC unavailable. Using offline provinces.",
      error
    );

    return [...OFFLINE_PROVINCES].sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }
}


/* =========================
   FETCH CITIES / MUNICIPALITIES
   ========================= */

export async function fetchCitiesMunicipalities(
  provinceCode
) {
  try {
    const response = await fetch(
      `https://psgc.gitlab.io/api/provinces/${provinceCode}/cities-municipalities.json`
    );

    if (!response.ok) {
      throw new Error(
        `City/Municipality request failed: ${response.status}`
      );
    }

    const cities = await response.json();

    return cities.sort((a, b) =>
      a.name.localeCompare(b.name)
    );

  } catch (error) {
    console.warn(
      "PSGC unavailable. Using offline cities.",
      error
    );

    return [
      ...(OFFLINE_CITIES[provinceCode] || [])
    ].sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }
}


/* =========================
   LOCAL STORAGE
   ========================= */

export function getOfflineQueue() {
  try {
    const stored =
      localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return [];
    }

    return JSON.parse(stored);

  } catch (error) {
    console.error(
      "Unable to read LocalStorage:",
      error
    );

    return [];
  }
}


export function saveToOfflineQueue(appData) {
  const queue =
    getOfflineQueue();

  queue.push(appData);

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(queue)
  );
}


export function removeFromOfflineQueue(id) {
  const queue =
    getOfflineQueue();

  const updatedQueue =
    queue.filter(
      resident => resident.id !== id
    );

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(updatedQueue)
  );
}