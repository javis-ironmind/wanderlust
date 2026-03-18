'use client';

import { useState, useRef, useEffect } from 'react';
import { Activity, ActivityCategory } from '@/lib/types';
import { 
  Plane, 
  Building2, 
  UtensilsCrossed, 
  Landmark, 
  Sparkles, 
  Car, 
  ShoppingBag, 
  PartyPopper, 
  MoreHorizontal,
  GripVertical,
  Pencil,
  Trash2,
  Clock
} from 'lucide-react';

// Category color mapping
const categoryColors: Record<ActivityCategory, string> = {
  flight: 'bg-blue-500',
  hotel: 'bg-purple-500',
  restaurant: 'bg-orange-500',
  attraction: 'bg-pink-500',
  activity: 'bg-green-500',
  transport: 'bg-yellow-500',
  shopping: 'bg-rose-500',
  entertainment: 'bg-violet-500',
  other: 'bg-gray-500'
};

// Category icon mapping
const categoryIcons: Record<ActivityCategory, React.ComponentType<{ className?: string }>> = {
  flight: Plane,
  hotel: Building2,
  restaurant: UtensilsCrossed,
  attraction: Landmark,
  activity: Sparkles,
  transport: Car,
  shopping: ShoppingBag,
  entertainment: PartyPopper,
  other: MoreHorizontal
};

// Format time display
function formatTime(startTime?: string, endTime?: string): string {
  if (!startTime) return 'Time TBD';
  
  const formatHourMinute = (time: string) => {
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };
  
  if (endTime) {
    return `${formatHourMinute(startTime)} - ${formatHourMinute(endTime)}`;
  }
  
  return formatHourMinute(startTime);
}

// Category badge component
function CategoryBadge({ category }: { category: ActivityCategory }) {
  const Icon = categoryIcons[category];
  const colorClass = categoryColors[category];
  
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-white ${colorClass}`}>
      <Icon className="w-3 h-3" />
      <span className="capitalize">{category}</span>
    </span>
  );
}

interface ActivityCardProps {
  activity: Activity;
  onEdit?: (activity: Activity) => void;
  onDelete?: (activityId: string) => void;
  dragHandleProps?: Record<string, unknown>;
  isDragging?: boolean;
}

export function ActivityCard({ 
  activity, 
  onEdit, 
  onDelete,
  dragHandleProps,
  isDragging = false 
}: ActivityCardProps) {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeX, setSwipeX] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  
  const handleDelete = () => {
    if (showConfirmDelete) {
      onDelete?.(activity.id);
      setShowConfirmDelete(false);
    } else {
      setShowConfirmDelete(true);
    }
  };
  
  const handleEdit = () => {
    onEdit?.(activity);
  };
  
  // Touch event handlers for swipe-to-delete
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setIsSwiping(false);
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    
    const currentX = e.touches[0].clientX;
    const diff = touchStartX.current - currentX;
    
    // Only swipe left (delete direction)
    if (diff > 0) {
      const clampedDiff = Math.min(diff, 80);
      setSwipeX(clampedDiff);
      setIsSwiping(clampedDiff > 20);
    }
  };
  
  const handleTouchEnd = () => {
    if (swipeX > 50) {
      // Trigger delete
      onDelete?.(activity.id);
    }
    // Reset
    setTimeout(() => {
      setSwipeX(0);
      setIsSwiping(false);
    }, 100);
    touchStartX.current = null;
  };
  
  return (
    <div 
      className={`
        relative bg-white rounded-lg border border-gray-200 shadow-sm
        transition-all duration-200
        ${isDragging ? 'shadow-lg ring-2 ring-blue-500 opacity-90' : ''}
        ${isHovered ? 'shadow-md border-gray-300' : ''}
        ${isSwiping ? 'shadow-lg' : ''}
        hover:shadow-md hover:border-gray-300
        group
        swipeable-item
        ${isSwiping ? 'swiping' : ''}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowConfirmDelete(false);
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ 
        transform: swipeX > 0 ? `translateX(-${swipeX}px)` : undefined,
        transition: swipeX > 0 ? 'none' : undefined
      }}
      ref={cardRef}
    >
      {/* Delete background reveal */}
      <div className="swipeable-delete">
        <Trash2 className="w-5 h-5" />
      </div>
      {/* Drag Handle - always visible */}
      <div 
        {...dragHandleProps}
        className="absolute left-0 top-1/2 -translate-y-1/2 p-2 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 transition-opacity"
      >
        <GripVertical className="w-4 h-4" />
      </div>
      
      <div className="p-3 pl-8">
        {/* Header: Title and Category */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h4 className="font-medium text-gray-900 line-clamp-2">
            {activity.title}
          </h4>
          <CategoryBadge category={activity.category} />
        </div>
        
        {/* Time */}
        <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-2">
          <Clock className="w-4 h-4 text-gray-400" />
          <span>{formatTime(activity.startTime, activity.endTime)}</span>
        </div>
        
        {/* Location */}
        {activity.location && (
          <div className="text-sm text-gray-500 mb-2">
            <span className="font-medium">{activity.location.name}</span>
            {activity.location.address && (
              <span className="text-gray-400"> - {activity.location.address}</span>
            )}
          </div>
        )}
        
        {/* Thumbnail Image */}
        {activity.imageUrl && (
          <div className="mb-2 rounded-md overflow-hidden">
            <img 
              src={activity.imageUrl} 
              alt={activity.title}
              className="w-full h-24 object-cover"
            />
          </div>
        )}
        
        {/* Notes Preview */}
        {activity.notes && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-2">
            {activity.notes}
          </p>
        )}
        
        {/* Action Buttons - visible on hover */}
        {isHovered && (
          <div className="flex items-center gap-2 mt-3 pt-2 border-t border-gray-100">
            <button
              onClick={handleEdit}
              className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
            <button
              onClick={handleDelete}
              className={`
                flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors
                ${showConfirmDelete 
                  ? 'bg-red-100 text-red-600' 
                  : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                }
              `}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{showConfirmDelete ? 'Confirm?' : 'Delete'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ActivityCard;
