# Story S018 - Category Filtering

**Feature:** F012 - Activity Categories
**Story Points:** 2
**Priority:** Medium

## Description
Implement category filtering for activities in the itinerary view.

## Acceptance Criteria

- [x] AC1 - Filter button/menu accessible
- [x] AC2 - Shows all categories with activity counts
- [x] AC3 - Can select multiple categories
- [x] AC4 - Can select "All" to clear filter
- [x] AC5 - Activities filter in real-time
- [x] AC6 - Filtered state persists within session
- [x] AC7 - Clear filter button available
- [x] AC8 - Category badges on cards reflect actual category
- [x] AC9 - Empty state if no matches
- [x] AC10 - Filter UI closes on selection

## E2E Test Requirements
- Test filter button opens filter menu
- Test selecting category filters activities
- Test clearing filter shows all activities

## Implementation Notes
- Use Magic UI for dropdown/filter components
- Category counts from store
- URL query params for shareable filters

## Implementation Summary
- Created `CategoryFilter.tsx` component with:
  - Dropdown filter button with activity count badge
  - Category list with checkboxes and activity counts
  - "Show All" and "Clear Filter" buttons
  - Click-outside-to-close behavior
  - Helper functions: `filterActivitiesByCategory`, `getCategoryCounts`
- Updated `trip/[tripId]/page.tsx` to:
  - Display days with tab navigation
  - Show activities per day with drag-and-drop support
  - Integrate CategoryFilter in header
  - Filter activities in real-time based on selection
  - Show empty state when no activities match filter
