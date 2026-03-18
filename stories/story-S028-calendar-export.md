# Story S028: Calendar Export

## Feature: Export trip to iCal/Google Calendar

**As a** traveler  
**I want to** export my trip itinerary to my calendar app  
**So that** I can view my travel schedule alongside other commitments

---

## Acceptance Criteria

### AC1: Export Button
- [ ] Add "Export to Calendar" button in trip header area
- [ ] Button has calendar icon (Lucide)
- [ ] Button triggers export modal/function

### AC2: iCal File Generation
- [ ] Generate valid .ics file with trip activities
- [ ] Each activity becomes a calendar event
- [ ] Event includes: title, time, location, notes
- [ ] Flight events: departure/arrival times
- [ ] Hotel check-in/out as all-day or timed events

### AC3: Google Calendar Link
- [ ] Generate Google Calendar URL
- [ ] URL pre-fills: title, dates, description
- [ ] Opens in new tab

### AC4: Download Trigger
- [ ] Browser downloads .ics file on click
- [ ] Filename includes trip name and dates

---

## Technical Notes

- Use ics npm package or manual string generation
- Google Calendar link format: `https://calendar.google.com/calendar/render?action=TEMPLATE&text={title}&dates={start}/{end}&details={description}`
- Format dates as ISO 8601 (YYYYMMDDTHHMMSSZ)
- Activities without times become all-day events
