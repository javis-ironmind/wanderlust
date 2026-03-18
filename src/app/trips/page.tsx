'use client';

import { useState, useEffect } from 'react';
import { SaveIndicator } from '@/components/SaveIndicator';
import { ExportImport } from '@/components/ExportImport';
import { Trip } from '@/lib/types';
import { loadFromStorage, saveToStorage } from '@/lib/storage';

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Load initial data
  useEffect(() => {
    const loadedTrips = loadFromStorage();
    setTrips(loadedTrips);
    setLoading(false);
  }, []);
  
  // Auto-save when trips change
  useEffect(() => {
    if (!loading && trips.length > 0) {
      saveToStorage(trips);
    }
  }, [trips, loading]);
  
  const handleImport = (importedTrips: Trip[]) => {
    // Merge: add imported trips that don't already exist
    const existingIds = new Set(trips.map(t => t.id));
    const newTrips = importedTrips.filter(t => !existingIds.has(t.id));
    setTrips(prev => [...prev, ...newTrips]);
  };

  if (loading) {
    return <div style={{ padding: '2rem', color: 'white' }}>Loading...</div>;
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <h1 style={{ fontSize: '2.5rem', color: 'white', margin: 0 }}>My Trips</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <SaveIndicator />
          {trips.length > 0 && (
            <ExportImport trips={trips} onImport={handleImport} />
          )}
        </div>
      </div>
      
      {trips.length === 0 ? (
        <div style={{ marginTop: '2rem' }}>
          <p style={{ color: 'white', marginBottom: '1.5rem', fontSize: '1.1rem' }}>
            No trips yet - Start planning your next adventure!
          </p>
          <a
            href="/trips/new"
            style={{
              background: 'white',
              color: '#667eea',
              padding: '14px 28px',
              borderRadius: '12px',
              textDecoration: 'none',
              fontWeight: '600',
              display: 'inline-block'
            }}
          >
            Create Your First Trip
          </a>
        </div>
      ) : (
        <div style={{ marginTop: '2rem' }}>
          {trips.map(trip => (
            <a
              key={trip.id}
              href={`/trips/${trip.id}`}
              style={{
                display: 'block',
                background: 'white',
                padding: '1.5rem',
                borderRadius: '12px',
                marginBottom: '1rem',
                textDecoration: 'none',
                color: '#333',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            >
              <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{trip.name}</h3>
              <p style={{ margin: '0.5rem 0 0', color: '#666' }}>
                {trip.startDate} → {trip.endDate}
              </p>
              <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#999' }}>
                {trip.days?.length || 0} days · {trip.flights?.length || 0} flights · {trip.hotels?.length || 0} hotels
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
