# S025: Weather Integration

## User Story
As a traveler, I want to see weather forecasts for each day of my trip so I can plan activities accordingly and pack appropriate clothing.

## Acceptance Criteria
- [x] 1 - Weather data fetched for trip destination dates using Open-Meteo API (free, no API key)
- [x] 2 - Daily weather displayed on each day card (temp high/low, conditions icon)
- [x] 3 - Expandable weather details on click (humidity, wind, precipitation chance)
- [x] 4 - Graceful fallback if weather API unavailable (show placeholder)
- [x] 5 - Weather cached in localStorage to reduce API calls

## Technical Notes
- Use Open-Meteo API: `https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lng}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weathercode&start_date={start}&end_date={end}`
- Geocode trip location using existing Nominatim setup
- Cache weather for 6 hours in localStorage
- Weather icons: sunny, partly cloudy, cloudy, rain, snow, thunderstorm

## Dependencies
- Existing geocoding (S016)
- Day structure (S002/S006)
- localStorage (S017)
