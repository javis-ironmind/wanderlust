# Story S031 - Cloud Sync Foundation

## Phase: 2 (Enhanced Features)
## Priority: HIGH - Enables collaboration & multi-device

---

## Context

Users need their trips to sync across devices. This requires a cloud backend to store trip data and enable future collaboration features.

---

## Acceptance Criteria

- [ ] Set up Vercel Postgres database schema for trips, days, activities
- [ ] Create API endpoints for CRUD operations (GET/POST/PUT/DELETE trips)
- [ ] Add "Enable Cloud Sync" toggle in trip settings
- [ ] When enabled, trips auto-sync to cloud on changes
- [ ] Show sync status indicator (synced/syncing/offline)
- [ ] Handle offline mode gracefully (queue changes, sync when online)

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
