'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { TripMap } from '@/components/map/TripMap';
import { SaveIndicator } from '@/components/SaveIndicator';
import { ExportImport } from '@/components/ExportImport';
import { loadFromStorage, saveToStorage } from '@/lib/storage';
import { Trip } from '@/lib/types';

export default function TripDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params.tripId as string;
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadedTrips = loadFromStorage();
    const found = loadedTrips.find(t => t.id === tripId);
    if (found) {
      setTrip(found);
    }
    setLoading(false);
  }, [tripId]);

  // Auto-save on changes
  useEffect(() => {
    if (trip) {
      const loadedTrips = loadFromStorage();
      const updatedTrips = loadedTrips.map(t => t.id === trip.id ? trip : t);
      // If trip not in storage, add it
      if (!updatedTrips.find(t => t.id === trip.id)) {
        updatedTrips.push(trip);
      }
      saveToStorage(updatedTrips);
    }
  }, [trip]);

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
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <h1 style={{ fontSize: '2.5rem', color: 'white', margin: 0 }}>{trip.name}</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <SaveIndicator />
          <ExportImport trips={[trip]} onImport={() => {}} />
        </div>
      </div>
      
      <p style={{ color: 'white', fontSize: '1.1rem', opacity: 0.8, marginBottom: '2rem' }}>
        {trip.startDate} → {trip.endDate}
      </p>
      
      {/* Map Section */}
      <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden' }}>
        <TripMap 
          className="leaflet-container"
          markers={[]}  // Will be populated with activities
        />
      </div>
    </div>
  );
}
