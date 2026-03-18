'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { TripMap } from '@/components/map/TripMap';

type Activity = {
  id: string;
  title: string;
  category?: string;
  startTime?: string;
  location?: {
    latitude?: number;
    longitude?: number;
    name?: string;
  };
};

type Day = {
  id: string;
  date: string;
  activities: Activity[];
};

type Trip = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  days: Day[];
  flights: any[];
  hotels: any[];
};

export default function TripDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params.tripId as string;
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('wanderlust_trips');
      if (saved) {
        const trips: Trip[] = JSON.parse(saved);
        const found = trips.find(t => t.id === tripId);
        if (found) {
          setTrip(found);
          if (found.days && found.days.length > 0) {
            setSelectedDay(found.days[0].id);
          }
        }
      }
      setLoading(false);
    }
  }, [tripId]);

  const handleAddActivity = () => {
    const activityName = prompt('Activity name:');
    if (!activityName || !selectedDay || !trip) return;
    
    const newActivity: Activity = {
      id: `activity-${Date.now()}`,
      title: activityName,
      category: 'activity',
    };
    
    const updatedDays = trip.days.map(day => {
      if (day.id === selectedDay) {
        return {
          ...day,
          activities: [...day.activities, newActivity],
        };
      }
      return day;
    });
    
    const updatedTrip = { ...trip, days: updatedDays };
    setTrip(updatedTrip);
    
    // Save to localStorage
    const saved = localStorage.getItem('wanderlust_trips');
    if (saved) {
      const trips: Trip[] = JSON.parse(saved);
      const updatedTrips = trips.map(t => t.id === tripId ? updatedTrip : t);
      localStorage.setItem('wanderlust_trips', JSON.stringify(updatedTrips));
    }
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)',
        padding: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <p style={{ color: 'white' }}>Loading...</p>
      </div>
    );
  }

  if (!trip) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)',
        padding: '2rem',
      }}>
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          <button
            onClick={() => router.push('/trips')}
            style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', marginBottom: '1rem' }}
          >
            ← Back to Trips
          </button>
          <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', textAlign: 'center' }}>
            <h2 style={{ color: '#1e3a5f', marginBottom: '1rem' }}>Trip not found</h2>
            <button
              onClick={() => router.push('/trips')}
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '10px',
                border: 'none',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                marginTop: '1rem',
              }}
            >
              Go to My Trips
            </button>
          </div>
        </div>
      </div>
    );
  }

  const days = trip.days || [];
  const currentDay = days.find(d => d.id === selectedDay) || days[0];

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)',
      padding: '1rem',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <button
          onClick={() => router.push('/trips')}
          style={{ 
            background: 'transparent', 
            border: 'none', 
            color: 'rgba(255,255,255,0.7)', 
            cursor: 'pointer', 
            marginBottom: '1rem',
            fontSize: '0.875rem',
          }}
        >
          ← Back to Trips
        </button>
        
        <h1 style={{ fontSize: '2rem', fontWeight: '700', color: 'white', marginBottom: '0.25rem' }}>
          {trip.name}
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '1.5rem' }}>
          {trip.startDate} → {trip.endDate}
        </p>

        {/* Day Tabs */}
        {days.length > 0 && (
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
            {days.map((day, index) => (
              <button
                key={day.id}
                onClick={() => setSelectedDay(day.id)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '10px',
                  border: 'none',
                  background: selectedDay === day.id ? '#3b82f6' : '#334155',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  whiteSpace: 'nowrap',
                }}
              >
                Day {index + 1} ({day.activities?.length || 0})
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
          {/* Itinerary */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1e3a5f', margin: 0 }}>
                {currentDay?.date || 'No days'}
              </h2>
              <button
                onClick={handleAddActivity}
                style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                + Add Activity
              </button>
            </div>
            
            {(!currentDay || !currentDay.activities || currentDay.activities.length === 0) ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                <p>No activities planned yet</p>
                <p style={{ fontSize: '0.875rem' }}>Click "+ Add Activity" to start building your itinerary!</p>
              </div>
            ) : (
              <div>
                {currentDay.activities.map((activity) => (
                  <div key={activity.id} style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0' }}>
                    <h3 style={{ margin: 0, fontSize: '1rem', color: '#1e3a5f' }}>{activity.title}</h3>
                    {activity.category && (
                      <span style={{ 
                        display: 'inline-block',
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '6px', 
                        background: '#eff6ff', 
                        color: '#3b82f6',
                        fontSize: '0.75rem',
                        marginTop: '0.5rem',
                      }}>
                        {activity.category}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Map */}
          <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', minHeight: '300px' }}>
            <TripMap 
              className="leaflet-container"
              markers={[]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
