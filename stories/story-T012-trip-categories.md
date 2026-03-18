# Story T012 - Trip Categories/Tags

**Priority:** Medium

## Description
Allow users to assign categories/tags to trips (e.g., "Business", "Vacation", "Weekend Getaway", "Adventure") and filter the trips list by category.

## Background
As users create more trips, organizing them becomes important. Categories help users quickly find trips of a certain type and maintain a cleaner trips list.

## Acceptance Criteria

- [x] AC1 - Add "Category" field to trip creation form with predefined options + custom tag input
- [x] AC2 - Display category badge/tag on each trip card in the trips list
- [x] AC3 - Filter dropdown in trips list to filter by category (All, Business, Vacation, etc.)
- [ ] AC4 - Category selector appears in trip detail view for editing
- [x] AC5 - Multiple tags support per trip

## Technical Notes
- Add "categories" field to trip object: string[] 
- Predefined categories: Business, Vacation, Weekend Getaway, Adventure, Family, Honeymoon
- Custom tags allowed (user-created)
- Store in localStorage alongside trip data
- Filter happens client-side on the trips list

## Implementation Summary
*(To be filled after implementation)*