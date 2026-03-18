'use client';

import { useMemo } from 'react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { Plane, Hotel, MapPin, Calendar } from 'lucide-react';
import { Trip, Day } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface TimelineViewProps {
  trip: Trip;
  onSelectDay?: (dayId: string) => void;
  selectedDayId?: string | null;
}

export function TimelineView({ trip, onSelectDay, selectedDayId }: TimelineViewProps) {
  const tripDuration = useMemo(() => {
    if (!trip.startDate || !trip.endDate) return 0;
    return differenceInDays(parseISO(trip.endDate), parseISO(trip.startDate)) + 1;
  }, [trip.startDate, trip.endDate]);

  const getDayIcon = (day: Day) => {
    // Check if day has a flight
    const hasFlight = day.activities.some(a => a.category === 'flight');
    if (hasFlight) return <Plane className="w-4 h-4" />;

    // Check if day has a hotel
    const hasHotel = day.activities.some(a => a.category === 'hotel');
    if (hasHotel) return <Hotel className="w-4 h-4" />;

    return <MapPin className="w-4 h-4" />;
  };

  const getActivitySummary = (day: Day) => {
    const categories = day.activities.reduce((acc, activity) => {
      acc[activity.category] = (acc[activity.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categories)
      .slice(0, 3)
      .map(([cat, count]) => `${count} ${cat}`)
      .join(', ');
  };

  if (!trip.days || trip.days.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <Calendar className="w-8 h-8 mr-2" />
        <p>No days in this trip yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Trip Timeline</h3>
        <Badge variant="secondary">{tripDuration} days</Badge>
      </div>

      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-4 p-1">
          {trip.days.map((day, index) => {
            const isSelected = selectedDayId === day.id;
            const dayNumber = index + 1;
            const dayDate = day.date ? format(parseISO(day.date), 'MMM d') : `Day ${dayNumber}`;

            return (
              <button
                key={day.id}
                onClick={() => onSelectDay?.(day.id)}
                className={cn(
                  'flex flex-col items-center p-4 rounded-xl border-2 transition-all min-w-[140px]',
                  'hover:shadow-md active:scale-95',
                  isSelected
                    ? 'border-primary bg-primary/5 shadow-md'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                )}
              >
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center mb-2',
                    isSelected ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
                  )}
                >
                  {getDayIcon(day)}
                </div>
                <span className="text-xs font-medium text-gray-500">{dayDate}</span>
                <span className={cn('text-sm font-semibold', isSelected ? 'text-primary' : 'text-gray-900')}>
                  Day {dayNumber}
                </span>
                <span className="text-xs text-gray-400 mt-1">
                  {day.activities.length} {day.activities.length === 1 ? 'activity' : 'activities'}
                </span>
                {day.activities.length > 0 && (
                  <span className="text-xs text-gray-400 mt-1 truncate max-w-[120px]">
                    {getActivitySummary(day)}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}

export default TimelineView;
