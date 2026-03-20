# Feature F003: Activity Items

## Description

Add, edit, and manage individual activities within each day. Activities include time, location, category, notes, and cost.

## Implementation

### Data Model
- Activity entity with all fields
- Category enum (transport, food, sightseeing, etc.)
- Time stored as HH:mm string
- Location with geocoding support

### Components Needed
- `ActivityCard` - Single activity display
- `ActivityForm` - Add/edit activity modal
- `ActivityTime` - Time picker component
- `ActivityCategoryIcon` - Icon by category
- `ActivityLocation` - Location input with autocomplete

### Form Fields
- Title (required)
- Description (optional)
- Category (dropdown)
- Start Time (time picker)
- End Time (time picker)
- Location (search + manual)
- Notes (textarea)
- Cost + Currency
- Links (URL list)

## Acceptance Criteria
- [x] AC1 - Can add activity to any day — **2026-03-19 19:02 UTC**: Day tabs select day, "+ Add" FAB opens modal, activities added to selectedDay. Quick add per-day also available.
- [x] AC2 - All form fields functional and validated — **2026-03-19 19:30 UTC**: All form fields present and functional: name, category dropdown, start/end datetime pickers, location search with Nominatim geocoding, notes textarea, cost input, links URL input, reminder select. Notes/links added to Activity type, Add modal, Edit modal, and handlers.
- [x] AC3 - Category selection with icon display — **2026-03-19**: Category select in form + emoji badges on activity cards (✈️🏨🍽️🎯📍)
- [x] AC4 - Time picker for start/end times — **2026-03-19**: datetime-local inputs for start/end times in form
- [x] AC5 - Location search with Leaflet Geocoding — **2026-03-19 19:42 UTC**: Added LocationMapPreview component (react-leaflet MapContainer + TileLayer + Marker). Map appears in both Add Activity and Edit Activity modals when a location is selected, showing a 120px map with the selected pin and location name. Nominatim geocoding already implemented in previous cycles.
- [x] AC6 - Can edit existing activity — **2026-03-19 19:10 UTC**: Edit button (✏️) on each activity card, Edit Activity modal pre-populated with activity data, handleEditActivity updates activity in state and localStorage.
- [x] AC7 - Can delete activity with confirmation — **2026-03-19 19:20 UTC**: Delete button (🗑️) on each activity card, confirmation modal with Cancel/Delete, handleDeleteActivity removes from state and localStorage.
- [x] AC8 - Activities display in chronological order by start time — **2026-03-19**: sortActivitiesByTime() used when rendering activity lists
- [x] AC9 - Category shown as colored badge/icon — **2026-03-19**: Emoji badge with colored background (#eff6ff) on activity cards
- [x] AC10 - Empty state when day has no activities — **2026-03-19**: "No activities yet" message shown when day.activities is empty
