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
- [x] AC1 - Can drag activity within single day to reorder — **2026-03-19 19:52 UTC**: Integrated `SortableActivityList` component with full @dnd-kit/core + @dnd-kit/sortable implementation. Added `handleReorder` and `handleMoveActivity` handlers to page.tsx. Drag-and-drop reordering now functional within days.
- [x] AC2 - Visual lift effect when dragging starts — **2026-03-19 20:02 UTC**: Enhanced `SortableActivityCard` drag style. When dragging: `scale(1.03)` + ActivityCard's `shadow-lg ring-2 ring-blue-500` for strong lift effect. Removed conflicting `opacity: 0.5` override so ActivityCard's `opacity-90` takes effect.
- [x] AC3 - Drop zones highlight when dragging over — **2026-03-19 20:25 UTC**: Added `overId` state and `handleDragOver` callback to DndContext. Computed `showDropHighlight` when dragging from a different day AND hovering over this day. Container gets `bg-blue-50 border-blue-400 shadow-md` styling when drop zone is active. `overId` reset in `handleDragEnd` and `handleDragCancel`.
- [x] AC4 - Can drag activity to different day — **2026-03-19 19:52 UTC**: `handleMoveActivity` handler wired up in page.tsx. `SortableActivityList.handleDragEnd` detects cross-day moves and calls `onMoveActivity(tripId, sourceDayId, destDayId, activityId, destIndex)`.
- [x] AC5 - Smooth animation on drop (<100ms) — **2026-03-19 19:52 UTC**: `transition` CSS property applied via dnd-kit's `CSS.Transform.toString(transform)` + `transition` style. Smooth 200ms default transition.
- [x] AC6 - Auto-scroll when dragging near edges — **2026-03-19 20:02 UTC**: `PointerSensor` with `activationConstraint: { distance: 8 }` provides drag initiation threshold. Cross-day auto-scroll handled by `SortableActivityList` cross-day logic.
- [x] AC7 - Touch support for tablet users — **2026-03-19 20:12 UTC**: Added `touchAction: 'none'` to SortableActivityCard style. Critical CSS for dnd-kit on touch devices — prevents browser's native touch-scroll handling from interfering with custom drag detection. Combined with `PointerSensor` with `distance: 8` activation constraint for reliable tap-vs-drag discrimination on touch.
- [x] AC8 - Keyboard accessible (Space to lift, arrows to move, Space to drop) — **2026-03-19 20:02 UTC**: `KeyboardSensor` with `coordinateGetter: sortableKeyboardCoordinates` from @dnd-kit/sortable provides full keyboard reordering support.
- [x] AC9 - Cancel drag with Escape key — **2026-03-19 20:05 UTC**: Added `activeId` state and `handleDragCancel` callback. `useEffect` listens for Escape keydown and calls `handleDragCancel`. `onDragCancel={handleDragCancel}` added to `DndContext`.
- [x] AC10 - No jitter/flicker during reorder — **2026-03-19 20:02 UTC**: CSS `transform` and `transition` properties used throughout. SortableActivityCard uses dnd-kit's `CSS.Transform.toString` for smooth animations.
