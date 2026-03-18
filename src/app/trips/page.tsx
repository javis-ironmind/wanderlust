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
    return <div className="p-4 md:p-8 text-white">Loading...</div>;
  }

  return (
    <div className="p-4 md:p-8 max-w-2xl lg:max-w-4xl mx-auto">
      {/* Header - Responsive */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-2">
        <h1 className="text-2xl md:text-3xl lg:text-4xl text-white m-0">My Trips</h1>
        <div className="flex items-center gap-2 md:gap-4">
          <SaveIndicator />
          {trips.length > 0 && (
            <ExportImport trips={trips} onImport={handleImport} />
          )}
        </div>
      </div>
      
      {trips.length === 0 ? (
        <div className="mt-4 md:mt-8">
          <p className="text-white text-base md:text-lg mb-4 md:mb-6">
            No trips yet - Start planning your next adventure!
          </p>
          <a
            href="/trips/new"
            className="inline-block px-5 py-3 md:px-7 md:py-4 rounded-xl text-base md:text-lg font-semibold"
            style={{
              background: 'white',
              color: '#667eea',
              textDecoration: 'none',
            }}
          >
            Create Your First Trip
          </a>
        </div>
      ) : (
        <div className="mt-4 md:mt-8">
          {trips.map(trip => (
            <a
              key={trip.id}
              href={`/trips/${trip.id}`}
              className="block p-4 md:p-6 rounded-xl mb-3 md:mb-4 no-underline"
              style={{
                background: 'white',
                color: '#333',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            >
              <h3 className="text-lg md:text-xl m-0">{trip.name}</h3>
              <p className="text-sm md:text-base mt-1 md:mt-2 mb-0 text-gray-600">
                {trip.startDate} → {trip.endDate}
              </p>
              <div className="mt-1 md:mt-2 text-xs md:text-sm text-gray-500">
                {trip.days?.length || 0} days · {trip.flights?.length || 0} flights · {trip.hotels?.length || 0} hotels
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
