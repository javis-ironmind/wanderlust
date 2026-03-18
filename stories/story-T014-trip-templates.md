# Story T014 - Trip Templates

**Priority:** Medium

## Description
Allow users to save any trip as a template and create new trips from templates. This accelerates trip creation for recurring trip types (annual vacations, business trips, weekend getaways).

## Background
Users often plan similar trips repeatedly (annual beach vacation, quarterly business trips). Instead of recreating the same activities each time, templates let users save a trip structure and reuse it.

## Acceptance Criteria

- [x] AC1 - "Save as Template" option in trip settings
- [x] AC2 - Template stores: trip name pattern, days structure, activity types, default notes
- [x] AC3 - "Create from Template" option on trips page
- [x] AC4 - Template picker shows preview of template structure
- [x] AC5 - Templates list in settings (view, delete, rename)
- [x] AC6 - Option to include or exclude dates in template

## Technical Notes
- Store templates in localStorage under `wanderlust_templates`
- Template structure: { id, name, days: [{ activities: [{ type, title, duration, notes }] }], createdAt }
- When creating from template: generate new IDs, reset dates to user's chosen range

## Implementation Summary
*(To be filled after implementation)*

## Implementation Summary (2026-03-18)
Implemented trip templates feature with the following changes:

1. **Added types** (`src/lib/types.ts`):
   - Added `TripTemplate`, `TemplateDay`, `TemplateActivity` types

2. **Added store actions** (`src/lib/store.ts`):
   - `saveTripAsTemplate(tripId, name, description, includeDates)` - Saves trip structure as template
   - `createTripFromTemplate(templateId, name, startDate, endDate)` - Creates new trip from template
   - `deleteTemplate(templateId)` - Deletes a template
   - `updateTemplate(templateId, updates)` - Updates template metadata
   - `loadTemplates()` - Loads templates from localStorage
   - Templates persisted in localStorage under `wanderlust_templates`

3. **Created TemplateModal component** (`src/components/TemplateModal.tsx`):
   - Supports both "save" and "load" modes
   - Shows template list with preview (days count, activity count)
   - Date range picker for creating trips from templates

4. **Integrated into trip detail page** (`src/app/trips/[tripId]/page.tsx`):
   - Added "Save as Template" button in trip header
   - Template modal opens with trip structure pre-filled

5. **Integrated into trips list page** (`src/app/trips/page.tsx`):
   - Added "From Template" button alongside "Create New Trip"
   - Allows creating new trips from saved templates

**Files modified:**
- src/lib/types.ts
- src/lib/store.ts
- src/components/TemplateModal.tsx (new)
- src/app/trips/[tripId]/page.tsx
- src/app/trips/page.tsx
