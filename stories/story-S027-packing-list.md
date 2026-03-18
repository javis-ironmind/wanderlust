# Story S027 - Packing List

## Feature
Packing list management for trips - create categorized packing lists with checkboxes to track what's packed.

## User Story
As a traveler, I want a packing list so I can ensure I don't forget essential items and track what I've already packed.

## Acceptance Criteria [x]
- [x] AC1: Add packing list section to trip detail page
- [x] AC2: Pre-defined categories (Clothes, Toiletries, Electronics, Documents, Misc)
- [x] AC3: Add custom items to each category
- [x] AC4: Checkbox to mark items as packed
- [x] AC5: Progress indicator showing % items packed
- [x] AC6: Persist packing state to localStorage

## Technical Notes
- Add packingList field to Trip model: `{ items: PackingItem[], categories: string[] }`
- PackingItem: `{ id: string, name: string, category: string, packed: boolean }`
- Pre-populate with common items user can remove
- Show "X of Y items packed" progress
- Separate packed/unpacked views or filter toggle

## Dependencies
- S017 (localStorage) - persistence
- S004/S006 (trip detail UI)

## Priority
Medium - high value for trip preparation
