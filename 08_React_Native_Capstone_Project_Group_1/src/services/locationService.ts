import axios from 'axios';
import {
  getAllCitiesMunicipalities,
  getRegions,
  type City,
} from '@/services/geoPhotoService';

// "Near me": reads the phone's location, finds the town name for it with BigDataCloud's free
// reverse-geocoding service (no key), then matches that name to a PSGC city or municipality.
export type NearMeResult =
  | { status: 'ok'; city: City; regionName: string }
  | { status: 'denied' | 'unavailable' | 'nomatch' };

// "City of Baguio" / "Baguio City" -> "baguio" (also without accents)
const simplify = (name: string) =>
  name
    .toLowerCase()
    .replace(/\(.*?\)/g, ' ')
    .replace(/^(city of|municipality of)\s+/, '')
    .replace(/\s+city$/, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

export const findMyCity = async (): Promise<NearMeResult> => {
  try {
    // Loaded only when "Near me" is pressed
    const Location: any = await import('expo-location');
    const permission = await Location.requestForegroundPermissionsAsync();
    if (permission.status !== 'granted') return { status: 'denied' };

    const position = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = position.coords;

    const response = await axios.get('https://api.bigdatacloud.net/data/reverse-geocode-client', {
      params: { latitude, longitude, localityLanguage: 'en' },
    });
    const data = response.data ?? {};

    // Names to try, the most specific first
    const administrative: any[] = [...(data.localityInfo?.administrative ?? [])].sort(
      (a, b) => (b.adminLevel ?? 0) - (a.adminLevel ?? 0),
    );
    const candidates: string[] = [data.city, data.locality, ...administrative.map((a) => a.name)]
      .filter(Boolean)
      .map(simplify);

    const [cities, regions] = await Promise.all([getAllCitiesMunicipalities(), getRegions()]);
    for (const candidate of candidates) {
      const city = cities.find((c) => simplify(c.name) === candidate);
      if (city) {
        const regionName = regions.find((r) => r.code === city.regionCode)?.regionName ?? '';
        return { status: 'ok', city, regionName };
      }
    }
    return { status: 'nomatch' };
  } catch {
    return { status: 'unavailable' };
  }
};