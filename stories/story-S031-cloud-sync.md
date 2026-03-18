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
- [ ] Add "Enable Cloud Sync" toggle in trip settings (component built, needs integration)
- [ ] When enabled, trips auto-sync to cloud on changes (needs store integration)
- [x] Show sync status indicator (synced/syncing/offline)
- [ ] Handle offline mode gracefully (queue changes, sync when online)

---

## Cycle 100 Progress

**Completed:**
- Prisma 7 setup with schema (User, Trip, Day, Activity, SyncQueue models)
- Database client singleton (lib/db.ts)
- API routes: /api/trips, /api/trips/[id]
- SyncStatus component with online/offline detection

**Remaining:**
- Integrate toggle into trip settings UI
- Hook up sync to Zustand store
- Implement offline queue with Service Worker

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
