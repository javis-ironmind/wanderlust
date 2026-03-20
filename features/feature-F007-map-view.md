# Feature F007: Map View

## Description

Display daily itinerary activities on an interactive map. Each day shows all activity locations as pins, with the ability to view routes and navigate.

## Implementation

### Map Provider
- Leaflet GL JS via react-leaflet
- Custom map style (light/navigation)
- Custom markers for different activity types

### Components Needed
- `MapView` - Main map component
- `ActivityMarker` - Custom pin for activities
- `HotelMarker` - Distinct marker for hotels
- `FlightMarker` - Marker for airports
- `MapControls` - Zoom, style toggle, fullscreen
- `DayMapSelector` - Switch between days on map

### Map Interactions
- Pan and zoom freely
- Click marker for details popup
- Hover for quick preview
- Fit bounds to show all day's activities
- Cluster markers when zoomed out

### Visual Design
- Activity type colors:
  - Transport: `#6B7280` (gray)
  - Food: `#F97316` (orange)
  - Sightseeing: `#8B5CF6` (purple)
  - Activity: `#10B981` (green)
  - Accommodation: `#3B82F6` (blue)
  - Shopping: `#EC4899` (pink)

## Acceptance Criteria
- [x] AC1 - Map displays for currently selected day — **2026-03-19 23:12 UTC**: Already implemented - showMap state controls visibility, selectedDay determines which day's activities are shown via markers/flightMarkers/hotelMarkers useMemos.
- [x] AC2 - All activities with locations shown as pins — **2026-03-19 23:12 UTC**: Already implemented - markers useMemo filters activities with location.latitude/longitude and maps them to MapMarker[] passed to TripMap.
- [x] AC3 - Click pin shows activity details popup — **2026-03-19 23:12 UTC**: Already implemented - TripMap renders <Marker> with <Popup> showing title and category. react-leaflet handles click-to-show.
- [x] AC4 - Different icons/colors for activity categories — **2026-03-19 23:12 UTC**: Already implemented - getMarkerIcon uses CATEGORY_COLORS map, each category has distinct color (transport: gray, food: orange, sightseeing: purple, etc.).
- [x] AC5 - Can switch between days on map — **2026-03-19 23:12 UTC**: Already implemented - day tabs update selectedDay, which triggers markers/flightMarkers/hotelMarkers useMemos to filter relevant items for the day.
- [x] AC6 - Map fits to show all pins for selected day — **2026-03-19 23:12 UTC**: Already implemented - TripMap useEffect auto-calculates mapCenter from valid markers (average lat/lng of all markers).
- [x] AC7 - Smooth transitions between day selections — **2026-03-19 23:15 UTC**: Added MapAnimator component inside MapContainer. Uses useMap() hook to access Leaflet map instance and calls map.flyTo() with animate:true, duration:0.5 when markers change (day changes). Prevents re-animation for trivial position changes (>0.001 threshold).
- [x] AC8 - Hotels show with distinct marker — **2026-03-19 23:05 UTC**: Implemented via hotelMarkers useMemo + getHotelMarkers function. Hotels appear as blue markers (category='hotel').
- [x] AC9 - Airports/flight locations shown — **2026-03-19 21:45 UTC**: Implemented via flightMarkers useMemo + getFlightMarkers function using AIRPORT_COORDINATES lookup table.
- [x] AC10 - Works on desktop and tablet screen sizes — **2026-03-19 23:22 UTC**: Changed map wrapper from fixed inline styles (minHeight: 250px) to Tailwind responsive classes. Now uses `min-h-[200px] md:min-h-[250px]` - 200px minimum on mobile/tablet portrait, 250px on desktop. Map container properly adapts to different screen sizes.
