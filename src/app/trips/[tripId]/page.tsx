'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

// Dynamic import for Map - Leaflet must run in browser
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MapView = dynamic(() => import('@/components/MapView') as any, {
  ssr: false,
  loading: () => (
    <div style={{
      height: '100%',
      minHeight: '400px',
      background: '#f3f4f6',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '12px',
      color: '#6b7280'
    }}>
      Loading map...
    </div>
  )
});

type Trip = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
};

type Activity = {
  id: string;
  day: number;
  type: 'flight' | 'hotel' | 'activity';
  title: string;
  details?: Record<string, unknown>;
};

export default function TripDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params.tripId as string;
  const [trip, setTrip] = useState<Trip | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('wanderlust_trips');
      if (saved) {
        const trips: Trip[] = JSON.parse(saved);
        const found = trips.find(t => t.id === tripId);
        if (found) {
          setTrip(found);
        }
      }
      
      // Load activities
      const savedActivities = localStorage.getItem(`wanderlust_activities_${tripId}`);
      if (savedActivities) {
        setActivities(JSON.parse(savedActivities));
      }
      
      setLoading(false);
    }
  }, [tripId]);

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

  return (
    <div style={{ padding: '1.5rem', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ marginBottom: '1rem' }}>
        <button
          onClick={() => router.push('/trips')}
          style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', marginBottom: '0.5rem' }}
        >
          ← Back to Trips
        </button>
        
        <h1 style={{ fontSize: '2rem', color: 'white', marginBottom: '0.25rem' }}>{trip.name}</h1>
        <p style={{ color: 'white', fontSize: '1rem', opacity: 0.8 }}>
          {trip.startDate} → {trip.endDate}
        </p>
      </div>
      
      {/* Two Panel Layout */}
      <div style={{ display: 'flex', gap: '1.5rem', flex: 1, minHeight: 0 }}>
        {/* Left Panel - Itinerary */}
        <div style={{ 
          flex: 1, 
          background: 'white', 
          borderRadius: '12px', 
          padding: '1.5rem',
          overflowY: 'auto'
        }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#1f2937' }}>Your Itinerary</h2>
          
          {activities.length === 0 ? (
            <p style={{ color: '#6b7280' }}>No activities yet. Add flights and hotels to get started!</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {activities.map((activity, index) => (
                <div 
                  key={activity.id || index}
                  style={{
                    padding: '1rem',
                    background: '#f9fafb',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span style={{
                      background: activity.type === 'flight' ? '#3b82f6' : activity.type === 'hotel' ? '#8b5cf6' : '#10b981',
                      color: 'white',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      textTransform: 'uppercase'
                    }}>
                      {activity.type}
                    </span>
                    <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                      Day {activity.day}
                    </span>
                  </div>
                  <p style={{ margin: 0, color: '#1f2937', fontWeight: '500' }}>{activity.title}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Right Panel - Map */}
        <div style={{ 
          flex: 1, 
          minHeight: '400px'
        }}>
          <MapView />
        </div>
      </div>
    </div>
  );
}