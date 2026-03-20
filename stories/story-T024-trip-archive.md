# T024: Trip Archive

## Priority: MEDIUM
## Estimated Effort: 2 hours

---

## Context

Users accumulate many past trips that clutter their main view. Add archive functionality to hide completed trips from the main view and optionally restore them.

---

## Acceptance Criteria

- [ ] AC1: "Archive" option in trip actions (next to delete)
- [ ] AC2: Archived trips move to separate "Archived" tab/section
- [ ] AC3: Archived trips don't appear in main upcoming list
- [ ] AC4: "Unarchive" option to restore trips to main view
- [ ] AC5: Archive status stored in trip object (archived: boolean)
- [ ] AC6: Archived section shows trip count badge

---

## Technical Notes

- Add `archived: boolean` to Trip type
- Filter archived trips in main view (show only !archived)
- Add separate archived section/tab (show only archived)
- Archive action available in trip card dropdown

---

## Definition of Done

All 6 ACs complete, tested locally, committed to git.
