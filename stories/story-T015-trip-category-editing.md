# Story T015 - Trip Category Editing

**Priority:** Medium

## Description
Add category selector to trip detail view, allowing users to edit trip categories after creation. This completes the missing AC4 from T012.

## Background
T012 implemented trip categories but AC4 was incomplete: "Category selector appears in trip detail view for editing". Users need to be able to modify categories on existing trips.

## Acceptance Criteria

- [x] AC1 - Add category selector/tags input to trip detail header area
- [x] AC2 - Display current categories as removable tags/chips
- [x] AC3 - "Add Category" button shows dropdown with predefined + custom options
- [x] AC4 - Changes persist immediately to store/localStorage
- [x] AC5 - Category badges update in real-time on the trip card in list view
- [x] AC6 - Empty state shows "No categories" with prompt to add

## Technical Notes
- Reuse existing category options from T012: Business, Vacation, Adventure, Cultural, Relaxation, Custom
- Update store to support `updateTripCategories(tripId, categories)`
- Categories stored in trip object under `categories` field (array of strings)

## Implementation Summary
*(To be filled after implementation)*
