# T021: Trip Journal

## Priority: MEDIUM
## Estimated Effort: 2 hours

---

## Context

Users want to write daily journal entries during their trips. The journal tab exists but has no UI. This feature adds a journaling experience for travelers.

---

## Acceptance Criteria

- [x] AC1: Render JournalPanel when journal tab is active
- [x] AC2: Display list of journal entries (by date)
- [x] AC3: Add new journal entry form (date + text)
- [x] AC4: Edit existing journal entries
- [x] AC5: Delete journal entries
- [x] AC6: Persist to localStorage

---

## Progress (Cycle 194)

**Completed (6/6 ACs):**
- ✅ AC1: Journal section renders when journal tab active
- ✅ AC2: Entries displayed sorted by date (newest first)
- ✅ AC3: Add form with date picker and textarea
- ✅ AC4: Edit button with inline editing
- ✅ AC5: Delete button with confirmation
- ✅ AC6: localStorage persistence via trip.journalEntries

**All ACs complete!**

---

## Technical Notes

- Add journalEntries field to Trip type
- JournalEntry: { id: string, date: string, content: string, createdAt: string }
- Use textarea for content
- Show date prominently

---

## Test Scenarios

1. Click Journal tab → shows journal panel
2. Add entry → appears in list
3. Edit entry → changes persist
4. Delete entry → removed from list and storage
5. Refresh → entries persist

---

## Definition of Done

All 6 ACs complete, tested locally, committed to git.
