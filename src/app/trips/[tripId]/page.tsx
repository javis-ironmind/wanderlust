'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

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

  useEffect(() => {
    const saved = localStorage.getItem('wanderlust_trips');
    if (saved) {
      const trips: Trip[] = JSON.parse(saved);
      const found = trips.find(t => t.id === tripId);
      if (found) {
        setTrip(found);
      }
    }
  }, [tripId]);

  if (!trip) {
    return (
      <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto', color: 'white' }}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <button
        onClick={() => router.back()}
        style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', marginBottom: '1rem' }}
      >
        ← Back
      </button>
      
      <h1 style={{ fontSize: '2.5rem', color: 'white', marginBottom: '0.5rem' }}>{trip.name}</h1>
      <p style={{ color: 'white', fontSize: '1.1rem', opacity: 0.8 }}>
        {trip.startDate} → {trip.endDate}
      </p>
      
      <div style={{ marginTop: '2rem', background: 'white', borderRadius: '12px', padding: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Your Itinerary</h2>
        <p style={{ color: '#666' }}>Day-by-day planning coming soon...</p>
      </div>
    </div>
  );
}
