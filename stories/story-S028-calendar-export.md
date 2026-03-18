# Story S028: Calendar Export

## Feature: Export trip to iCal/Google Calendar

**As a** traveler  
**I want to** export my trip itinerary to my calendar app  
**So that** I can view my travel schedule alongside other commitments

---

## Acceptance Criteria

### AC1: Export Button
- [x] Add "Export to Calendar" button in trip header area
- [x] Button has calendar icon (Lucide)
- [x] Button triggers export modal/function

### AC2: iCal File Generation
- [x] Generate valid .ics file with trip activities
- [x] Each activity becomes a calendar event
- [x] Event includes: title, time, location, notes
- [x] Flight events: departure/arrival times
- [x] Hotel check-in/out as all-day or timed events

### AC3: Google Calendar Link
- [x] Generate Google Calendar URL
- [x] URL pre-fills: title, dates, description
- [x] Opens in new tab

### AC4: Download Trigger
- [x] Browser downloads .ics file on click
- [x] Filename includes trip name and dates

---

## Technical Notes

- Use ics npm package or manual string generation
- Google Calendar link format: `https://calendar.google.com/calendar/render?action=TEMPLATE&text={title}&dates={start}/{end}&details={description}`
- Format dates as ISO 8601 (YYYYMMDDTHHMMSSZ)
- Activities without times become all-day events
