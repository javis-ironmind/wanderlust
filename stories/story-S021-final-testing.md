# Story S021 - Final Testing & Polish

**Feature:** Quality Assurance
**Story Points:** 5
**Priority:** High

## Description
Final testing and polish before calling the project feature-complete.

## Acceptance Criteria

- [ ] AC1 - E2E: Create comprehensive Playwright test suite covering all major flows
- [ ] AC2 - E2E: Trip creation flow works end-to-end
- [ ] AC3 - E2E: Activity management (CRUD) works
- [ ] AC4 - E2E: Drag-drop reordering works within and between days
- [ ] AC5 - E2E: Map displays pins and route correctly
- [ ] AC6 - Accessibility: Run axe-core and fix critical issues
- [ ] AC7 - Performance: Lighthouse score > 80 on desktop
- [ ] AC8 - Browser: Test on Chrome, Firefox, Safari (or document limitations)
- [ ] AC9 - Error handling: No console errors on any flow
- [ ] AC10 - Build: `npm run build` passes with no errors

## E2E Test Requirements
- Trip creation → add activities → reorder → verify persistence
- Map integration test
- Responsive on mobile viewport

## Implementation Notes
- Use existing Playwright setup
- Run `npx playwright test`
- Document any known limitations
