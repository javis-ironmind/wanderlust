// Weather service using Open-Meteo API (free, no API key)

export interface WeatherData {
  date: string;
  tempMax: number;
  tempMin: number;
  precipitationChance: number;
  weatherCode: number;
}

export interface WeatherCache {
  [locationKey: string]: {
    data: WeatherData[];
    timestamp: number;
  };
}

const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours

// WMO Weather codes to descriptions and icons
export const weatherCodeMap: Record<number, { description: string; icon: string }> = {
  0: { description: 'Clear sky', icon: '☀️' },
  1: { description: 'Mainly clear', icon: '🌤️' },
  2: { description: 'Partly cloudy', icon: '⛅' },
  3: { description: 'Overcast', icon: '☁️' },
  45: { description: 'Foggy', icon: '🌫️' },
  48: { description: 'Depositing rime fog', icon: '🌫️' },
  51: { description: 'Light drizzle', icon: '🌦️' },
  53: { description: 'Moderate drizzle', icon: '🌦️' },
  55: { description: 'Dense drizzle', icon: '🌧️' },
  61: { description: 'Slight rain', icon: '🌧️' },
  63: { description: 'Moderate rain', icon: '🌧️' },
  65: { description: 'Heavy rain', icon: '🌧️' },
  71: { description: 'Slight snow', icon: '🌨️' },
  73: { description: 'Moderate snow', icon: '🌨️' },
  75: { description: 'Heavy snow', icon: '❄️' },
  77: { description: 'Snow grains', icon: '🌨️' },
  80: { description: 'Slight rain showers', icon: '🌦️' },
  81: { description: 'Moderate rain showers', icon: '🌦️' },
  82: { description: 'Violent rain showers', icon: '⛈️' },
  85: { description: 'Slight snow showers', icon: '🌨️' },
  86: { description: 'Heavy snow showers', icon: '🌨️' },
  95: { description: 'Thunderstorm', icon: '⛈️' },
  96: { description: 'Thunderstorm with slight hail', icon: '⛈️' },
  99: { description: 'Thunderstorm with heavy hail', icon: '⛈️' },
};

function getCacheKey(lat: number, lng: number, startDate: string, endDate: string): string {
  return `${lat.toFixed(2)}_${lng.toFixed(2)}_${startDate}_${endDate}`;
}

function getCachedWeather(key: string): WeatherData[] | null {
  try {
    const cached = localStorage.getItem('weather_cache');
    if (!cached) return null;
    
    const cache: WeatherCache = JSON.parse(cached);
    const entry = cache[key];
    
    if (!entry) return null;
    if (Date.now() - entry.timestamp > CACHE_DURATION) {
      // Expired
      delete cache[key];
      localStorage.setItem('weather_cache', JSON.stringify(cache));
      return null;
    }
    
    return entry.data;
  } catch {
    return null;
  }
}

function setCachedWeather(key: string, data: WeatherData[]): void {
  try {
    const cached = localStorage.getItem('weather_cache');
    const cache: WeatherCache = cached ? JSON.parse(cached) : {};
    cache[key] = { data, timestamp: Date.now() };
    localStorage.setItem('weather_cache', JSON.stringify(cache));
  } catch {
    // Storage full or unavailable
  }
}

export async function fetchWeather(
  latitude: number,
  longitude: number,
  startDate: string,
  endDate: string
): Promise<WeatherData[]> {
  const cacheKey = getCacheKey(latitude, longitude, startDate, endDate);
  
  // Check cache first
  const cached = getCachedWeather(cacheKey);
  if (cached) {
    return cached;
  }
  
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weathercode&start_date=${startDate}&end_date=${endDate}&timezone=auto`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Weather API error: ${response.status}`);
  }
  
  const data = await response.json();
  
  const weatherData: WeatherData[] = data.daily.time.map((date: string, i: number) => ({
    date,
    tempMax: Math.round(data.daily.temperature_2m_max[i]),
    tempMin: Math.round(data.daily.temperature_2m_min[i]),
    precipitationChance: data.daily.precipitation_probability_max[i],
    weatherCode: data.daily.weathercode[i],
  }));
  
  // Cache the result
  setCachedWeather(cacheKey, weatherData);
  
  return weatherData;
}

// Get location coordinates from place name using Nominatim
export async function geocodeLocation(locationName: string): Promise<{ lat: number; lng: number } | null> {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationName)}&limit=1`;
  
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Wanderlust/1.0',
    },
  });
  
  if (!response.ok) return null;
  
  const data = await response.json();
  if (!data || data.length === 0) return null;
  
  return {
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon),
  };
}
