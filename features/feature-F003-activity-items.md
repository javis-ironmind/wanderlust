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
- [ ] AC1 - Can add activity to any day
- [ ] AC2 - All form fields functional and validated
- [ ] AC3 - Category selection with icon display
- [ ] AC4 - Time picker for start/end times
- [ ] AC5 - Location search with Mapbox Geocoding
- [ ] AC6 - Can edit existing activity
- [ ] AC7 - Can delete activity with confirmation
- [ ] AC8 - Activities display in chronological order by start time
- [ ] AC9 - Category shown as colored badge/icon
- [ ] AC10 - Empty state when day has no activities
