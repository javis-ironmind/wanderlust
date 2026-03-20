# Story T017 - Trip Notes

## Priority: MEDIUM
## Estimated Effort: 2-3 hours

---

## Context

Users need to store non-activity information with their trips like:
- Confirmation numbers
- Packing reminders
- Important contacts
- Visa/passport info
- General trip notes

---

## Acceptance Criteria

- [ ] AC1: Add `notes` field to Trip type (array of note objects with id, content, createdAt)
- [ ] AC2: Create NotesPanel component for trip detail page
- [ ] AC3: Add ability to create, edit, delete notes
- [ ] AC4: Notes persist in localStorage with trip data
- [ ] AC5: Timestamp displayed for each note
- [ ] AC6: Empty state when no notes exist

---

## Technical Notes

- Note object: `{ id: string, content: string, createdAt: number, updatedAt?: number }`
- Use nanoid or crypto.randomUUID() for note IDs
- Store notes in same localStorage key as trip data
- Simple textarea for note content (expandable)
- Confirm before delete

---

## Test Scenarios

1. Add note → appears in list with timestamp
2. Edit note → content updates, timestamp shows "edited"
3. Delete note → confirm dialog → note removed
4. Refresh page → notes persist
5. Empty state → shows helpful message

---

## Definition of Done

All 6 ACs complete, tested locally, committed to git.
