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
- [x] AC1 - Can add hotel with all fields — **2026-03-19 22:45 UTC**: Added "+ Add Hotel" button in Hotels section header that opens HotelForm in add mode (sets editingHotel to null). HotelForm already had all fields (name, address, check-in/out dates/times, confirmation number, room type, phone, email, website, notes, cost, currency). Now users can actually add hotels.
- [x] AC2 - Address autocomplete via geocoding — **2026-03-19 22:56 UTC**: Replaced simple address input with LocationSearch component in HotelForm. Uses Nominatim (OpenStreetMap) geocoding API for free autocomplete with debounced search, dropdown results, loading states, and manual entry fallback.
- [x] AC3 - Coordinates auto-populated from address — **2026-03-19 22:56 UTC**: LocationSearch returns latitude/longitude when a geocoded result is selected. HotelForm stores these in latitude/longitude state and includes them in hotel data on submit. Shows "✓ Coordinates: X.XXXXXX, Y.YYYYYY" confirmation in form when coordinates are set.
- [x] AC4 - Dates show as "Jan 15 - Jan 18, 2026 (3 nights)" — **2026-03-19 21:52 UTC**: Added `formatHotelDateRange()` helper that formats check-in as "Mon Day", check-out as "Mon Day, Year", and calculates nights. Hotel card now shows "Mar 19 - Mar 22, 2026 (3 nights)" format.
- [x] AC5 - Can edit existing hotel — **2026-03-19 22:03 UTC**: Added `editingHotel` state, wired Edit button onClick to set `editingHotel` and open modal, passed `editingHotel` prop to HotelForm, reset state on close.
- [x] AC6 - Can delete hotel with confirmation — **2026-03-19 22:14 UTC**: Added `deleteConfirmHotelId` state, wired Delete button to show confirmation modal, calls `deleteHotel()` on confirm. Modal follows same pattern as flight delete confirmation.
- [x] AC7 - Confirmation number prominent — **2026-03-19 22:34 UTC**: Changed confirmation number styling to 0.9rem font, fontWeight 600, brighter purple (#7c3aed), added ✦ prefix for visual emphasis.
- [x] AC8 - Hotel shows on map for relevant days — **2026-03-19 23:05 UTC**: Added `getHotelMarkers()` function and `hotelMarkers` useMemo. Filters hotels that have coordinates and where the selected day date falls within check-in/check-out range. Hotels displayed as category='hotel' markers on map alongside activity and flight markers.
- [x] AC9 - Night count automatically calculated — **2026-03-19 22:04 UTC**: Already done via formatHotelDateRange which calculates and displays nights (e.g., "(3 nights)"). Confirmed in hotel card output.
- [x] AC10 - Check-in/out times displayed — **2026-03-19 22:23 UTC**: Added time display line below date range showing check-in and check-out times when available. Format: "Check-in: 3:00 PM → Check-out: 11:00 AM".
