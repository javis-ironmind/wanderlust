# Feature F008: Route Navigation

## Description

Generate turn-by-turn routes between daily activities on the map. Shows travel time and distance between each stop, optimizing the route order.

## Implementation

### API
- Mapbox Directions API
- Walking/driving profile
- Waypoint optimization

### Components Needed
- `RouteLayer` - Mapbox layer for route lines
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
- [ ] AC1 - Route line displays on map connecting day's activities
- [ ] AC2 - Route follows chronological order of activities
- [ ] AC3 - Total travel time shown (e.g., "45 min driving")
- [ ] AC4 - Total distance shown (e.g., "12.5 km")
- [ ] AC5 - Route updates when activities reordered
- [ ] AC6 - Route updates when activities added/removed
- [ ] AC7 - Can toggle route visibility on/off
- [ ] AC8 - Driving vs walking toggle
- [ ] AC9 - Route auto-recalculates on day change
- [ ] AC10 - Graceful handling if route can't be generated
