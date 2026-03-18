# Story S031 - Cloud Sync Foundation

## Phase: 2 (Enhanced Features)
## Priority: HIGH - Enables collaboration & multi-device

---

## Context

Users need their trips to sync across devices. This requires a cloud backend to store trip data and enable future collaboration features.

---

## Acceptance Criteria

- [x] Set up Vercel Postgres database schema for trips, days, activities
- [x] Create API endpoints for CRUD operations (GET/POST/PUT/DELETE trips)
- [x] Add "Enable Cloud Sync" toggle in trip settings (component built, integrated into trip detail page)
- [x] When enabled, trips auto-sync to cloud on changes (sync actions + debounced auto-sync in store)
- [x] Show sync status indicator (synced/syncing/offline)
- [x] Handle offline mode gracefully (queue changes, sync when online)

---

## Cycle 104 Progress

**Completed (6/6 ACs):**
- ✅ AC3: CloudSyncSettings component integrated into trip detail page (src/app/trips/[tripId]/page.tsx)
- ✅ AC4: Auto-sync on changes - added debounced sync to addTrip, updateTrip, deleteTrip, addActivity, updateActivity, deleteActivity in store.ts
- ✅ All ACs now complete

---

## Technical Notes

- Use Vercel Postgres with Prisma ORM
- JWT-based simple auth (email/password)
- Optimistic UI updates with background sync
- Service worker for offline detection

---

## Test Scenarios

1. Create trip with cloud sync - appears in database
2. Edit trip offline - queued, syncs when online
3. Open app on different device - trips load from cloud
4. Toggle sync off - trips remain local only
5. Sync status shows correctly in UI
