# Feature F004: Drag and Drop

## Description

Enable fluid drag-and-drop reordering of activities within a day and between days. Core UX feature for intuitive itinerary building.

## Implementation

### Library
- @dnd-kit/core for drag-drop logic
- @dnd-kit/sortable for list reordering
- @dnd-kit/utilities for utilities

### Components Needed
- `SortableActivity` - Wrapped activity card
- `DayDropZone` - Droppable day container
- `DragOverlay` - Visual feedback during drag
- `useDragDrop` - Custom hook for dnd logic

### Interactions
- Grab handle on left of activity card
- Visual lift effect on drag start
- Drop zone highlights on drag over
- Smooth reorder animation
- Auto-scroll at edges

### States
- `idle` - Default state
- `dragOverlay` - Currently dragging
- `overDay` - Hovering over day
- `dropped` - Successfully placed

## Acceptance Criteria
- [ ] AC1 - Can drag activity within single day to reorder
- [ ] AC2 - Visual lift effect when dragging starts
- [ ] AC3 - Drop zones highlight when dragging over
- [ ] AC4 - Can drag activity to different day
- [ ] AC5 - Smooth animation on drop (<100ms)
- [ ] AC6 - Auto-scroll when dragging near edges
- [ ] AC7 - Touch support for tablet users
- [ ] AC8 - Keyboard accessible (Space to lift, arrows to move, Space to drop)
- [ ] AC9 - Cancel drag with Escape key
- [ ] AC10 - No jitter/flicker during reorder
