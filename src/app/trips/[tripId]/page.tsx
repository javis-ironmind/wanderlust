'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { TripMap } from '@/components/map/TripMap';

type Trip = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
};

export default function TripDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params.tripId as string;
  const [trip, setTrip] = useState<Trip | null>(null);
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
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <button
        onClick={() => router.push('/trips')}
        style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', marginBottom: '1rem' }}
      >
        ← Back to Trips
      </button>
      
      <h1 style={{ fontSize: '2.5rem', color: 'white', marginBottom: '0.5rem' }}>{trip.name}</h1>
      <p style={{ color: 'white', fontSize: '1.1rem', opacity: 0.8, marginBottom: '2rem' }}>
        {trip.startDate} → {trip.endDate}
      </p>
      
      {/* Map Section */}
      <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden' }}>
        <TripMap className="leaflet-container" />
      </div>
    </div>
  );
}
