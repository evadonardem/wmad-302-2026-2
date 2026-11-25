import axios from 'axios';

const API_BASE_URL = 'https://psgc.gitlab.io/api';

export interface PsgcLocation {
  code: string;
  name: string;
}

async function getLocations(path: string): Promise<PsgcLocation[]> {
  const response = await axios.get<unknown>(`${API_BASE_URL}${path}`, { timeout: 15000 });
  if (
    !Array.isArray(response.data) ||
    !response.data.every((location) =>
      typeof location?.code === 'string' && typeof location?.name === 'string'
    )
  ) {
    throw new Error('The Philippine address service returned invalid location data.');
  }
  return response.data;
}

export const psgcApi = {
  getRegions: () => getLocations('/regions/'),
  getProvinces: (regionCode: string) => getLocations(`/regions/${encodeURIComponent(regionCode)}/provinces/`),
  getCitiesAndMunicipalities: (regionCode: string, provinceCode?: string) =>
    provinceCode
      ? getLocations(`/provinces/${encodeURIComponent(provinceCode)}/cities-municipalities/`)
      : getLocations(`/regions/${encodeURIComponent(regionCode)}/cities-municipalities/`),
  getBarangays: (cityCode: string) =>
    getLocations(`/cities-municipalities/${encodeURIComponent(cityCode)}/barangays/`),
};
