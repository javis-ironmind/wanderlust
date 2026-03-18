'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

type Trip = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  coverImage?: string;
  days?: any[];
  flights?: any[];
  hotels?: any[];
  budgetTotal?: number;
  copiedFrom?: string;
};

type SortOption = 'date-newest' | 'date-oldest' | 'name-az' | 'name-za';

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('date-newest');
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [tripToDuplicate, setTripToDuplicate] = useState<Trip | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const loadTrips = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('wanderlust_trips');
      if (saved) {
        setTrips(JSON.parse(saved));
      }
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      loadTrips();
      setRefreshing(false);
    }, 800);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart !== null && window.innerWidth <= 768) {
      const currentY = e.touches[0].clientY;
      const diff = currentY - touchStart;
      if (diff > 60 && window.scrollY === 0) {
        handleRefresh();
        setTouchStart(null);
      }
    }
  };

  const handleTouchEnd = () => {
    setTouchStart(null);
  };

  // Generate a unique ID
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  // Deep clone trip with new IDs
  const duplicateTrip = (tripToCopy: Trip) => {
    const saved = localStorage.getItem('wanderlust_trips');
    if (!saved) return;
    
    const allTrips: Trip[] = JSON.parse(saved);
    const originalTrip = allTrips.find(t => t.id === tripToCopy.id);
    
    if (!originalTrip) return;
    
    // Deep clone and generate new IDs
    const duplicatedTrip: Trip = {
      ...originalTrip,
      id: generateId(),
      name: `${originalTrip.name} (Copy)`,
      // Deep clone days with new IDs
      days: originalTrip.days?.map((day: any) => ({
        ...day,
        id: generateId(),
        activities: day.activities?.map((activity: any) => ({
          ...activity,
          id: generateId(),
        })) || []
      })) || [],
      // Deep clone flights and hotels
      flights: originalTrip.flights?.map(flight => ({
        ...flight,
        id: generateId(),
      })) || [],
      hotels: originalTrip.hotels?.map(hotel => ({
        ...hotel,
        id: generateId(),
      })) || [],
    };
    
    // Add copiedFrom reference
    duplicatedTrip.copiedFrom = originalTrip.id;
    
    // Save the duplicated trip
    const updatedTrips = [...allTrips, duplicatedTrip];
    localStorage.setItem('wanderlust_trips', JSON.stringify(updatedTrips));
    
    // Close modal and reload
    setShowDuplicateModal(false);
    setTripToDuplicate(null);
    loadTrips();
    
    // Navigate to the new trip
    router.push(`/trips/${duplicatedTrip.id}`);
  };

  const handleDuplicateClick = (e: React.MouseEvent, trip: Trip) => {
    e.preventDefault();
    e.stopPropagation();
    setTripToDuplicate(trip);
    setShowDuplicateModal(true);
  };

  // Filter and sort trips
  const filteredTrips = trips
    .filter(trip => 
      searchQuery.trim() === '' || 
      trip.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'date-newest':
          return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
        case 'date-oldest':
          return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
        case 'name-az':
          return a.name.localeCompare(b.name);
        case 'name-za':
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });

  useEffect(() => {
    loadTrips();
  }, []);

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

  return (
    <>
    <style>{`
      .trip-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 24px -8px rgba(0,0,0,0.2) !important;
      }
      .create-card:hover {
        background: rgba(255,255,255,0.15) !important;
      }
      .search-input:focus {
        outline: none;
        border-color: #3b82f6 !important;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2) !important;
      }
      .sort-select:focus {
        outline: none;
        border-color: #3b82f6 !important;
      }
    `}</style>
    <div 
      ref={containerRef}
      style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)',
        padding: '2rem',
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {refreshing && (
        <div style={{ 
          textAlign: 'center', 
          padding: '0.5rem', 
          color: 'rgba(255,255,255,0.8)',
          fontSize: '0.875rem'
        }}>
          ↻ Refreshing...
        </div>
      )}
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '700', color: 'white', marginBottom: '0.5rem' }}>
          My Trips ✈️
        </h1>

        {/* Search and Sort Controls */}
        {trips.length > 0 && (
          <div style={{ 
            marginTop: '1.5rem', 
            marginBottom: '1.5rem',
            display: 'flex', 
            gap: '1rem',
            flexWrap: 'wrap',
            alignItems: 'center'
          }}>
            {/* Search Input */}
            <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
              <span style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#64748b',
                fontSize: '1rem',
              }}>
                🔍
              </span>
              <input
                type="text"
                placeholder="Search trips..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
                style={{
                  width: '100%',
                  padding: '0.75rem 2.5rem 0.75rem 2.5rem',
                  borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.2)',
                  background: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  fontSize: '0.95rem',
                  boxSizing: 'border-box',
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'rgba(255,255,255,0.6)',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    padding: '0',
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="sort-select"
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.2)',
                background: 'rgba(255,255,255,0.1)',
                color: 'white',
                fontSize: '0.95rem',
                cursor: 'pointer',
                minWidth: '150px',
              }}
            >
              <option value="date-newest" style={{ background: '#1e3a5f' }}>Date (Newest)</option>
              <option value="date-oldest" style={{ background: '#1e3a5f' }}>Date (Oldest)</option>
              <option value="name-az" style={{ background: '#1e3a5f' }}>Name (A-Z)</option>
              <option value="name-za" style={{ background: '#1e3a5f' }}>Name (Z-A)</option>
            </select>
          </div>
        )}

        {/* Trip Count */}
        {trips.length > 0 && (
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            {searchQuery 
              ? `${filteredTrips.length} of ${trips.length} trips`
              : `${trips.length} trip${trips.length !== 1 ? 's' : ''}`
            }
          </p>
        )}
        
        {trips.length === 0 ? (
          <div style={{ marginTop: '2rem' }}>
            <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '1.5rem', fontSize: '1.1rem' }}>
              No trips yet — Start planning your next adventure!
            </p>
            <a
              href="/trips/new"
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                color: 'white',
                padding: '1rem 2rem',
                borderRadius: '12px',
                textDecoration: 'none',
                fontWeight: '600',
                display: 'inline-block',
                boxShadow: '0 4px 14px 0 rgba(59,130,246,0.39)',
              }}
            >
              Create Your First Trip
            </a>
          </div>
        ) : filteredTrips.length === 0 ? (
          <div style={{ marginTop: '2rem', textAlign: 'center', padding: '3rem' }}>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem' }}>
              No trips match "{searchQuery}"
            </p>
            <button
              onClick={() => setSearchQuery('')}
              style={{
                marginTop: '1rem',
                background: 'rgba(255,255,255,0.1)',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.2)',
                cursor: 'pointer',
                fontSize: '0.95rem',
              }}
            >
              Clear Search
            </button>
          </div>
        ) : (
          <div style={{ marginTop: '0.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {filteredTrips.map(trip => (
              <div
                key={trip.id}
                style={{
                  display: 'block',
                  background: 'white',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  textDecoration: 'none',
                  color: '#1e3a5f',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  cursor: 'pointer',
                  position: 'relative',
                }}
                className="trip-card"
                onClick={() => router.push(`/trips/${trip.id}`)}
              >
                <div style={{
                  height: '160px',
                  background: trip.coverImage 
                    ? `url(${trip.coverImage}) center/cover`
                    : `linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)`,
                }} />
                {/* Duplicate Button */}
                <button
                  onClick={(e) => handleDuplicateClick(e, trip)}
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: 'rgba(255,255,255,0.9)',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    zIndex: 10,
                  }}
                  title="Duplicate trip"
                >
                  📋 Duplicate
                </button>
                <div style={{ padding: '1.25rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600' }}>{trip.name}</h3>
                  <p style={{ margin: '0.5rem 0 0', color: '#64748b', fontSize: '0.875rem' }}>
                    📅 {trip.startDate} → {trip.endDate}
                  </p>
                </div>
              </div>
            ))}
            
            <a
              href="/trips/new"
              className="create-card"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                background: 'rgba(255,255,255,0.1)',
                color: 'white',
                padding: '1rem 2rem',
                borderRadius: '12px',
                textDecoration: 'none',
                fontWeight: '500',
                border: '2px dashed rgba(255,255,255,0.3)',
                minHeight: '200px',
                transition: 'background 0.2s ease',
              }}
            >
              + Create New Trip
            </a>
          </div>
        )}
      </div>

      {/* Duplicate Confirmation Modal */}
      {showDuplicateModal && tripToDuplicate && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}
        onClick={() => setShowDuplicateModal(false)}
        >
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '2rem',
            maxWidth: '400px',
            width: '90%',
            textAlign: 'center',
          }}
          onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ margin: '0 0 1rem', fontSize: '1.5rem', color: '#1e3a5f' }}>
              Duplicate Trip?
            </h2>
            <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
              Create a copy of "<strong>{tripToDuplicate.name}</strong>"?
              <br />
              The copy will be named "<strong>{tripToDuplicate.name} (Copy)</strong>"
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                onClick={() => setShowDuplicateModal(false)}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  background: 'white',
                  color: '#64748b',
                  fontSize: '1rem',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => duplicateTrip(tripToDuplicate)}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                ✓ Duplicate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
