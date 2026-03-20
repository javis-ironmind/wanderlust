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

- [x] AC1: Add `notes` field to Trip type (array of note objects with id, content, createdAt)
- [x] AC2: Create NotesPanel component for trip detail page
- [x] AC3: Add ability to create, edit, delete notes
- [x] AC4: Notes persist in localStorage with trip data
- [x] AC5: Timestamp displayed for each note
- [x] AC6: Empty state when no notes exist

---

## Cycle 190 Progress

**Completed (6/6 ACs):**
- ✅ AC1: Added TripNote interface to src/lib/types.ts
- ✅ AC2: Created NotesPanel.tsx component
- ✅ AC3: Added create, edit, delete functionality with confirmation
- ✅ AC4: Notes persist via handleUpdateNotes -> localStorage
- ✅ AC5: Timestamps displayed with formatDate function, shows "(edited)"
- ✅ AC6: Empty state shows helpful message

---

## Technical Implementation

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
