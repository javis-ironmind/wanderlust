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
- [ ] AC1 - Can create trip with name, description, dates, cover image URL
- [ ] AC2 - Trip automatically calculates and displays duration (X days)
- [ ] AC3 - Can edit all trip metadata inline
- [ ] AC4 - Can delete trip with confirmation
- [ ] AC5 - Trips persist after page refresh (localStorage)
- [ ] AC6 - Empty state shown when no trips exist
- [ ] AC7 - Trip cards display cover image, name, dates, day count
- [ ] AC8 - Cover image falls back to gradient placeholder if not set
