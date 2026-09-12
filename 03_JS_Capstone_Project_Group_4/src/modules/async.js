const STORAGE_KEY = 'ebarangay_offline_applications';

const OFFLINE_PROVINCES_FALLBACK = [
  { code: '141100000', name: 'Benguet' },
    { code: '133900000', name: 'Metro Manila' }
    ];

    const OFFLINE_CITIES_FALLBACK = {
      '141100000': [
          { code: '141102000', name: 'Baguio City', provinceCode: '141100000' },
              { code: '141103000', name: 'La Trinidad', provinceCode: '141100000' }
                ]
                };

                export async function fetchProvinces() {
                  try {
                      const response = await fetch('https://psgc.gitlab.io/api/provinces.json');
                          if (!response.ok) throw new Error('Failed to fetch provinces');
                              return await response.json();
                                } catch (err) {
                                    console.error('fetchProvinces failed, using offline fallback:', err.message);
                                        return OFFLINE_PROVINCES_FALLBACK;
                                          }
                                          }

                                          export async function fetchCitiesMunicipalities(provinceCode) {
                                            try {
                                                const response = await fetch('https://psgc.gitlab.io/api/cities-municipalities.json');
                                                    if (!response.ok) throw new Error('Failed to fetch cities/municipalities');
                                                        const all = await response.json();
                                                            return all.filter(place => place.provinceCode === provinceCode);
                                                              } catch (err) {
                                                                  console.error('fetchCitiesMunicipalities failed, using offline fallback:', err.message);
                                                                      return OFFLINE_CITIES_FALLBACK[provinceCode] || [];
                                                                        }
                                                                        }

                                                                        export function getOfflineQueue() {
                                                                          try {
                                                                              const raw = localStorage.getItem(STORAGE_KEY);
                                                                                  return raw ? JSON.parse(raw) : [];
                                                                                    } catch (err) {
                                                                                        console.error('getOfflineQueue failed to parse storage:', err.message);
                                                                                            return [];
                                                                                              }
                                                                                              }

                                                                                              export function saveToOfflineQueue(appData) {
                                                                                                const queue = getOfflineQueue();
                                                                                                  queue.push(appData);
                                                                                                    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
                                                                                                    }

                                                                                                    export function removeFromOfflineQueue(id) {
                                                                                                      const queue = getOfflineQueue();
                                                                                                        const updatedQueue = queue.filter(app => app.id !== id);
                                                                                                          localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedQueue));
                                                                                                          }
                                                                                                          