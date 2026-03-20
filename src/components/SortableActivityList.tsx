'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
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
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [overId, setOverId] = useState<UniqueIdentifier | null>(null);

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
    setActiveId(event.active.id);
  }, []);

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
    setOverId(null);
  }, []);

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;
      if (!over) {
        setOverId(null);
        return;
      }
      const overId = over.id as string;
      setOverId(overId);
    },
    []
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      // Reset drag state
      setActiveId(null);
      setOverId(null);

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

  // AC9: Cancel drag with Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeId) {
        handleDragCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeId, handleDragCancel]);

  // AC3: Cross-day drop zone highlight - detect if source is from a different day
  const sourceDay = activeId ? days.find((d) => d.activities.some((a) => a.id === activeId)) : null;
  const isCrossDaySource = sourceDay ? sourceDay.id !== day.id : false;
  const overActivityId = overId && day.activities.some((a) => a.id === overId) ? overId : null;
  const showDropHighlight = isCrossDaySource && (overActivityId || overId === day.id);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
      onDragOver={handleDragOver}
    >
      <SortableContext
        items={day.activities.map((a) => a.id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          data-day-id={day.id}
          className={`min-h-[100px] p-2 rounded-lg transition-all duration-200 ${
            showDropHighlight
              ? 'bg-blue-50 border-2 border-blue-400 shadow-md'
              : 'bg-gray-50 border-2 border-transparent'
          }`}
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
