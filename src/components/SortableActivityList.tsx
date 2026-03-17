'use client';

import { useState } from 'react';
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
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { Activity as ActivityType } from '@/lib/types';

interface ActivityItem {
  id: string;
  name: string;
  time?: string;
  location?: string;
  category?: string;
  notes?: string;
  cost?: number;
}

interface SortableActivityCardProps {
  activity: ActivityType;
  isDragging?: boolean;
}

function SortableActivityCard({ activity, isDragging }: SortableActivityCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: activity.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 'auto',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`activity-card bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-2 flex items-center gap-3 ${
        isDragging ? 'shadow-lg ring-2 ring-blue-500 scale-105' : ''
      }`}
    >
      {/* Drag Handle - AC1 */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 text-gray-400 hover:text-gray-600 touch-none"
        title="Drag to reorder"
      >
        <GripVertical size={20} />
      </button>
      
      <div className="flex-1">
        <h3 className="font-medium text-gray-900">{activity.name}</h3>
        {activity.time && (
          <p className="text-sm text-gray-500">{activity.time}</p>
        )}
        {activity.location && (
          <p className="text-sm text-gray-500">{activity.location}</p>
        )}
      </div>
      
      {activity.category && (
        <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">
          {activity.category}
        </span>
      )}
    </div>
  );
}

interface ActivityCardPreviewProps {
  activity: ActivityType;
}

function ActivityCardPreview({ activity }: ActivityCardPreviewProps) {
  return (
    <div className="activity-card bg-white rounded-lg shadow-lg ring-2 ring-blue-500 p-4 flex items-center gap-3 w-full">
      <GripVertical size={20} className="text-gray-400" />
      <div className="flex-1">
        <h3 className="font-medium text-gray-900">{activity.name}</h3>
        {activity.time && (
          <p className="text-sm text-gray-500">{activity.time}</p>
        )}
      </div>
    </div>
  );
}

interface SortableActivityListProps {
  activities: ActivityType[];
  onReorder: (activityIds: string[]) => void;
}

export function SortableActivityList({ activities, onReorder }: SortableActivityListProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // AC2: Requires 8px movement before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // AC3 & AC4: Handle drag end
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = activities.findIndex((a) => a.id === active.id);
      const newIndex = activities.findIndex((a) => a.id === over.id);
      
      const newOrder = arrayMove(
        activities.map((a) => a.id),
        oldIndex,
        newIndex
      );
      
      onReorder(newOrder);
    }
    
    setActiveId(null);
  }

  // AC2: Track drag start for visual feedback
  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  const activeActivity = activeId 
    ? activities.find((a) => a.id === activeId) 
    : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={activities.map((a) => a.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          {activities.map((activity) => (
            <SortableActivityCard
              key={activity.id}
              activity={activity}
              isDragging={activeId === activity.id}
            />
          ))}
        </div>
      </SortableContext>
      
      {/* AC6: Overlay for smooth animation during drag */}
      <DragOverlay>
        {activeActivity ? (
          <ActivityCardPreview activity={activeActivity} />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
