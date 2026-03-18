'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { TripMap } from '@/components/map/TripMap';
import { SaveIndicator } from '@/components/SaveIndicator';
import { ExportImport } from '@/components/ExportImport';
import { SortableActivityList } from '@/components/SortableActivityList';
import { CategoryFilter, filterActivitiesByCategory, getCategoryCounts, ALL_CATEGORIES } from '@/components/CategoryFilter';
import { ActivityCategory } from '@/lib/types';
import { loadFromStorage, saveToStorage } from '@/lib/storage';
import { Trip, Day, Activity } from '@/lib/types';

export default function TripDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params.tripId as string;
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<ActivityCategory[]>([]);

  // Load trip from storage
  useEffect(() => {
    const loadedTrips = loadFromStorage();
    const found = loadedTrips.find(t => t.id === tripId);
    if (found) {
      setTrip(found);
      if (found.days.length > 0) {
        setSelectedDay(found.days[0].id);
      }
    }
    setLoading(false);
  }, [tripId]);

  // Auto-save on changes
  useEffect(() => {
    if (trip) {
      const loadedTrips = loadFromStorage();
      const updatedTrips = loadedTrips.map(t => t.id === trip.id ? trip : t);
      if (!updatedTrips.find(t => t.id === trip.id)) {
        updatedTrips.push(trip);
      }
      saveToStorage(updatedTrips);
    }
  }, [trip]);

  // Get all activities for category counts
  const allActivities = useMemo(() => {
    if (!trip) return [];
    return trip.days.flatMap(day => day.activities);
  }, [trip]);

  const categoryCounts = useMemo(() => getCategoryCounts(allActivities), [allActivities]);

  // Filter activities for display
  const filteredDays = useMemo(() => {
    if (!trip) return [];
    if (selectedCategories.length === 0 || selectedCategories.length === ALL_CATEGORIES.length) {
      return trip.days;
    }
    return trip.days.map(day => ({
      ...day,
      activities: filterActivitiesByCategory(day.activities, selectedCategories),
    }));
  }, [trip, selectedCategories]);

  // Handlers
  const handleMoveActivity = (sourceDayId: string, destDayId: string, activityId: string) => {
    if (!trip) return;
    
    const newDays = [...trip.days];
    const sourceDay = newDays.find(d => d.id === sourceDayId);
    const destDay = newDays.find(d => d.id === destDayId);
    
    if (!sourceDay || !destDay) return;
    
    const activityIndex = sourceDay.activities.findIndex(a => a.id === activityId);
    if (activityIndex === -1) return;
    
    const [activity] = sourceDay.activities.splice(activityIndex, 1);
    activity.order = destDay.activities.length;
    destDay.activities.push(activity);
    
    // Reorder source day
    sourceDay.activities.forEach((a, i) => a.order = i);
    
    setTrip({ ...trip, days: newDays });
    saveToStorage(loadFromStorage().map(t => t.id === trip.id ? { ...trip, days: newDays } : t));
  };

  const handleReorder = (dayId: string, activityIds: string[]) => {
    if (!trip) return;
    
    const newDays = trip.days.map(day => {
      if (day.id !== dayId) return day;
      const reorderedActivities = activityIds
        .map((id, index) => {
          const activity = day.activities.find(a => a.id === id);
          return activity ? { ...activity, order: index } : null;
        })
        .filter((a): a is Activity => a !== null);
      return { ...day, activities: reorderedActivities };
    });
    
    setTrip({ ...trip, days: newDays });
    saveToStorage(loadFromStorage().map(t => t.id === trip.id ? { ...trip, days: newDays } : t));
  };

  const handleAddDay = () => {
    if (!trip) return;
    
    const lastDate = trip.days.length > 0 
      ? new Date(trip.days[trip.days.length - 1].date)
      : new Date(trip.startDate);
    const newDate = new Date(lastDate);
    newDate.setDate(newDate.getDate() + 1);
    
    const newDay: Day = {
      id: `day-${Date.now()}`,
      date: newDate.toISOString().split('T')[0],
      activities: [],
    };
    
    const newDays = [...trip.days, newDay];
    setTrip({ ...trip, days: newDays });
    setSelectedDay(newDay.id);
  };

  const handleEditActivity = (activity: Activity) => {
    console.log('Edit activity:', activity);
    // TODO: Open edit modal
  };

  const handleDeleteActivity = (activityId: string) => {
    if (!trip || !confirm('Delete this activity?')) return;
    
    const newDays = trip.days.map(day => ({
      ...day,
      activities: day.activities.filter(a => a.id !== activityId),
    }));
    
    setTrip({ ...trip, days: newDays });
    saveToStorage(loadFromStorage().map(t => t.id === trip.id ? { ...trip, days: newDays } : t));
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8 text-white flex items-center justify-center min-h-[200px]">
        <span className="text-lg">Loading...</span>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="p-4 md:p-8 max-w-2xl mx-auto text-white">
        <button
          onClick={() => router.push('/trips')}
          className="mb-4"
          style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}
        >
          ← Back to Trips
        </button>
        <p>Trip not found</p>
      </div>
    );
  }

  const currentDayIndex = trip.days.findIndex(d => d.id === selectedDay);
  const currentDay = trip.days[currentDayIndex];

  return (
    <div className="min-h-screen" style={{ padding: '1rem' }}>
      {/* Mobile Header */}
      <button
        onClick={() => router.push('/trips')}
        className="md:hidden mb-2"
        style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}
      >
        ← Back
      </button>
      
      {/* Header - Responsive */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-4 mb-2">
        <h1 className="text-2xl md:text-3xl lg:text-4xl text-white m-0">{trip.name}</h1>
        <div className="flex flex-wrap items-center gap-2 md:gap-4">
          <CategoryFilter
            selectedCategories={selectedCategories}
            onSelectionChange={setSelectedCategories}
            categoryCounts={categoryCounts}
          />
          <SaveIndicator />
          <ExportImport trips={[trip]} onImport={() => {}} />
        </div>
      </div>
      
      <p className="text-white text-base md:text-lg mb-2 md:mb-4 opacity-80">
        {trip.startDate} → {trip.endDate}
      </p>

      {/* Day Tabs - Responsive scrollable */}
      <div className="flex gap-2 mb-4 md:mb-6 overflow-x-auto pb-2 md:pb-0">
        {trip.days.map((day, index) => {
          const dayActivities = filteredDays.find(d => d.id === day.id)?.activities || [];
          const isSelected = selectedDay === day.id;
          
          return (
            <button
              key={day.id}
              onClick={() => setSelectedDay(day.id)}
              className="px-3 py-2 md:px-4 md:py-2 rounded-lg cursor-pointer text-sm md:text-base font-medium transition-all min-h-[44px]"
              style={{
                background: isSelected ? '#3B82F6' : '#374151',
                color: 'white',
                border: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              Day {index + 1} ({dayActivities.length})
            </button>
          );
        })}
        <button
          onClick={handleAddDay}
          className="px-3 py-2 md:px-4 md:py-2 rounded-lg cursor-pointer text-sm md:text-base font-medium min-h-[44px]"
          style={{
            background: '#10B981',
            color: 'white',
            border: 'none',
          }}
        >
          + Day
        </button>
      </div>

      {/* Main Content - Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-[1fr_400px] gap-4 md:gap-6">
        {/* Itinerary Column */}
        <div className="order-2 lg:order-1">
          {currentDay && (
            <div className="bg-white rounded-xl p-3 md:p-4 min-h-[300px] md:min-h-[400px]">
              <h2 className="text-lg md:text-xl m-0 mb-3 md:mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <span>{currentDay.date}</span>
                <button
                  onClick={() => {
                    // TODO: Open add activity modal
                    console.log('Add activity to day:', currentDay.id);
                  }}
                  className="px-3 py-2 md:px-4 md:py-2 rounded-md cursor-pointer text-sm font-medium min-h-[44px]"
                  style={{
                    background: '#3B82F6',
                    color: 'white',
                    border: 'none',
                  }}
                >
                  + Add
                </button>
              </h2>
              
              {currentDay.activities.length === 0 ? (
                <div className="text-center py-8 md:py-12 text-gray-400">
                  No activities for this day
                </div>
              ) : (
                <SortableActivityList
                  tripId={trip.id}
                  day={currentDay}
                  days={filteredDays}
                  onMoveActivity={(tid, sid, did, aid) => handleMoveActivity(sid, did, aid)}
                  onReorder={(tid, dayId, activityIds) => handleReorder(dayId, activityIds)}
                  onEditActivity={handleEditActivity}
                  onDeleteActivity={handleDeleteActivity}
                />
              )}
            </div>
          )}
        </div>

        {/* Map Column - First on mobile, second on desktop */}
        <div className="order-1 lg:order-2 min-h-[300px] md:min-h-[400px]" style={{ background: 'white', borderRadius: '12px', overflow: 'hidden' }}>
          <TripMap 
            className="leaflet-container"
            markers={allActivities
              .filter(a => a.location?.latitude && a.location?.longitude)
              .map(a => ({
                id: a.id,
                position: [a.location!.latitude!, a.location!.longitude!] as [number, number],
                title: a.title,
                category: a.category,
              }))
            }
          />
        </div>
      </div>
    </div>
  );
}
