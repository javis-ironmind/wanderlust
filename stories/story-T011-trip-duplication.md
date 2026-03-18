# Story T011 - Trip Duplication

**Priority:** Medium

## Description
Allow users to duplicate an existing trip as a template for creating a new trip with all the same activities, dates, and details.

## Background
Users often want to create similar trips (e.g., "Paris 2024" → "Paris 2025") or use a business trip as a template for a personal trip. Duplication saves time by copying all activities, notes, and settings.

## Acceptance Criteria

- [x] AC1 - "Duplicate" button/link on trip card in list view
- [x] AC2 - Confirmation modal showing "Duplicate trip?" with trip name preview
- [x] AC3 - Duplicated trip opens in edit mode with "(Copy)" appended to name
- [x] AC4 - All activities are duplicated with same details (name, date, time, location, notes)
- [x] AC5 - Original trip remains unchanged
- [x] AC6 - User is navigated to the new duplicated trip after creation

## Technical Notes
- Deep clone the trip object, not reference
- Generate new unique IDs for duplicated activities
- Keep original trip ID in a "copiedFrom" field for potential reference
- Preserve dates relative to trip start (not absolute dates) - OR just copy as-is with clear "(Copy)" naming

## Implementation Summary
- Added "Duplicate" button on each trip card in the trips list (top-right corner)
- Added confirmation modal with trip name preview before duplication
- Deep clones trip with all days, activities, flights, and hotels
- Generates new unique IDs for trip, days, activities, flights, and hotels
- Appends "(Copy)" to the duplicated trip name
- Stores original trip ID in "copiedFrom" field
- Navigates to the new duplicated trip after creation
