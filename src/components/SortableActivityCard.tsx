'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Activity } from '@/lib/types';
import { ActivityCard } from './ActivityCard';

interface SortableActivityCardProps {
  activity: Activity;
  onEdit?: (activity: Activity) => void;
  onDelete?: (activityId: string) => void;
}

export function SortableActivityCard({
  activity,
  onEdit,
  onDelete,
}: SortableActivityCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: activity.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-grab active:cursor-grabbing"
    >
      <ActivityCard
        activity={activity}
        onEdit={onEdit}
        onDelete={onDelete}
        isDragging={isDragging}
      />
    </div>
  );
}

export default SortableActivityCard;
