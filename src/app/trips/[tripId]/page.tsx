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
    
    const newDayNumber = trip.days.length + 1;
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
    return <div style={{ padding: '2rem', color: 'white' }}>Loading...</div>;
  }

  if (!trip) {
    return (
      <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', color: 'white' }}>
        <button
          onClick={() => router.push('/trips')}
          style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', marginBottom: '1rem' }}
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
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <button
        onClick={() => router.push('/trips')}
        style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', marginBottom: '1rem' }}
      >
        ← Back to Trips
      </button>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <h1 style={{ fontSize: '2.5rem', color: 'white', margin: 0 }}>{trip.name}</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <CategoryFilter
            selectedCategories={selectedCategories}
            onSelectionChange={setSelectedCategories}
            categoryCounts={categoryCounts}
          />
          <SaveIndicator />
          <ExportImport trips={[trip]} onImport={() => {}} />
        </div>
      </div>
      
      <p style={{ color: 'white', fontSize: '1.1rem', opacity: 0.8, marginBottom: '1rem' }}>
        {trip.startDate} → {trip.endDate}
      </p>

      {/* Day Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: '0.5rem', 
        marginBottom: '1.5rem',
        overflowX: 'auto',
        paddingBottom: '0.5rem',
      }}>
        {trip.days.map((day, index) => {
          const dayActivities = filteredDays.find(d => d.id === day.id)?.activities || [];
          const isSelected = selectedDay === day.id;
          
          return (
            <button
              key={day.id}
              onClick={() => setSelectedDay(day.id)}
              style={{
                padding: '0.5rem 1rem',
                background: isSelected ? '#3B82F6' : '#374151',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: isSelected ? 600 : 400,
                whiteSpace: 'nowrap',
                transition: 'all 0.2s',
              }}
            >
              Day {index + 1} ({dayActivities.length})
            </button>
          );
        })}
        <button
          onClick={handleAddDay}
          style={{
            padding: '0.5rem 1rem',
            background: '#10B981',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: 500,
          }}
        >
          + Add Day
        </button>
      </div>

      {/* Main Content - Two Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '1.5rem' }}>
        {/* Itinerary Column */}
        <div>
          {currentDay && (
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '1rem',
              minHeight: '400px',
            }}>
              <h2 style={{ 
                margin: '0 0 1rem 0', 
                fontSize: '1.25rem', 
                color: '#111827',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <span>{currentDay.date}</span>
                <button
                  onClick={() => {
                    // TODO: Open add activity modal
                    console.log('Add activity to day:', currentDay.id);
                  }}
                  style={{
                    padding: '0.375rem 0.75rem',
                    background: '#3B82F6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                  }}
                >
                  + Add Activity
                </button>
              </h2>
              
              {currentDay.activities.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '3rem',
                  color: '#9CA3AF',
                }}>
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

        {/* Map Column */}
        <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', minHeight: '400px' }}>
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
