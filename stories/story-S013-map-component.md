# Story S013 - Map Component

**Feature:** F007 - Map View
**Story Points:** 3
**Priority:** High

## Description
Implement Leaflet map component in the right panel to visualize daily activities.

## Acceptance Criteria

- [ ] AC1 - Leaflet map renders in right panel
- [ ] AC2 - Map style is clean (light or navigation)
- [ ] AC3 - Zoom controls visible
- [ ] AC4 - Can pan around the map
- [ ] AC5 - Map loads without errors
- [ ] AC6 - Map handles window resize
- [ ] AC7 - Initial view shows world or trip region
- [ ] AC8 - Map attribution visible
- [ ] AC9 - Works on desktop Chrome/Firefox/Safari
- [ ] AC10 - Graceful error if Leaflet token invalid

## E2E Test Requirements
- Test that map component renders on trip detail page
- Test zoom controls work
- Test pan functionality works

## Implementation Notes
- Use react-leaflet for React integration
- OpenStreetMap tiles - no API key needed
- Lazy load map for performance
