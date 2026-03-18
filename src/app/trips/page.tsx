'use client';

import { useState, useEffect } from 'react';

type Trip = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
};

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('wanderlust_trips');
      if (saved) {
        setTrips(JSON.parse(saved));
      }
      setLoading(false);
    }
  }, []);

  if (loading) {
    return <div style={{ padding: '2rem', color: 'white' }}>Loading...</div>;
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: 'white' }}>My Trips</h1>
      
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
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
