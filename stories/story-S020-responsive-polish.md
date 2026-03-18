# Story S020 - Responsive Polish

**Feature:** UI Polish
**Story Points:** 3
**Priority:** Medium

## Description
Ensure responsive design works across desktop, tablet, and mobile.

## Acceptance Criteria

- [ ] AC1 - Desktop (1200px+): Full 2-column layout
- [ ] AC2 - Tablet (768-1199px): Collapsible sidebar, stacked map
- [ ] AC3 - Mobile (<768px): Single column, bottom sheet for map
- [ ] AC4 - Touch drag-drop works on tablet
- [ ] AC5 - Forms usable on tablet
- [ ] AC6 - Map usable on tablet
- [ ] AC7 - No horizontal scroll on any size
- [ ] AC8 - Text readable at all sizes
- [ ] AC9 - Buttons large enough for touch
- [ ] AC10 - Loading states at all sizes

## E2E Test Requirements
- Test responsive layout at different breakpoints
- Test touch interactions work on tablet viewport
- Test forms are usable on mobile

## Implementation Notes
- Use Magic UI for responsive components
- Tailwind responsive classes
- Test with Playwright viewport sizes
