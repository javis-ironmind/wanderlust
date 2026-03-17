# Feature F002: Day Structure

## Description

Manage the day-by-day structure of a trip. Each day has a name, date, and contains activities. Days can be added, removed, and reordered.

## Implementation

### Data Model
- Day entity linked to Trip
- Auto-generate day names (Day 1, Day 2...)
- Date sequence based on trip start/end

### Components Needed
- `DayList` - Vertical list of days
- `DayHeader` - Day title with date
- `DayAddButton` - Add new day action
- `DayReorder` - Drag handle for day reordering

### Interactions
- Click "+" to add day at end
- Drag days to reorder
- Click day name to rename
- Swipe or button to delete day

## Acceptance Criteria
- [ ] AC1 - Days auto-generated based on trip date range
- [ ] AC2 - Can manually add extra days beyond date range
- [ ] AC3 - Can delete a day (with confirmation if has activities)
- [ ] AC4 - Can reorder days via drag-and-drop
- [ ] AC5 - Day header shows "Day X - City/Location" format
- [ ] AC6 - Date displayed under day name
- [ ] AC7 - Activity count badge on each day
- [ ] AC8 - Smooth animation when adding/removing days
