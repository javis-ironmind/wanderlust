# T020: Trip Statistics Dashboard

## Priority: MEDIUM
## Estimated Effort: 2 hours

---

## Context

Users want to see their travel statistics - total trips, days traveled, countries visited, etc. This adds gamification and helps users understand their travel patterns.

---

## Acceptance Criteria

- [x] AC1: Add statistics section to trips list page (or a dedicated /stats page)
- [x] AC2: Display total trip count
- [x] AC3: Display total days traveled across all trips
- [x] AC4: Display countries/locations visited (extract from trips)
- [x] AC5: Display average trip duration
- [x] AC6: Display upcoming trip countdown

---

## Progress (Cycle 193)

**Completed (6/6 ACs):**
- ✅ AC1: Statistics dashboard at top of trips list
- ✅ AC2: Total trips counter
- ✅ AC3: Total days traveled (calculated from start/end dates)
- ✅ AC4: Locations visited (extracted from activity locations)
- ✅ AC5: Average trip duration
- ✅ AC6: Days until next trip (green highlight badge)

**All ACs complete!**

---

## Technical Notes

- Compute stats from existing trip data in store
- Use startDate/endDate to calculate days
- Extract location from day activities or trip description
- No new storage needed - compute on render

---

## Test Scenarios

1. No trips → show "Start your first trip!"
2. One trip → show correct stats
3. Multiple trips → aggregate correctly
4. Past trips → include in stats

---

## Definition of Done

All 6 ACs complete, tested locally, committed to git.
