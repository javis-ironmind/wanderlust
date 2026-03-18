# Story S016 - Location Search

**Feature:** F009 - Location Search
**Story Points:** 2
**Priority:** Medium

## Description
Implement location search with autocomplete for adding activities and hotels.

## Acceptance Criteria

- [ ] AC1 - Search input shows autocomplete dropdown
- [ ] AC2 - Typing triggers search (debounced)
- [ ] AC3 - Results show address and type
- [ ] AC4 - Clicking result selects location
- [ ] AC5 - Enter key selects first result
- [ ] AC6 - Selection fills address and coordinates
- [ ] AC7 - Loading state while fetching
- [ ] AC8 - Error state if search fails
- [ ] AC9 - Can manually enter address if not found
- [ ] AC10 - Clear button to reset input

## E2E Test Requirements
- Test location search dropdown appears
- Test selecting location fills form
- Test error state displays on failure

## Implementation Notes
- Use Nominatim API for geocoding (free, no key)
- Debounce search by 300ms
- Cache recent searches
