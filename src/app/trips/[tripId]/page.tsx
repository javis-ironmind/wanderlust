'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTripStore, useTripActions, useTrip } from '@/lib/store';
import { SortableActivityList } from '@/components/SortableActivityList';
import { AddActivityForm } from '@/components/AddActivityForm';
import { ChevronLeft, Plus, MapPin, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export default function TripDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params.tripId as string;
  
  const { trips, currentTripId } = useTrip();
  const { setCurrentTrip, reorderActivities } = useTripActions();
  
  const [showAddActivity, setShowAddActivity] = useState<string | null>(null);
  
  // Set current trip on mount
  useEffect(() => {
    if (tripId) {
      setCurrentTrip(tripId);
    }
  }, [tripId, setCurrentTrip]);
  
  const trip = trips.find((t) => t.id === tripId);
  
  if (!trip) {
    return (
      <div style={{ padding: '2rem', fontFamily: 'system-ui' }}>
        <h1>Trip not found</h1>
        <p>Trip ID: {tripId}</p>
        <button 
          onClick={() => router.push('/trips')}
          style={{ marginTop: '1rem', padding: '0.5rem 1rem', cursor: 'pointer' }}
        >
          Back to trips
        </button>
      </div>
    );
  }
  
  const handleReorder = (dayId: string) => (activityIds: string[]) => {
    reorderActivities(tripId, dayId, activityIds);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Header */}
      <header style={{ 
        backgroundColor: 'white', 
        borderBottom: '1px solid #e2e8f0',
        padding: '1rem 2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
      }}>
        <button 
          onClick={() => router.push('/trips')}
          style={{ 
            background: 'none', 
            border: 'none', 
            cursor: 'pointer',
            padding: '0.5rem'
          }}
        >
          <ChevronLeft size={24} />
        </button>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0 }}>
            {trip.name}
          </h1>
          <p style={{ color: '#64748b', margin: 0, fontSize: '0.875rem' }}>
            {trip.days.length} days
          </p>
        </div>
      </header>
      
      {/* Days and Activities */}
      <main style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        {trip.days.map((day, dayIndex) => (
          <div 
            key={day.id}
            style={{ 
              marginBottom: '2rem',
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              border: '1px solid #e2e8f0',
              overflow: 'hidden'
            }}
          >
            {/* Day Header */}
            <div style={{ 
              backgroundColor: '#f1f5f9',
              padding: '1rem 1.5rem',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Calendar size={18} style={{ color: '#64748b' }} />
                <div>
                  <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>
                    Day {dayIndex + 1}
                  </h2>
                  {day.date && (
                    <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
                      {format(new Date(day.date), 'EEEE, MMMM d')}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setShowAddActivity(showAddActivity === day.id ? null : day.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                <Plus size={16} />
                Add Activity
              </button>
            </div>
            
            {/* Activities List - AC3: Drop zones highlight when dragging over */}
            <div style={{ padding: '1rem' }}>
              {day.activities.length > 0 ? (
                <SortableActivityList
                  activities={day.activities}
                  onReorder={handleReorder(day.id)}
                />
              ) : (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '2rem', 
                  color: '#94a3b8' 
                }}>
                  <MapPin size={32} style={{ margin: '0 auto 0.5rem', display: 'block', opacity: 0.5 }} />
                  <p>No activities yet</p>
                  <p style={{ fontSize: '0.875rem' }}>
                    Click "Add Activity" to start planning your day
                  </p>
                </div>
              )}
              
              {/* AC5: Add Activity Form */}
              {showAddActivity === day.id && (
                <div style={{ marginTop: '1rem' }}>
                  <AddActivityForm
                    tripId={tripId}
                    dayId={day.id}
                    onComplete={() => setShowAddActivity(null)}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
        
        {trip.days.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
            <p>No days in this trip yet.</p>
          </div>
        )}
      </main>
    </div>
  );
}
