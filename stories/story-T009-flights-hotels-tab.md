# Story T009 - Flights & Hotels Tab

**Priority:** High

## Description
Add a new tab to the trip detail page for viewing and managing flights and hotels

## Background
The store already supports flights and hotels (T005 created the forms), but there's no UI to view/edit them. Currently they're just stored but not displayed.

## Acceptance Criteria

- [x] AC1 - Add "Flights & Hotels" tab to the tab bar (next to Itinerary, Budget, etc.)
- [x] AC2 - Display flights as cards with airline, flight number, times, airports
- [x] AC3 - Display hotels as cards with name, check-in/out dates, confirmation number
- [x] AC4 - "Add Flight" button opens FlightForm (reuse existing component)
- [x] AC5 - "Add Hotel" button opens HotelForm (reuse existing component)
- [x] AC6 - Edit/Delete actions available on each flight and hotel card

## Technical Notes
- Use existing FlightForm and HotelForm components from src/components/
- Store already has addFlight, updateFlight, deleteFlight actions
- Store already has addHotel, updateHotel, deleteHotel actions
- FlightForm and HotelForm should work with the store via useTripStore

## Implementation Summary
- Added 'flights' to activeTab type
- Added "✈️ Flights" tab to tab bar
- Added FlightForm and HotelForm imports
- Added showFlightModal and showHotelModal state
- Added Flights & Hotels section with cards showing flight/hotel data
- Added modal wrappers for FlightForm and HotelForm

## E2E Tests
- [ ] Test new tab appears in tab bar
- [ ] Test adding a flight shows it in the list
- [ ] Test adding a hotel shows it in the list
- [ ] Test edit flight updates the card
- [ ] Test delete flight removes from list
