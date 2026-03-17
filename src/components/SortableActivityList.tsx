'use client';

import { useState, useCallback } from 'react';
import { Activity, Day } from '@/lib/types';
import { ActivityCard } from './ActivityCard';

interface SortableActivityListProps {
  tripId: string;
  day: Day;
  days: Day[];
  onMoveActivity: (tripId: string, sourceDayId: string, destDayId: string, activityId: string, destIndex?: number) => void;
  onReorder: (tripId: string, dayId: string, activityIds: string[]) => void;
  onEditActivity?: (activity: Activity) => void;
  onDeleteActivity?: (activityId: string) => void;
}

interface DragState {
  isDragging: boolean;
  draggedActivityId: string | null;
  sourceDayId: string | null;
  targetDayId: string | null;
}

export function SortableActivityList({
  tripId,
  day,
  onMoveActivity,
  onEditActivity,
  onDeleteActivity,
}: SortableActivityListProps) {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedActivityId: null,
    sourceDayId: null,
    targetDayId: null,
  });

  const handleDragStart = useCallback((e: React.DragEvent, activityId: string, dayId: string) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify({
      activityId,
      sourceDayId: dayId,
    }));
    
    setDragState({
      isDragging: true,
      draggedActivityId: activityId,
      sourceDayId: dayId,
      targetDayId: null,
    });
  }, []);

  const handleDragEnd = useCallback(() => {
    setDragState({
      isDragging: false,
      draggedActivityId: null,
      sourceDayId: null,
      targetDayId: null,
    });
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, targetDayId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (dragState.targetDayId !== targetDayId) {
      setDragState(prev => ({ ...prev, targetDayId }));
    }
  }, [dragState.targetDayId]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    // Only clear target if leaving the day container entirely
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (!relatedTarget?.closest('[data-day-id]')) {
      setDragState(prev => ({ ...prev, targetDayId: null }));
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, destDayId: string) => {
    e.preventDefault();
    
    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      const { activityId, sourceDayId } = data;
      
      if (sourceDayId !== destDayId) {
        // Move to different day
        onMoveActivity(tripId, sourceDayId, destDayId, activityId);
      }
    } catch (err) {
      console.error('Drop error:', err);
    }
    
    handleDragEnd();
  }, [tripId, onMoveActivity, handleDragEnd]);

  const isDropTarget = dragState.isDragging && dragState.targetDayId === day.id;
  const isSourceDay = dragState.sourceDayId === day.id;

  return (
    <div
      data-day-id={day.id}
      onDragOver={(e) => handleDragOver(e, day.id)}
      onDragLeave={handleDragLeave}
      onDrop={(e) => handleDrop(e, day.id)}
      className={`
        min-h-[100px] p-2 rounded-lg transition-all duration-200
        ${isDropTarget 
          ? 'bg-blue-50 border-2 border-dashed border-blue-400 shadow-inner' 
          : 'bg-gray-50 border-2 border-transparent'
        }
        ${isSourceDay ? 'opacity-60' : ''}
      `}
    >
      {day.activities.length === 0 ? (
        <div className={`
          flex items-center justify-center h-20 text-sm
          ${isDropTarget ? 'text-blue-600' : 'text-gray-400'}
        `}>
          {isDropTarget ? 'Drop here to move' : 'No activities'}
        </div>
      ) : (
        <div className="space-y-2">
          {day.activities.map((activity) => {
            const isDragging = dragState.draggedActivityId === activity.id;
            
            return (
              <div
                key={activity.id}
                draggable
                onDragStart={(e) => handleDragStart(e, activity.id, day.id)}
                onDragEnd={handleDragEnd}
                className={`
                  transition-all duration-200
                  ${isDragging ? 'opacity-30 scale-95' : 'opacity-100'}
                `}
              >
                <ActivityCard
                  activity={activity}
                  onEdit={onEditActivity}
                  onDelete={onDeleteActivity}
                  isDragging={isDragging}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default SortableActivityList;
