# Story T007 - Import Markdown to Trip

**Priority:** Medium

## Description
Allow users to import Markdown files containing trip itineraries

## Acceptance Criteria

- [x] AC1 - File picker or drag-drop to upload .md file
- [x] AC2 - Parse MD content into activities
- [x] AC3 - Support for day headers (## Day 1, ## Day 2)
- [x] AC4 - Support for activity items (- Activity name at 2pm)
- [x] AC5 - Preview before import
- [x] AC6 - Conflict resolution if trip has existing activities

## MD Format Support
```markdown
## Day 1 - Arrival
- Arrive at hotel at 3pm
- Dinner at Restaurant X at 7pm

## Day 2 - Exploring
- Visit Museum at 10am
- Lunch at 12pm
```

## Implementation

### File: src/lib/markdown-parser.ts
```typescript
// Parse markdown into trip structure
export function parseMarkdownToTrip(md: string): {
  days: Array<{
    title: string;
    activities: Array<{ title: string; time?: string }>;
  }>;
} {
  // Parse ## Day X headers and - items
}
```

### File: src/components/ImportMarkdown.tsx
```tsx
// File upload + preview component
```

### File: src/app/trips/[tripId]/ImportButton.tsx
```tsx
// Button to open import modal
```

## E2E Tests
- [x] Test file upload works
- [x] Test MD parses correctly
- [x] Test preview shows activities
