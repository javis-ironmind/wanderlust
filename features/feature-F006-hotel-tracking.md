# Feature F006: Hotel Tracking

## Description

Store and display hotel/accommodation information including name, address, coordinates, check-in/out times, confirmation number, room type, and notes.

## Implementation

### Data Model
- Hotel entity linked to Trip
- Geocoded coordinates for map
- Date range for stay

### Components Needed
- `HotelCard` - Compact hotel display
- `HotelForm` - Add/edit hotel modal
- `HotelList` - List of all hotels for trip
- `HotelTimeline` - Visual accommodation timeline

### Form Fields
- Hotel Name (required)
- Address (with autocomplete)
- Coordinates (auto-filled from address)
- Check-in Date & Time
- Check-out Date & Time
- Confirmation Number
- Room Type (e.g., "King Suite")
- Notes (textarea)
- Contact Phone
- Link to booking (URL)

## Acceptance Criteria
- [ ] AC1 - Can add hotel with all fields
- [ ] AC2 - Address autocomplete via geocoding
- [ ] AC3 - Coordinates auto-populated from address
- [ ] AC4 - Dates show as "Jan 15 - Jan 18, 2026 (3 nights)"
- [ ] AC5 - Can edit existing hotel
- [ ] AC6 - Can delete hotel
- [ ] AC7 - Confirmation number prominent
- [ ] AC8 - Hotel shows on map for relevant days
- [ ] AC9 - Night count automatically calculated
- [ ] AC10 - Check-in/out times displayed
