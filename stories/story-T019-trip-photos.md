# T019: Trip Photos Gallery

## Priority: MEDIUM
## Estimated Effort: 2 hours

---

## Context

Users want to see visual memories from their trips. Adding photo support to trip detail pages would make the app more engaging and useful.

---

## Acceptance Criteria

- [x] AC1: Add photos array to Trip type in store
- [x] AC2: Photo upload input in trip detail page
- [x] AC3: Display photos in a grid on trip detail page  
- [x] AC4: Click photo to view fullscreen
- [x] AC5: Photos persist to localStorage

---

## Progress (Cycle 192)

**Completed (5/5 ACs):**
- ✅ AC1: Added photos?: string[] to Trip type
- ✅ AC2: File input with accept="image/*" for upload
- ✅ AC3: Responsive photo grid (auto-fill, minmax 120px)
- ✅ AC4: Fullscreen modal with click-to-close
- ✅ AC5: localStorage persistence with 500KB file limit

**All ACs complete!**

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
