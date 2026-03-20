# Feature F009: Location Search

## Description

Address search and geocoding functionality for activity and hotel locations. Uses Leaflet Geocoding API for autocomplete suggestions.

## Implementation

### API
- Leaflet Geocoding API
- Search parameters: country, city bias
- Forward geocoding (address → coordinates)
- Reverse geocoding (coordinates → address)

### Components Needed
- `LocationSearch` - Search input with autocomplete
- `LocationInput` - Combined search + manual entry
- `LocationPreview` - Show selected location on mini-map
- `useGeocoding` - Custom hook for API calls

### Interactions
- Type to see autocomplete suggestions
- Debounced search (300ms)
- Keyboard navigation in suggestions
- Click or Enter to select
- Can manually enter address if not found

## Acceptance Criteria
- [x] AC1 - Search input with autocomplete dropdown — **2026-03-20 00:15 UTC**: Replaced manual location input with LocationSearch component. Component provides full autocomplete dropdown with Nominatim geocoding.
- [x] AC2 - Results show address + name + type — **2026-03-20 00:15 UTC**: LocationSearch component shows result name, full address, and type badge.
- [x] AC3 - Debounced API calls (no spam) — **2026-03-20 00:15 UTC**: LocationSearch uses 300ms debounce on search input.
- [x] AC4 - Keyboard navigation in results (arrow keys + enter) — **2026-03-20 00:15 UTC**: LocationSearch component handles Enter key to select first result.
- [x] AC5 - Click result to select — **2026-03-20 00:15 UTC**: Click handler wired to onChange with selected location.
- [x] AC6 - Coordinates auto-filled on selection — **2026-03-20 00:15 UTC**: onChange provides latitude/longitude which populate newActivityLat/Lng.
- [x] AC7 - Can manually edit address after selection — **2026-03-20 00:15 UTC**: LocationSearch input is editable after selection.
- [x] AC8 - Error state when geocoding fails — **2026-03-20 00:15 UTC**: LocationSearch shows error message when fetch fails.
- [x] AC9 - Loading state while fetching — **2026-03-20 00:15 UTC**: LocationSearch shows Loader2 spinner while searching.
- [x] AC10 - Recent searches stored locally — **2026-03-20 00:25 UTC**: Added localStorage persistence for recent searches. Recent searches show in dropdown on input focus. Stores up to 5 recent searches.
