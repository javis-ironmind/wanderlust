// T025: Weather Integration using Open-Meteo API (free, no API key)
import { Location } from './types';

export interface DailyWeather {
  date: string;
  temperatureMax: number;
  temperatureMin: number;
  precipitationProbability: number;
  weatherCode: number;
}

export interface WeatherData {
  daily: DailyWeather[];
  fetchedAt: string;
}

// Weather code to icon/description mapping
export const weatherCodeMap: Record<number, { icon: string; description: string }> = {
  0: { icon: '☀️', description: 'Clear sky' },
  1: { icon: '🌤️', description: 'Mainly clear' },
  2: { icon: '⛅', description: 'Partly cloudy' },
  3: { icon: '☁️', description: 'Overcast' },
  45: { icon: '🌫️', description: 'Foggy' },
  48: { icon: '🌫️', description: 'Depositing rime fog' },
  51: { icon: '🌧️', description: 'Light drizzle' },
  53: { icon: '🌧️', description: 'Moderate drizzle' },
  55: { icon: '🌧️', description: 'Dense drizzle' },
  61: { icon: '🌧️', description: 'Slight rain' },
  63: { icon: '🌧️', description: 'Moderate rain' },
  65: { icon: '🌧️', description: 'Heavy rain' },
  71: { icon: '❄️', description: 'Slight snow' },
  73: { icon: '❄️', description: 'Moderate snow' },
  75: { icon: '❄️', description: 'Heavy snow' },
  77: { icon: '🌨️', description: 'Snow grains' },
  80: { icon: '🌦️', description: 'Slight rain showers' },
  81: { icon: '🌦️', description: 'Moderate rain showers' },
  82: { icon: '🌦️', description: 'Violent rain showers' },
  85: { icon: '🌨️', description: 'Slight snow showers' },
  86: { icon: '🌨️', description: 'Heavy snow showers' },
  95: { icon: '⛈️', description: 'Thunderstorm' },
  96: { icon: '⛈️', description: 'Thunderstorm with slight hail' },
  99: { icon: '⛈️', description: 'Thunderstorm with heavy hail' },
};

// Get weather icon for code
export function getWeatherIcon(code: number): string {
  return weatherCodeMap[code]?.icon || '❓';
}

// Get weather description for code
export function getWeatherDescription(code: number): string {
  return weatherCodeMap[code]?.description || 'Unknown';
}

// Convert WeatherData to widget format
export interface WidgetWeather {
  date: string;
  tempMax: number;
  tempMin: number;
  precipitationChance: number;
  weatherCode: number;
}

export function getWeatherForDate(weatherData: WeatherData, date: string): WidgetWeather | null {
  const dayWeather = weatherData.daily.find(d => d.date === date);
  if (!dayWeather) return null;
  
  return {
    date: dayWeather.date,
    tempMax: dayWeather.temperatureMax,
    tempMin: dayWeather.temperatureMin,
    precipitationChance: dayWeather.precipitationProbability,
    weatherCode: dayWeather.weatherCode,
  };
}

// Cache key for localStorage
function getCacheKey(location: Location, startDate: string, endDate: string): string {
  return `weather_${location.latitude}_${location.longitude}_${startDate}_${endDate}`;
}

// Get cached weather data
export function getCachedWeather(location: Location, startDate: string, endDate: string): WeatherData | null {
  if (!location.latitude || !location.longitude) return null;
  
  const cacheKey = getCacheKey(location, startDate, endDate);
  const cached = localStorage.getItem(cacheKey);
  
  if (!cached) return null;
  
  try {
    const data = JSON.parse(cached) as WeatherData;
    const fetchedAt = new Date(data.fetchedAt);
    const now = new Date();
    const hoursSinceFetch = (now.getTime() - fetchedAt.getTime()) / (1000 * 60 * 60);
    
    // Cache valid for 6 hours
    if (hoursSinceFetch < 6) {
      return data;
    }
  } catch {
    return null;
  }
  
  return null;
}

// Cache weather data
function cacheWeather(location: Location, startDate: string, endDate: string, data: WeatherData): void {
  const cacheKey = getCacheKey(location, startDate, endDate);
  localStorage.setItem(cacheKey, JSON.stringify(data));
}

// Fetch weather data from Open-Meteo API
export async function fetchWeather(
  locationOrLat: Location | number, 
  lngOrStartDate?: string | number, 
  startDateOrEndDate?: string, 
  endDateParam?: string
): Promise<WeatherData> {
  let latitude: number;
  let longitude: number;
  let startDate: string;
  let endDate: string;

  // Handle both signatures:
  // 1) fetchWeather(location, startDate, endDate) - using Location object
  // 2) fetchWeather(lat, lng, startDate, endDate) - using separate params
  if (typeof locationOrLat === 'number') {
    // Signature 2: (lat, lng, startDate, endDate)
    latitude = locationOrLat;
    longitude = lngOrStartDate as number;
    startDate = startDateOrEndDate as string;
    endDate = endDateParam as string;
  } else {
    // Signature 1: (location, startDate, endDate)
    const location = locationOrLat;
    if (!location.latitude || !location.longitude) {
      throw new Error('Location coordinates required for weather');
    }
    latitude = location.latitude;
    longitude = location.longitude;
    startDate = lngOrStartDate as string;
    endDate = startDateOrEndDate as string;
    
    // Check cache first (only for Location signature with full object)
    if (location.id && location.name) {
      const cached = getCachedWeather(location, startDate, endDate);
      if (cached) {
        return cached;
      }
      
      // Fetch and cache
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weathercode&start_date=${startDate}&end_date=${endDate}&timezone=auto`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }
      
      const json = await response.json();
      
      const daily: DailyWeather[] = json.daily.time.map((date: string, i: number) => ({
        date,
        temperatureMax: Math.round(json.daily.temperature_2m_max[i]),
        temperatureMin: Math.round(json.daily.temperature_2m_min[i]),
        precipitationProbability: json.daily.precipitation_probability_max[i],
        weatherCode: json.daily.weathercode[i],
      }));
      
      const weatherData: WeatherData = {
        daily,
        fetchedAt: new Date().toISOString(),
      };
      
      // Cache the result
      cacheWeather(location, startDate, endDate, weatherData);
      return weatherData;
    }
  }
  
  // For numeric signature or incomplete Location, fetch without caching
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weathercode&start_date=${startDate}&end_date=${endDate}&timezone=auto`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Weather API error: ${response.status}`);
  }
  
  const json = await response.json();
  
  const daily: DailyWeather[] = json.daily.time.map((date: string, i: number) => ({
    date,
    temperatureMax: Math.round(json.daily.temperature_2m_max[i]),
    temperatureMin: Math.round(json.daily.temperature_2m_min[i]),
    precipitationProbability: json.daily.precipitation_probability_max[i],
    weatherCode: json.daily.weathercode[i],
  }));
  
  const weatherData: WeatherData = {
    daily,
    fetchedAt: new Date().toISOString(),
  };
  
  return weatherData;
}

// Geocode a location string to coordinates using Nominatim
export async function geocodeLocation(locationName: string): Promise<Location | null> {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationName)}&limit=1`;
  
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Wanderlust Trip Planner',
    },
  });
  
  if (!response.ok) {
    return null;
  }
  
  const results = await response.json();
  
  if (results.length === 0) {
    return null;
  }
  
  const result = results[0];
  
  return {
    id: result.place_id,
    name: result.display_name.split(',')[0],
    address: result.display_name,
    latitude: parseFloat(result.lat),
    longitude: parseFloat(result.lon),
    placeId: result.place_id,
  };
}
