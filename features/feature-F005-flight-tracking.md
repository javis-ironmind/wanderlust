# Feature F005: Flight Tracking

## Description

Store and display flight information including airline, flight number, departure/arrival airports, times, terminals, gates, confirmation numbers, and seat assignments.

## Implementation

### Data Model
- Flight entity linked to Trip
- Nested departure/arrival objects
- Optional confirmation and seat fields

### Components Needed
- `FlightCard` - Compact flight display
- `FlightForm` - Add/edit flight modal
- `FlightList` - List of all flights for trip
- `FlightTimeline` - Visual timeline of flights

### Form Fields
- Airline (with logo autocomplete)
- Flight Number (e.g., "UA 123")
- Departure Airport (IATA code + city)
- Departure Terminal (optional)
- Departure Gate (optional)
- Departure Time (datetime picker)
- Arrival Airport (IATA code + city)
- Arrival Terminal (optional)
- Arrival Gate (optional)
- Arrival Time (datetime picker)
- Confirmation Number
- Seat Assignment
- Notes (textarea)
- Link to booking (URL)

## Acceptance Criteria
- [ ] AC1 - Can add flight with all fields
- [ ] AC2 - Flights display in chronological order
- [ ] AC3 - Airline shows logo/name from known airlines
- [ ] AC4 - Airport shown as "LAX - Los Angeles" format
- [ ] AC5 - Time shown in local timezone of location
- [ ] AC6 - Can edit existing flight
- [ ] AC7 - Can delete flight
- [ ] AC8 - Confirmation number prominent
- [ ] AC9 - Flight connects to specific day (arrival day)
- [ ] AC10 - Visual indicator if flight spans multiple days
