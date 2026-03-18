# Story S021 - Final Testing & Polish

**Feature:** Quality Assurance
**Story Points:** 5
**Priority:** High

## Description
Final testing and polish before calling the project feature-complete.

## Acceptance Criteria

- [x] AC1 - E2E: Create comprehensive Playwright test suite covering all major flows (42 tests exist)
- [x] AC2 - E2E: Trip creation flow works end-to-end (wanderlust.spec.ts)
- [x] AC3 - E2E: Activity management (CRUD) works (s005, s008 tests)
- [x] AC4 - E2E: Drag-drop reordering works within and between days (s009-010 tests)
- [x] AC5 - E2E: Map displays pins and route correctly (s013, s014, s015 tests)
- [ ] AC6 - Accessibility: Run axe-core and fix critical issues
- [ ] AC7 - Performance: Lighthouse score > 80 on desktop
- [ ] AC8 - Browser: Test on Chrome, Firefox, Safari (or document limitations)
- [x] AC9 - Error handling: No console errors on any flow (tests pass)
- [x] AC10 - Build: `npm run build` passes with no errors

## E2E Test Requirements
- Trip creation → add activities → reorder → verify persistence
- Map integration test
- Responsive on mobile viewport

## Implementation Notes
- Use existing Playwright setup
- Run `npx playwright test`
- Document any known limitations
