# Story T007 - Import Markdown to Trip

**Priority:** Medium

## Description
Allow users to import Markdown files containing trip itineraries

## Acceptance Criteria

- [ ] AC1 - File picker or drag-drop to upload .md file
- [ ] AC2 - Parse MD content into activities
- [ ] AC3 - Support for day headers (## Day 1, ## Day 2)
- [ ] AC4 - Support for activity items (- Activity name at 2pm)
- [ ] AC5 - Preview before import
- [ ] AC6 - Conflict resolution if trip has existing activities

## MD Format Support
```markdown
## Day 1 - Arrival
- Arrive at hotel at 3pm
- Dinner at Restaurant X at 7pm

## Day 2 - Exploring
- Visit Museum at 10am
- Lunch at 12pm
```

## E2E Tests
- Test file upload works
- Test MD parses correctly
- Test preview shows activities

## Notes
- Common use case: copy itinerary from Notion, Obsidian, etc.
