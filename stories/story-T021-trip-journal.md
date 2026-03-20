# T021: Trip Journal

## Priority: MEDIUM
## Estimated Effort: 2 hours

---

## Context

Users want to write daily journal entries during their trips. The journal tab exists but has no UI. This feature adds a journaling experience for travelers.

---

## Acceptance Criteria

- [ ] AC1: Render JournalPanel when journal tab is active
- [ ] AC2: Display list of journal entries (by date)
- [ ] AC3: Add new journal entry form (date + text)
- [ ] AC4: Edit existing journal entries
- [ ] AC5: Delete journal entries
- [ ] AC6: Persist to localStorage

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
