# Feature F009: Location Search

## Description

Address search and geocoding functionality for activity and hotel locations. Uses Mapbox Geocoding API for autocomplete suggestions.

## Implementation

### API
- Mapbox Geocoding API
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
- [ ] AC1 - Search input with autocomplete dropdown
- [ ] AC2 - Results show address + name + type
- [ ] AC3 - Debounced API calls (no spam)
- [ ] AC4 - Keyboard navigation in results (arrow keys + enter)
- [ ] AC5 - Click result to select
- [ ] AC6 - Coordinates auto-filled on selection
- [ ] AC7 - Can manually edit address after selection
- [ ] AC8 - Error state when geocoding fails
- [ ] AC9 - Loading state while fetching
- [ ] AC10 - Recent searches stored locally
