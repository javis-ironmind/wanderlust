# Story T016 - Trip Reminders

## Priority: MEDIUM
## Estimated Effort: 2-3 hours

---

## Context

Users need reminders for important trip events like:
- Flight check-in times
- Hotel check-in/check-out
- Activity start times
- Document expiration warnings

---

## Acceptance Criteria

- [x] AC1: Add `reminder` field to Activity type (optional, defaults to null)
- [x] AC2: Create ReminderSettings component with time options (15min, 30min, 1hr, 2hr, 1day before)
- [x] AC3: Integrate reminder picker into AddActivityForm (in trip detail page modal)
- [x] AC4: Store reminders in localStorage with tripId + activityId + reminderTime
- [x] AC5: Display upcoming reminders in trip detail header (bell icon with count badge)
- [x] AC6: Clicking bell shows dropdown of upcoming reminders with times
- [x] AC7: Browser notifications permission request on first reminder set
- [x] AC8: Send browser notification at reminder time (if permitted)

---

## Cycle 186 Progress

**Completed (8/8 ACs):**
- ✅ AC1: Added `reminder?: number` to Activity type in src/lib/types.ts
- ✅ AC2: Created ReminderSettings.tsx with time options dropdown
- ✅ AC3: Integrated ReminderSettings into trip detail page add activity modal
- ✅ AC4: Created src/lib/reminders.ts with localStorage storage functions
- ✅ AC5: Created ReminderBell.tsx component with badge count
- ✅ AC6: Dropdown shows upcoming reminders with formatted times
- ✅ AC7: Browser notifications permission request on first reminder set - requests permission when toggled on, shows status indicator
- ✅ AC8: Notification sending logic in checkReminders() function

---

## Technical Notes

- Use Notification API for browser notifications
- Check for due reminders every minute when app is open
- Store reminder metadata in localStorage separate from activity data
- Graceful fallback if notifications not permitted (show in-app only)

---

## Test Scenarios

1. Add activity with reminder → reminder appears in dropdown
2. Set reminder for 1 minute from now → notification fires
3. Remove reminder → disappears from list
4. Multiple reminders → sorted by time in dropdown
5. Notifications blocked → shows in-app only warning

---

## Definition of Done

All 8 ACs complete, tested locally, committed to git.
