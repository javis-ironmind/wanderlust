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
- [ ] AC1 - Map displays for currently selected day
- [ ] AC2 - All activities with locations shown as pins
- [ ] AC3 - Click pin shows activity details popup
- [ ] AC4 - Different icons/colors for activity categories
- [ ] AC5 - Can switch between days on map
- [ ] AC6 - Map fits to show all pins for selected day
- [ ] AC7 - Smooth transitions between day selections
- [ ] AC8 - Hotels show with distinct marker
- [ ] AC9 - Airports/flight locations shown
- [ ] AC10 - Works on desktop and tablet screen sizes
