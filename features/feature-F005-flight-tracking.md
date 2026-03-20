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
- [x] AC1 - Can add flight with all fields — **2026-03-19 20:30 UTC**: FlightForm fully implemented with all fields (airline autocomplete with 20 airlines, airport autocomplete with 40 airports, flight number, departure/arrival airports+cities+times, terminal, gate, seat, confirmation, cost, currency, notes). + Flight button opens FlightForm modal, onSubmit calls addFlight to store. Store addFlight/updateFlight/deleteFlight methods all implemented.
- [x] AC2 - Flights display in chronological order — **2026-03-19 20:35 UTC**: Added sort to flights rendering: `[...trip.flights].sort((a, b) => ...)` by departureTime. Flights with no departureTime sort to end (Infinity). Renders in Flights & Hotels section on trip detail page.
- [x] AC3 - Airline shows logo/name from known airlines — **2026-03-19 21:02 UTC**: Added AIRLINE_NAMES lookup map + getAirlineDisplay() function. Flight card now shows full airline name (e.g., "United Airlines UA123") instead of just code.
- [x] AC4 - Airport shown as "LAX - Los Angeles" format — **2026-03-19 20:52 UTC**: Updated flight card display to show `{departureAirport} - {departureCity}` → `{arrivalAirport} - {arrivalCity}` when city data exists, falls back to airport code only if no city.
- [x] AC5 - Time shown in local timezone of location — **2026-03-19 21:32 UTC**: Added `AIRPORT_TIMEZONES` mapping (IANA timezone identifiers for 38 airports) and `formatTimeInAirportTimezone()` helper. Flight card now displays departure and arrival times formatted in each airport's local timezone using `Intl.DateTimeFormat`.
- [x] AC6 - Can edit existing flight — **2026-03-19 20:42 UTC**: Added `editingFlight` state, `Flight` type definition, and edit button onClick that sets editingFlight and opens FlightForm modal. FlightForm receives `flight={editingFlight}` prop and onClose clears editingFlight.
- [x] AC7 - Can delete flight — **2026-03-19 21:13 UTC**: Added `deleteConfirmFlightId` state + `useTripStore().deleteFlight`. Delete button sets confirmation state. Confirmation modal appears with Cancel/Delete. On confirm, calls `deleteFlight(tripId, flightId)`.
- [x] AC8 - Confirmation number prominent — **2026-03-19 21:22 UTC**: Changed confirmation number to badge/pill style with light blue background (#dbeafe), dark blue text (#1d4ed8), rounded corners, and airplane emoji prefix.
- [x] AC9 - Flight connects to specific day (arrival day) — **2026-03-19 21:43 UTC**: Added `AIRPORT_COORDINATES` mapping (38 airports with lat/lng), `getFlightMarkers()` function filtering flights by selected day (flight relevant if selected day falls between departure/arrival dates), and `flightMarkers` useMemo. TripMap receives merged markers (activities + flights) with route only from activity markers.
- [x] AC10 - Visual indicator if flight spans multiple days — **2026-03-19 21:45 UTC**: Added inline check comparing departure/arrival `toDateString()`. When dates differ, a "Multi-day" badge (yellow/amber pill) appears next to the time display in the flight card.
