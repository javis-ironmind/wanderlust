# Story S003: Create Trip Store with Zustand (SPLIT)

> **SPLIT** - See story-S003a-zustand-basic for initial setup

## As a
Developer

## I want
Global state management for trips using Zustand

## So that
App can manage trip data globally

## Acceptance Criteria
- [x] AC1 - Zustand store created in src/lib/store.ts
- [x] AC2 - trips array in store state
- [x] AC3 - currentTripId in store state
- [x] AC4 - Actions: addTrip, updateTrip, deleteTrip, setCurrentTrip
- [x] AC5 - Actions: addDay, updateDay, deleteDay, reorderDays
- [x] AC6 - Actions: addActivity, updateActivity, deleteActivity, reorderActivities
- [x] AC7 - Actions: addFlight, updateFlight, deleteFlight
- [x] AC8 - Actions: addHotel, updateHotel, deleteHotel
- [x] AC9 - TypeScript types for store state and actions
- [x] AC10 - Store exports useTrip and useTripActions hooks
