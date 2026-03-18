# Story S014 - Activity Pins on Map

**Feature:** F007 - Map View
**Story Points:** 3
**Priority:** High

## Description
Display activity pins on the map with category-specific colors and popups.

## Acceptance Criteria

- [ ] AC1 - Pins shown for activities with locations
- [ ] AC2 - Each activity category has distinct pin color
- [ ] AC3 - Clicking pin shows activity name popup
- [ ] AC4 - Pins for current day's activities shown
- [ ] AC5 - Map auto-fits to show all pins
- [ ] AC6 - Can switch between days (pins update)
- [ ] AC7 - Hotel shown with distinct pin style
- [ ] AC8 - Pin click opens activity details
- [ ] AC9 - No duplicate pins for same location
- [ ] AC10 - Smooth transition when pins change

## E2E Test Requirements
- Test that pins appear for activities with locations
- Test clicking pin shows popup with activity name
- Test switching days updates pins

## Implementation Notes
- Use Leaflet markers with custom icons
- Category colors from design system
- Auto-fit bounds using Leaflet's fitBounds
