'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewTripPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newTrip = {
      id: Date.now().toString(),
      name,
      startDate,
      endDate
    };
    
    // Save to localStorage
    const existing = localStorage.getItem('wanderlust_trips');
    const trips = existing ? JSON.parse(existing) : [];
    trips.push(newTrip);
    localStorage.setItem('wanderlust_trips', JSON.stringify(trips));
    
    router.push('/trips');
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <a href="/trips" style={{ display: 'inline-block', marginBottom: '1rem', color: 'white', textDecoration: 'none' }}>
        ← Back
      </a>
      
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem', color: 'white' }}>Create New Trip</h1>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'white' }}>
            Trip Name
          </label>
          <input
            name="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }}
            placeholder="e.g., Japan Adventure 2026"
          />
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'white' }}>
              Start Date
            </label>
            <input
              name="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'white' }}>
              End Date
            </label>
            <input
              name="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }}
            />
          </div>
        </div>
        
        <button
          type="submit"
          style={{
            background: 'white',
            color: '#667eea',
            padding: '1rem 2rem',
            borderRadius: '8px',
            border: 'none',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            marginTop: '1rem'
          }}
        >
          Create Trip
        </button>
      </form>
    </div>
  );
}
