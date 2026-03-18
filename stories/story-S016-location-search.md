# Story S016 - Location Search

**Feature:** F009 - Location Search
**Story Points:** 2
**Priority:** Medium

## Description
Implement location search with autocomplete for adding activities and hotels.

## Acceptance Criteria

- [x] AC1 - Search input shows autocomplete dropdown
- [x] AC2 - Typing triggers search (debounced)
- [x] AC3 - Results show address and type
- [x] AC4 - Clicking result selects location
- [x] AC5 - Enter key selects first result
- [x] AC6 - Selection fills address and coordinates
- [x] AC7 - Loading state while fetching
- [x] AC8 - Error state if search fails
- [x] AC9 - Can manually enter address if not found
- [x] AC10 - Clear button to reset input

## E2E Test Requirements
- ✅ AC8 - Test location search dropdown appears
- ✅ AC9 - Test selecting location fills form
- ✅ AC10 - Test error state displays on failure

## Implementation Notes
- Use Nominatim API for geocoding (free, no key)
- Debounce search by 300ms
- Cache recent searches
