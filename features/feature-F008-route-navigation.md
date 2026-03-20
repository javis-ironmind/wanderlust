# Feature F008: Route Navigation

## Description

Generate turn-by-turn routes between daily activities on the map. Shows travel time and distance between each stop, optimizing the route order.

## Implementation

### API
- Leaflet Directions API
- Walking/driving profile
- Waypoint optimization

### Components Needed
- `RouteLayer` - Leaflet layer for route lines
- `RouteSummary` - Panel showing total time/distance
- `RouteDetails` - Step-by-step directions
- `RouteOptions` - Driving/walking/fastest scenic

### Route Logic
- Order activities by start time
- Generate route through all stops
- Show travel time between each pair
- Highlight route on map
- Total route time displayed

## Acceptance Criteria
- [x] AC1 - Route line displays on map connecting day's activities — **2026-03-19 23:35 UTC**: Polyline in TripMap renders route from routePositions. Route now filtered to selectedDay's activities only.
- [x] AC2 - Route follows chronological order of activities — **2026-03-19 23:35 UTC**: Updated routePositions useMemo to sort activities by startTime before mapping to positions. Activities without startTime are excluded from route. Route now follows chronological order.
- [x] AC3 - Total travel time shown (e.g., "45 min driving") — **2026-03-20 00:30 UTC**: Added routeSummary state + useEffect to fetch from OSRM API. Shows "⏱ X min" badge on map when route is displayed. Uses /route/v1/{profile}/{coords} endpoint.
- [x] AC4 - Total distance shown (e.g., "12.5 km") — **2026-03-20 00:30 UTC**: Route summary also returns distance from OSRM. Shows "🚗 X.X km" badge on map. Both AC3 and AC4 displayed in same overlay badge.
- [x] AC5 - Route updates when activities reordered — **2026-03-19 23:45 UTC**: routePositions depends on trip?.days activities directly, so reordering triggers recalculation.
- [x] AC6 - Route updates when activities added/removed — **2026-03-19 23:45 UTC**: routePositions recalculates when selectedDayObj.activities changes.
- [x] AC7 - Can toggle route visibility on/off — **2026-03-19 23:48 UTC**: Added showRoute state and 🛤️ toggle button. When map is shown, button appears at bottom-right. Passes empty route to TripMap when showRoute is false.
- [x] AC8 - Driving vs walking toggle — **2026-03-20 00:35 UTC**: Added routeMode state ('driving'|'walking') and toggle button (🚗/🚶) positioned to the left of the route visibility toggle. Blue for driving, purple for walking.
- [x] AC9 - Route auto-recalculates on day change — **2026-03-19 23:45 UTC**: routePositions useMemo depends on selectedDay, so changing selectedDay triggers recalculation.
- [x] AC10 - Graceful handling if route can't be generated — **2026-03-19 23:55 UTC**: Added explicit check - if fewer than 2 activities with valid coordinates, return empty array.
