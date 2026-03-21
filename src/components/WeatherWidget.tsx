'use client';

import { useState, useEffect } from 'react';
import { WeatherData, weatherCodeMap, fetchWeather, geocodeLocation, getWeatherForDate, WidgetWeather } from '@/lib/weather';

type WeatherWidgetProps = {
  tripId: string;
  startDate: string;
  endDate: string;
  location?: string;
  date: string; // The specific day to show weather for
};

export function WeatherWidget({ tripId, startDate, endDate, location, date }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WidgetWeather | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!location) {
      setError(true);
      return;
    }

    const loadWeather = async () => {
      setLoading(true);
      setError(false);
      
      try {
        // Geocode the location
        const coords = await geocodeLocation(location);
        if (!coords) {
          setError(true);
          setLoading(false);
          return;
        }

        // Fetch weather
        if (!coords.latitude || !coords.longitude) {
          setError(true);
          setLoading(false);
          return;
        }
        
        const weatherData = await fetchWeather(
          coords.latitude,
          coords.longitude,
          startDate,
          endDate
        );

        // Find weather for this specific date
        const dayWeather = getWeatherForDate(weatherData, date);
        setWeather(dayWeather);
      } catch (err) {
        console.error('Weather fetch error:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadWeather();
  }, [tripId, location, startDate, endDate, date]);

  if (loading) {
    return (
      <span style={{ fontSize: '0.75rem', color: '#64748b', marginLeft: '0.5rem' }}>
        ⏳
      </span>
    );
  }

  if (error || !weather) {
    return (
      <span style={{ fontSize: '0.75rem', color: '#64748b', marginLeft: '0.5rem' }}>
        🌤️
      </span>
    );
  }

  const weatherInfo = weatherCodeMap[weather.weatherCode] || { description: 'Unknown', icon: '🌤️' };

  return (
    <div style={{ display: 'inline-block', marginLeft: '0.5rem' }}>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: '0.25rem 0.5rem',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
          fontSize: '0.75rem',
          color: '#64748b',
          transition: 'background 0.2s',
        }}
        title={weatherInfo.description}
      >
        <span>{weatherInfo.icon}</span>
        <span>{weather.tempMax}°</span>
        <span style={{ opacity: 0.6 }}>{weather.tempMin}°</span>
      </button>

      {expanded && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          padding: '0.75rem',
          zIndex: 50,
          minWidth: '160px',
          marginTop: '0.25rem',
        }}>
          <div style={{ fontWeight: '600', fontSize: '0.875rem', color: '#1e3a5f', marginBottom: '0.5rem' }}>
            {weatherInfo.icon} {weatherInfo.description}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            <div>High: {weather.tempMax}°C</div>
            <div>Low: {weather.tempMin}°C</div>
            <div>Rain: {weather.precipitationChance}%</div>
          </div>
        </div>
      )}
    </div>
  );
}
