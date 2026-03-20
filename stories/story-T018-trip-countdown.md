# Story T018 - Trip Countdown

## Priority: MEDIUM
## Estimated Effort: 1-2 hours

---

## Context

Users often plan trips far in advance and want to see how many days until their next trip. This creates excitement and helps them prepare.

---

## Acceptance Criteria

- [x] AC1: Add `countdown` field to Trip type (computed from startDate)
- [x] AC2: Display countdown badge on trip cards (e.g., "in 5 days", "tomorrow", "today!")
- [x] AC3: Sort trips by upcoming first (nearest trip at top)
- [ ] AC4: Show "Past" section for completed trips
- [ ] AC5: Highlight the next upcoming trip prominently

---

## Cycle 191 Progress

**Completed (3/5 ACs):**
- ✅ AC1: Countdown computed dynamically from startDate (no storage needed)
- ✅ AC2: Color-coded countdown badge on trip cards
- ✅ AC3: "Upcoming" sort option (now default), sorts by days until trip

**Not yet done:**
- AC4: Past section (would require restructuring the UI)
- AC5: Highlight next trip (would require extra UI work

- Compute days until trip: `Math.ceil((new Date(startDate) - now) / (1000 * 60 * 60 * 24))`
- Display logic:
  - < 0: "Past"
  - 0: "Today!"
  - 1: "Tomorrow"
  - 2-7: "In X days"
  - 8+: "in X weeks" or "in X months"
- Use existing trip store, no new storage needed

---

## Test Scenarios

1. Trip in 5 days → shows "in 5 days"
2. Trip tomorrow → shows "Tomorrow"
3. Trip today → shows "Today!"
4. Past trip → shows "Past"
5. Refresh page → countdown persists (computed)

---

## Definition of Done

All 5 ACs complete, tested locally, committed to git.
