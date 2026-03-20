# T023: Trip Templates

## Priority: MEDIUM
## Estimated Effort: 2 hours

---

## Context

Users often plan similar trips (e.g., weekend city breaks, week-long beach vacations). Currently they have to recreate activities. Add ability to save trips as templates and create new trips from templates.

---

## Acceptance Criteria

- [x] AC1: "Save as Template" button in trip detail page
- [x] AC2: Template stores: name, days, activities (without dates), categories, notes structure
- [x] AC3: "New Trip from Template" option in trips list
- [x] AC4: Template list management (view, delete templates)
- [x] AC5: Templates stored in localStorage separately from trips
- [x] AC6: When creating from template, prompt for new dates

---

## Progress (Cycle 196)

**All ACs already implemented (pre-existing):**
- ✅ AC1: Save as Template button exists in trip detail page
- ✅ AC2: TripTemplate type in store, saves days/activities/categories
- ✅ AC3: "From Template" button in trips list page
- ✅ AC4: TemplateModal shows list with delete option
- ✅ AC5: localStorage 'wanderlust_templates' key
- ✅ AC6: New trip flow prompts for dates

**All ACs complete!**

---

## Technical Notes

- Templates stored in localStorage key 'wanderlust_templates'
- Template structure: { id, name, days, categories, createdAt }
- Don't copy: specific dates, photos, journal entries, budget

---

## Definition of Done

All 6 ACs complete, tested locally, committed to git.
