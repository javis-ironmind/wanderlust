# Story S014 - Activity Pins on Map

**Feature:** F007 - Map View
**Story Points:** 3
**Priority:** High

## Description
Display activity pins on the map with category-specific colors and popups.

## Acceptance Criteria

- [x] AC1 - Pins shown for activities with locations
- [x] AC2 - Each activity category has distinct pin color
- [x] AC3 - Clicking pin shows activity name popup
- [x] AC4 - Pins for current day's activities shown
- [x] AC5 - Map auto-fits to show all pins
- [x] AC6 - Can switch between days (pins update)
- [x] AC7 - Hotel shown with distinct pin style
- [x] AC8 - Pin click opens activity details
- [x] AC9 - No duplicate pins for same location
- [x] AC10 - Smooth transition when pins change

## E2E Test Requirements
- ✅ AC1 - Test pins appear for activities
- ✅ AC3 - Test clicking pin shows popup
- ✅ AC5 - Test map auto-fits bounds

## Implementation Notes
- Use Leaflet markers with custom icons
- Category colors from design system
- Map accepts markers prop for dynamic pins
