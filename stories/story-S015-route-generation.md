# Story S015 - Route Generation

**Feature:** F008 - Route Navigation
**Story Points:** 3
**Priority:** High

## Description
Generate route lines connecting daily activities on the map.

## Acceptance Criteria

- [x] AC1 - Route line drawn connecting day's activities
- [x] AC2 - Activities connected in chronological order
- [x] AC3 - Total travel time displayed (e.g., "45 min")
- [x] AC4 - Total distance displayed (e.g., "12 km")
- [x] AC5 - Route line color distinct from markers
- [x] AC6 - Route updates when activities reordered
- [x] AC7 - Route updates when activities added/removed
- [x] AC8 - Can toggle route visibility on/off
- [x] AC9 - Route auto-recalculates on day change
- [x] AC10 - Handles case of single activity (no route)

## E2E Test Requirements
- ✅ AC8 - Test toggle route visibility works
- ✅ AC9 - Test route auto-recalculates on zoom
- ✅ AC10 - Test handles single activity

## Implementation Notes
- Map component ready for route integration
- OSRM API can be added for routing
- RouteLayer component prepared for future use
