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
    
    // Generate days between start and end dates
    const days = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      days.push({
        id: `day-${d.toISOString().split('T')[0]}`,
        date: d.toISOString().split('T')[0],
        activities: [],
      });
    }
    
    const newTrip = {
      id: `trip-${Date.now()}`,
      name,
      startDate,
      endDate,
      days,
      flights: [],
      hotels: [],
    };
    
    // Save to localStorage
    const existing = localStorage.getItem('wanderlust_trips');
    const trips = existing ? JSON.parse(existing) : [];
    trips.push(newTrip);
    localStorage.setItem('wanderlust_trips', JSON.stringify(trips));
    
    // Navigate to the new trip detail page
    router.push(`/trips/${newTrip.id}`);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)',
      padding: '2rem',
    }}>
      <div style={{ maxWidth: '500px', margin: '0 auto' }}>
        <a href="/trips" style={{ display: 'inline-block', marginBottom: '1.5rem', color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>
          ← Back to Trips
        </a>
        
        <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '0.5rem', color: '#1e3a5f' }}>Create New Trip</h1>
          <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>Start planning your next adventure!</p>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151', fontSize: '0.875rem' }}>
                Where are you going?
              </label>
              <input
                name="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{ 
                  width: '100%', 
                  padding: '0.875rem 1rem', 
                  borderRadius: '12px', 
                  border: '2px solid #e2e8f0', 
                  fontSize: '1rem',
                  transition: 'border-color 0.2s',
                  outline: 'none',
                }}
                placeholder="e.g., Japan Adventure"
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151', fontSize: '0.875rem' }}>
                  Start Date
                </label>
                <input
                  name="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  style={{ 
                    width: '100%', 
                    padding: '0.875rem 1rem', 
                    borderRadius: '12px', 
                    border: '2px solid #e2e8f0', 
                    fontSize: '1rem',
                    outline: 'none',
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151', fontSize: '0.875rem' }}>
                  End Date
                </label>
                <input
                  name="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  style={{ 
                    width: '100%', 
                    padding: '0.875rem 1rem', 
                    borderRadius: '12px', 
                    border: '2px solid #e2e8f0', 
                    fontSize: '1rem',
                    outline: 'none',
                  }}
                />
              </div>
            </div>
            
            <button
              type="submit"
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                color: 'white',
                padding: '1rem 2rem',
                borderRadius: '12px',
                border: 'none',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                marginTop: '0.5rem',
                boxShadow: '0 4px 14px 0 rgba(59,130,246,0.39)',
              }}
            >
              Create Trip ✨
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
