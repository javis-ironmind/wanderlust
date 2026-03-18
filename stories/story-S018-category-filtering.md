# Story S018 - Category Filtering

**Feature:** F012 - Activity Categories
**Story Points:** 2
**Priority:** Medium

## Description
Implement category filtering for activities in the itinerary view.

## Acceptance Criteria

- [ ] AC1 - Filter button/menu accessible
- [ ] AC2 - Shows all categories with activity counts
- [ ] AC3 - Can select multiple categories
- [ ] AC4 - Can select "All" to clear filter
- [ ] AC5 - Activities filter in real-time
- [ ] AC6 - Filtered state persists within session
- [ ] AC7 - Clear filter button available
- [ ] AC8 - Category badges on cards reflect actual category
- [ ] AC9 - Empty state if no matches
- [ ] AC10 - Filter UI closes on selection

## E2E Test Requirements
- Test filter button opens filter menu
- Test selecting category filters activities
- Test clearing filter shows all activities

## Implementation Notes
- Use Magic UI for dropdown/filter components
- Category counts from store
- URL query params for shareable filters
