import axios from 'axios';

// Weather from Open-Meteo (free, no key). A place name is first turned into coordinates with
// Open-Meteo's geocoder, then the forecast is loaded. Answers are remembered to keep it fast.
export type Weather = {
  temperature: number;
  humidity: number;
  wind: number;
  code: number; // WMO weather code
  daily: { date: string; max: number; min: number; code: number }[];
};

// "City of Baguio" -> "Baguio"
const cleanName = (name: string) =>
  name
    .replace(/\(.*?\)/g, ' ')
    .replace(/^(City of|Municipality of)\s+/i, '')
    .replace(/\s+City$/i, '')
    .replace(/\s+/g, ' ')
    .trim();

const coordinateCache = new Map<string, { latitude: number; longitude: number } | null>();
const weatherCache = new Map<string, { at: number; data: Weather }>();
const WEATHER_CACHE_MS = 15 * 60 * 1000;

export const getCoordinates = async (
  placeName: string,
): Promise<{ latitude: number; longitude: number } | null> => {
  const name = cleanName(placeName);
  if (!name) return null;
  if (coordinateCache.has(name)) return coordinateCache.get(name) ?? null;
  try {
    const response = await axios.get('https://geocoding-api.open-meteo.com/v1/search', {
      params: { name, count: 5, language: 'en', format: 'json', countryCode: 'PH' },
    });
    const match = (response.data?.results ?? []).find((r: any) => r.country_code === 'PH');
    const coordinates = match ? { latitude: match.latitude, longitude: match.longitude } : null;
    coordinateCache.set(name, coordinates);
    return coordinates;
  } catch {
    return null;
  }
};

export const getWeather = async (latitude: number, longitude: number): Promise<Weather | null> => {
  const key = `${latitude.toFixed(2)},${longitude.toFixed(2)}`;
  const cached = weatherCache.get(key);
  if (cached && Date.now() - cached.at < WEATHER_CACHE_MS) return cached.data;
  try {
    const response = await axios.get('https://api.open-meteo.com/v1/forecast', {
      params: {
        latitude,
        longitude,
        current: 'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m',
        daily: 'weather_code,temperature_2m_max,temperature_2m_min',
        timezone: 'Asia/Manila',
        forecast_days: 4,
      },
    });
    const { current, daily } = response.data;
    const data: Weather = {
      temperature: current.temperature_2m,
      humidity: current.relative_humidity_2m,
      wind: current.wind_speed_10m,
      code: current.weather_code,
      daily: daily.time.map((date: string, i: number) => ({
        date,
        max: daily.temperature_2m_max[i],
        min: daily.temperature_2m_min[i],
        code: daily.weather_code[i],
      })),
    };
    weatherCache.set(key, { at: Date.now(), data });
    return data;
  } catch {
    return null;
  }
};

// Weather for a place name. Returns null when the place or the forecast cannot be found.
export const getWeatherForPlace = async (placeName: string): Promise<Weather | null> => {
  const coordinates = await getCoordinates(placeName);
  if (!coordinates) return null;
  return getWeather(coordinates.latitude, coordinates.longitude);
};