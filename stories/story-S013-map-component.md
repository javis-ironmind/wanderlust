# Story S013 - Map Component

**Feature:** F007 - Map View
**Story Points:** 3
**Priority:** High

## Description
Implement Leaflet map component in the right panel to visualize daily activities.

## Acceptance Criteria

- [x] AC1 - Leaflet map renders in right panel
- [x] AC2 - Map style is clean (light or navigation)
- [x] AC3 - Zoom controls visible
- [x] AC4 - Can pan around the map
- [x] AC5 - Map loads without errors
- [x] AC6 - Map handles window resize
- [x] AC7 - Initial view shows world or trip region
- [x] AC8 - Map attribution visible
- [x] AC9 - Works on desktop Chrome/Firefox/Safari
- [x] AC10 - Graceful error if Leaflet token invalid

## E2E Test Requirements
- ✅ AC1 - Test that map component renders on trip detail page
- ✅ AC3 - Test zoom controls work
- ✅ AC4 - Test pan functionality works
- ✅ AC5 - Test map loads without errors

## Implementation Notes
- Use react-leaflet for React integration
- OpenStreetMap tiles - no API key needed
- Lazy load map for performance
