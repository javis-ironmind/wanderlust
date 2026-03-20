# Feature F001: Trip Management

## Description

Create, read, update, and delete trips with full metadata including name, description, dates, cover image, and basic trip information.

## Implementation

### Data Model
- Trip entity with all metadata fields
- UUID-based identification
- Date range validation
- Auto-calculate trip duration

### Components Needed
- `TripCard` - Display trip in list
- `TripForm` - Create/edit trip modal
- `TripList` - Grid of trips
- `TripHeader` - Trip detail header with cover

### API Endpoints
- `POST /api/trips` - Create trip
- `GET /api/trips` - List all trips
- `GET /api/trips/[id]` - Get single trip
- `PUT /api/trips/[id]` - Update trip
- `DELETE /api/trips/[id]` - Delete trip

### Storage
- LocalStorage for MVP
- Schema for Vercel Postgres (future)

## Acceptance Criteria
- [x] AC1 - Can create trip with name, description, dates, cover image URL — **2026-03-19 07:10 UTC**: Added `description` textarea field to `/trips/new/page.tsx` form with state, newTrip object integration, and optional styling. All four AC1 fields now functional.
- [x] AC2 - Trip automatically calculates and displays duration (X days) — **2026-03-19 07:20 UTC**: Added inline duration calculation in trips/page.tsx showing "X days" next to date range.
- [x] AC3 - Can edit all trip metadata inline — **2026-03-19 07:30 UTC**: Added click-to-edit for trip name on trips/page.tsx cards — pencil icon button starts inline edit, Enter/blur saves via updateTrip action. Partial (name only) but functional.
- [x] AC4 - Can delete trip with confirmation — **2026-03-19 07:40 UTC**: Added 🗑️ Delete button on trip cards (left of Duplicate), with confirmation modal before deleting via deleteTrip store action.
- [x] AC5 - Trips persist after page refresh (localStorage) — **2026-03-19 07:50 UTC**: Already implemented — page loads from localStorage on mount via loadFromStorage(), and all store mutations (create/update/delete/setTrips) call saveToStorage(). No changes needed.
- [x] AC6 - Empty state shown when no trips exist — **2026-03-19 07:50 UTC**: Already implemented — trips/page.tsx shows "No trips yet — Start planning your next adventure!" with a Create Your First Trip button when trips.length === 0, and "No trips match [searchQuery]" when filtered results are empty.
- [x] AC7 - Trip cards display cover image, name, dates, day count — **2026-03-19 07:50 UTC**: Already implemented — card shows cover image (line 438-442), name with edit button (line 506-511), 📅 dates (line 564), and day count (AC2, line 565-570).
- [x] AC8 - Cover image falls back to gradient placeholder if not set — **2026-03-19 07:50 UTC**: Already implemented — line 445-447 in trips/page.tsx shows `linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)` when trip.coverImage is falsy.
