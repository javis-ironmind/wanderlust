# T022: Dark Mode Support

## Priority: MEDIUM
## Estimated Effort: 2 hours

---

## Context

Users want to use the app in dark mode, especially for late-night planning. Currently the app is light-themed. Add a toggle to switch between light and dark themes.

---

## Acceptance Criteria

- [ ] AC1: Add theme toggle button in trips list header
- [ ] AC2: Implement dark theme color palette
- [ ] AC3: Persist theme preference to localStorage
- [ ] AC4: Apply dark theme to trips list page
- [ ] AC5: Apply dark theme to trip detail page
- [ ] AC6: System preference detection on first load

---

## Technical Notes

- Add `theme: 'light' | 'dark'` to localStorage
- Use CSS variables or inline styles with theme-aware colors
- Default to system preference: `window.matchMedia('(prefers-color-scheme: dark)').matches`

---

## Dark Theme Colors

- Background: #0f172a (slate-900)
- Surface: #1e293b (slate-800)
- Text: #f1f5f9 (slate-100)
- Accent: #3b82f6 (blue-500)

---

## Definition of Done

All 6 ACs complete, tested locally, committed to git.
