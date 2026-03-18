'use client';

import { useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  UniqueIdentifier,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Activity, Day } from '@/lib/types';
import { SortableActivityCard } from './SortableActivityCard';

interface SortableActivityListProps {
  tripId: string;
  day: Day;
  days: Day[];
  onMoveActivity: (tripId: string, sourceDayId: string, destDayId: string, activityId: string, destIndex?: number) => void;
  onReorder: (tripId: string, dayId: string, activityIds: string[]) => void;
  onEditActivity?: (activity: Activity) => void;
  onDeleteActivity?: (activityId: string) => void;
}

export function SortableActivityList({
  tripId,
  day,
  days,
  onMoveActivity,
  onReorder,
  onEditActivity,
  onDeleteActivity,
}: SortableActivityListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    // Store the source day ID in the active data for cross-day moves
    const { active } = event;
    const sourceDay = days.find((d) =>
      d.activities.some((a) => a.id === active.id)
    );
    if (sourceDay) {
      // We can access this in onDragEnd via the active id
    }
  }, [days]);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (!over) return;

      const activeId = active.id as string;
      const overId = over.id as string;

      // Find source and destination days
      const sourceDay = days.find((d) =>
        d.activities.some((a) => a.id === activeId)
      );
      const destDay =
        days.find((d) => d.activities.some((a) => a.id === overId)) ||
        days.find((d) => d.id === overId);

      if (!sourceDay || !destDay) return;

      // Same day - reorder
      if (sourceDay.id === destDay.id) {
        const oldIndex = sourceDay.activities.findIndex(
          (a) => a.id === activeId
        );
        const newIndex = sourceDay.activities.findIndex((a) => a.id === overId);

        if (oldIndex !== newIndex && newIndex !== -1) {
          const newOrder = arrayMove(
            sourceDay.activities.map((a) => a.id),
            oldIndex,
            newIndex
          );
          onReorder(tripId, sourceDay.id, newOrder);
        }
      } else {
        // Cross-day move
        const destIndex = destDay.activities.findIndex((a) => a.id === overId);
        onMoveActivity(
          tripId,
          sourceDay.id,
          destDay.id,
          activeId,
          destIndex === -1 ? undefined : destIndex
        );
      }
    },
    [days, tripId, onReorder, onMoveActivity]
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={day.activities.map((a) => a.id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          data-day-id={day.id}
          className="min-h-[100px] p-2 rounded-lg bg-gray-50 border-2 border-transparent transition-all duration-200"
        >
          {day.activities.length === 0 ? (
            <div className="flex items-center justify-center h-20 text-sm text-gray-400">
              No activities
            </div>
          ) : (
            <div className="space-y-2">
              {day.activities.map((activity) => (
                <SortableActivityCard
                  key={activity.id}
                  activity={activity}
                  onEdit={onEditActivity}
                  onDelete={onDeleteActivity}
                />
              ))}
            </div>
          )}
        </div>
      </SortableContext>
    </DndContext>
  );
}

export default SortableActivityList;
