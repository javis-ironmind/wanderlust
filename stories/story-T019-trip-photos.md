# T019: Trip Photos Gallery

## Priority: MEDIUM
## Estimated Effort: 2 hours

---

## Context

Users want to see visual memories from their trips. Adding photo support to trip detail pages would make the app more engaging and useful.

---

## Acceptance Criteria

- [ ] AC1: Add photos array to Trip type in store
- [ ] AC2: Photo upload input in trip detail page
- [ ] AC3: Display photos in a grid on trip detail page  
- [ ] AC4: Click photo to view fullscreen
- [ ] AC5: Photos persist to localStorage

---

## Technical Notes

- Use browser's file input for photo upload
- Convert images to base64 for localStorage (with size limit)
- Display in responsive grid (3 columns desktop, 2 mobile)
- Fullscreen modal for viewing

---

## Test Scenarios

1. Upload photo → appears in grid
2. Click photo → fullscreen modal opens
3. Refresh page → photos persist
4. Delete photo → removed from grid and storage

---

## Definition of Done

All 5 ACs complete, tested locally, committed to git.
