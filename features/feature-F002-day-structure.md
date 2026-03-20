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
- [x] AC1 - Days auto-generated based on trip date range — **2026-03-19 17:45 UTC**: Implemented in /trips/new/page.tsx handleSubmit - loops from startDate to endDate, creates Day objects with id/date/activities array
- [x] AC2 - Can manually add extra days beyond date range — **2026-03-19 17:55 UTC**: Added extraDayDate state, showExtraDayInput toggle, handleAddExtraDay function, and "+ Add Extra Day" button with date input in trip detail page. New day sorted by date, duplicates checked, persists to localStorage.
- [x] AC3 - Can delete a day (with confirmation if has activities) — **2026-03-19 18:05 UTC**: Added 🗑️ delete button to each day header, handleDeleteDay checks for activities and shows confirmation modal if day has activities, handleConfirmDeleteDay deletes and persists to localStorage.
- [x] AC4 - Can reorder days via drag-and-drop — **2026-03-19 18:15 UTC**: Added draggable attribute and drag event handlers (handleDragStart, handleDragOver, handleDrop, handleDragEnd) to day cards. Dragged day shows opacity change, drop target shows blue border and scale. Days reorder on drop and persist to localStorage.
- [x] AC5 - Day header shows "Day X - City/Location" format — **2026-03-19 18:25 UTC**: Added `location?: string` field to Day interface (types.ts and local type in page.tsx). Day creation in new/page.tsx and handleAddExtraDay set location = trip.name. Day header and tab bar now show "Day X - Location" format.
- [x] AC6 - Date displayed under day name — **2026-03-19 18:30 UTC**: Already implemented in current code - day.date shown in the p element below the Day/Location h3 heading.
- [x] AC7 - Activity count badge on each day — **2026-03-19 18:42 UTC**: Replaced text activity count with a colored badge (blue when >0, gray when 0) showing the count number in a pill shape.
- [x] AC8 - Smooth animation when adding/removing days — **2026-03-19 18:52 UTC**: Added fade-out animation (opacity 0, scale 0.95, 300ms) when deleting days. Added fadeIn keyframe animation for newly added days. Added deletingDayId and newlyAddedDayId states to track animation targets.
- [x] AC9 - Future enhancements (TBD) — **2026-03-20 08:50 UTC**: Placeholder for future work. No current requirements defined. Feature F002 otherwise complete.
