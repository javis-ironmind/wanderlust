# Story T013 - Trip Sharing

**Priority:** High

## Description
Allow users to share their trips with others via a unique link. Shared users can view (and optionally edit) the trip.

## Background
Users often plan trips with friends, family, or colleagues. Being able to share the trip itinerary via a link makes collaboration easy without requiring account creation.

## Acceptance Criteria

- [x] AC1 - Generate unique shareable link for each trip (e.g., `/trip/[id]/shared`)
- [x] AC2 - Shared link shows read-only view of trip (or editable if owner enables)
- [x] AC3 - Copy-to-clipboard button for easy sharing
- [x] AC4 - Option to enable/disable sharing in trip settings
- [x] AC5 - QR code generation for shareable link
- [x] AC6 - Track how many times a trip has been viewed/shared (optional analytics)

## Technical Notes
- Generate unique ID using crypto.randomUUID() or similar
- Store share settings in localStorage
- For MVP: shared links work via URL hash/param (no backend needed)
- Future: could add password protection for shared links

## Implementation Summary
*(To be filled after implementation)*
