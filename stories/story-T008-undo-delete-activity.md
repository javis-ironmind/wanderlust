# Story T008 - Undo Delete Activity

**Priority:** High

## Description
Implement undo functionality for deleted activities, completing the feature that T007 marked as needing "deeper store integration"

## Background
T007 added toast notifications but noted: "undo feature requires deeper store integration". This story completes that loop.

## Acceptance Criteria

- [x] AC1 - Store maintains deleted activity in a "recentlyDeleted" queue (max 5 items)
- [x] AC2 - Delete action triggers toast with "Undo" button (visible for 5 seconds)
- [x] AC3 - Undo restores activity to original position in itinerary
- [x] AC4 - After 5 seconds, permanently remove from queue
- [x] AC5 - Queue clears on page refresh (intentional - prevents stale state)

## Technical Notes
- Use zustand middleware or subscribe pattern to manage undo queue
- Toast component needs "action" button support (not just message)
- Track: activityId, originalIndex, dayIndex, deletedAt timestamp

## Implementation Summary
- Added `undoQueue` to TripState interface
- Modified `deleteActivity` to save deleted activity to undo queue
- Added `undoDeleteActivity` action to restore
- Added `clearExpiredUndoItems` and `clearUndoQueue` actions
- Exported undo actions via `useTripActions` hook

## E2E Tests
- [ ] Test delete shows undo toast
- [ ] Test undo restores activity to correct position
- [ ] Test toast auto-dismisses after 5 seconds
- [ ] Test refresh clears undo queue
