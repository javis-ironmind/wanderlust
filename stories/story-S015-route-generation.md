# Story S015 - Route Generation

**Feature:** F008 - Route Navigation
**Story Points:** 3
**Priority:** High

## Description
Generate route lines connecting daily activities on the map.

## Acceptance Criteria

- [ ] AC1 - Route line drawn connecting day's activities
- [ ] AC2 - Activities connected in chronological order
- [ ] AC3 - Total travel time displayed (e.g., "45 min")
- [ ] AC4 - Total distance displayed (e.g., "12 km")
- [ ] AC5 - Route line color distinct from markers
- [ ] AC6 - Route updates when activities reordered
- [ ] AC7 - Route updates when activities added/removed
- [ ] AC8 - Can toggle route visibility on/off
- [ ] AC9 - Route auto-recalculates on day change
- [ ] AC10 - Handles case of single activity (no route)

## E2E Test Requirements
- Test route line appears between activities
- Test travel time/distance displayed
- Test toggle route visibility works
- Test route updates when activities change

## Implementation Notes
- Use OSRM API for routing
- Polyline for route visualization
- Debounce route calculations
