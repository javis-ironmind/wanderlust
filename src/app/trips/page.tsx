'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import TemplateModal from '@/components/TemplateModal';
import { useTripStore } from '@/lib/store';
import { loadFromStorage, saveToStorage } from '@/lib/storage';
import { Trip } from '@/lib/types';

// Trip category config for display
const CATEGORY_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  vacation: { label: 'Vacation', icon: '🏖️', color: '#10B981' },
  business: { label: 'Business', icon: '💼', color: '#3B82F6' },
  weekend: { label: 'Weekend', icon: '🏙️', color: '#8B5CF6' },
  adventure: { label: 'Adventure', icon: '🧗', color: '#F59E0B' },
  family: { label: 'Family', icon: '👨‍👩‍👧‍👦', color: '#EC4899' },
  honeymoon: { label: 'Honeymoon', icon: '💕', color: '#EF4444' },
  friends: { label: 'Friends', icon: '🎉', color: '#6366F1' },
  solo: { label: 'Solo', icon: '🎒', color: '#14B8A6' },
};

type SortOption = 'upcoming' | 'date-newest' | 'date-oldest' | 'name-az' | 'name-za';

export default function TripsPage() {
  const trips = useTripStore((state) => state.trips);
  const setTrips = useTripStore((state) => state.setTrips);
  const updateTrip = useTripStore((state) => state.updateTrip);
  const deleteTrip = useTripStore((state) => state.deleteTrip);
  const archiveTrip = useTripStore((state) => state.archiveTrip);
  const unarchiveTrip = useTripStore((state) => state.unarchiveTrip);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('light'); // T022: dark mode

  // T022: Load theme preference on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('wanderlust_theme');
    if (savedTheme) {
      setTheme(savedTheme as 'light' | 'dark');
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
  }, []);

  // T022: Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('wanderlust_theme', theme);
  }, [theme]);

  const [refreshing, setRefreshing] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('upcoming');
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [tripToDuplicate, setTripToDuplicate] = useState<Trip | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [tripToDelete, setTripToDelete] = useState<Trip | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all'); // AC3: Category filter
  const [editingTripId, setEditingTripId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const loadTrips = useCallback(() => {
    if (typeof window !== 'undefined' && mountedRef.current) {
      const savedTrips = loadFromStorage();
      if (savedTrips.length > 0) {
        setTrips(savedTrips);
      }
      setLoading(false);
    }
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    const timer = setTimeout(() => {
      if (mountedRef.current) {
        loadTrips();
        setRefreshing(false);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [loadTrips]);

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
    const allTrips = useTripStore.getState().trips;
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

    // Save via store and persist
    const updatedTrips = [...allTrips, duplicatedTrip];
    setTrips(updatedTrips);
    saveToStorage(updatedTrips);

    // Close modal and reload
    setShowDuplicateModal(false);
    setTripToDuplicate(null);

    // Navigate to the new trip
    router.push(`/trips/${duplicatedTrip.id}`);
  };

  const handleDuplicateClick = (e: React.MouseEvent, trip: Trip) => {
    e.preventDefault();
    e.stopPropagation();
    setTripToDuplicate(trip);
    setShowDuplicateModal(true);
  };

  const handleDeleteClick = (e: React.MouseEvent, trip: Trip) => {
    e.preventDefault();
    e.stopPropagation();
    setTripToDelete(trip);
    setShowDeleteModal(true);
  };

  // T024: Archive handlers
  const handleArchiveClick = (e: React.MouseEvent, trip: Trip) => {
    e.preventDefault();
    e.stopPropagation();
    archiveTrip(trip.id);
  };

  const handleUnarchiveClick = (e: React.MouseEvent, trip: Trip) => {
    e.preventDefault();
    e.stopPropagation();
    unarchiveTrip(trip.id);
  };

  const handleEditName = (trip: Trip) => {
    setEditingTripId(trip.id);
    setEditingName(trip.name);
  };

  const handleSaveName = (tripId: string) => {
    if (editingName.trim()) {
      updateTrip(tripId, { name: editingName.trim(), updatedAt: new Date().toISOString() });
    }
    setEditingTripId(null);
    setEditingName('');
  };

  // F010 AC7: Clear all data with confirmation
  const handleClearAllData = () => {
    const confirmed = window.confirm('⚠️ Are you sure you want to delete ALL trips? This action cannot be undone.');
    if (confirmed) {
      localStorage.removeItem('wanderlust_trips');
      setTrips([]);
      window.location.reload();
    }
  };

  // F010 AC8: Calculate localStorage usage
  const getStorageUsage = () => {
    const data = localStorage.getItem('wanderlust_trips');
    if (!data) return '0 B';
    const bytes = new Blob([data]).size;
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Filter and sort trips - AC3: Category filter
  const filteredTrips = trips
    .filter(trip => 
      !trip.archived && // T024: Exclude archived trips from main view
      (searchQuery.trim() === '' || 
        trip.name.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (categoryFilter === 'all' || 
        (trip.categories && trip.categories.includes(categoryFilter)))
    )
    .sort((a, b) => {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const daysUntilA = Math.ceil((new Date(a.startDate).setHours(0,0,0,0) - now.getTime()) / (1000 * 60 * 60 * 24));
      const daysUntilB = Math.ceil((new Date(b.startDate).setHours(0,0,0,0) - now.getTime()) / (1000 * 60 * 60 * 24));
      switch (sortBy) {
        case 'upcoming':
          return daysUntilA - daysUntilB;
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

  // T024: Separate archived trips list
  const archivedTrips = trips
    .filter(trip => trip.archived)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  useEffect(() => {
    loadTrips();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      :root {
        --bg-primary: #0f172a;
        --bg-secondary: #1e293b;
        --bg-card: #334155;
        --text-primary: #f1f5f9;
        --text-secondary: #94a3b8;
        --accent: #3b82f6;
      }
      [data-theme="light"] {
        --bg-primary: #f8fafc;
        --bg-secondary: #ffffff;
        --bg-card: #ffffff;
        --text-primary: #1e293b;
        --text-secondary: #64748b;
        --accent: #3b82f6;
      }
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '700', color: 'white', margin: 0 }}>
            My Trips ✈️
          </h1>
          {/* T022: Dark mode toggle */}
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '8px',
              padding: '0.5rem',
              cursor: 'pointer',
              fontSize: '1.25rem',
            }}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>

        {/* T020: Statistics Dashboard */}
        {trips.length > 0 && (() => {
          // Calculate stats
          const totalTrips = trips.length;
          const now = new Date();
          now.setHours(0, 0, 0, 0);
          
          let totalDays = 0;
          let totalFutureDays = 0;
          const locations = new Set<string>();
          
          trips.forEach(trip => {
            const start = new Date(trip.startDate);
            const end = new Date(trip.endDate);
            const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
            totalDays += days;
            
            if (end.getTime() >= now.getTime()) {
              const futureDays = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
              totalFutureDays += futureDays;
            }
            
            // Extract location from days/activities
            trip.days.forEach(day => {
              day.activities.forEach(activity => {
                if (activity.location && typeof activity.location === 'object' && 'name' in activity.location) {
                  locations.add((activity.location as any).name);
                }
              });
            });
          });
          
          const avgDuration = totalTrips > 0 ? Math.round(totalDays / totalTrips) : 0;
          const nextTrip = trips
            .filter(t => new Date(t.endDate).getTime() >= now.getTime())
            .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())[0];
          
          let daysUntilNext = 0;
          if (nextTrip) {
            daysUntilNext = Math.ceil((new Date(nextTrip.startDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          }
          
          return (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
              gap: '1rem',
              marginTop: '1rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{ 
                background: 'rgba(255,255,255,0.1)', 
                borderRadius: '12px', 
                padding: '1rem',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white' }}>{totalTrips}</div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>Trips</div>
              </div>
              <div style={{ 
                background: 'rgba(255,255,255,0.1)', 
                borderRadius: '12px', 
                padding: '1rem',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white' }}>{totalDays}</div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>Days Traveled</div>
              </div>
              <div style={{ 
                background: 'rgba(255,255,255,0.1)', 
                borderRadius: '12px', 
                padding: '1rem',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white' }}>{locations.size}</div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>Locations</div>
              </div>
              <div style={{ 
                background: 'rgba(255,255,255,0.1)', 
                borderRadius: '12px', 
                padding: '1rem',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white' }}>{avgDuration}</div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>Avg Days</div>
              </div>
              {nextTrip && daysUntilNext > 0 && (
                <div style={{ 
                  background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', 
                  borderRadius: '12px', 
                  padding: '1rem',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white' }}>{daysUntilNext}</div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.9)', textTransform: 'uppercase' }}>Until Next</div>
                </div>
              )}
            </div>
          );
        })()}

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
              <option value="upcoming" style={{ background: '#1e3a5f' }}>Upcoming</option>
              <option value="date-newest" style={{ background: '#1e3a5f' }}>Date (Newest)</option>
              <option value="date-oldest" style={{ background: '#1e3a5f' }}>Date (Oldest)</option>
              <option value="name-az" style={{ background: '#1e3a5f' }}>Name (A-Z)</option>
              <option value="name-za" style={{ background: '#1e3a5f' }}>Name (Z-A)</option>
            </select>
            
            {/* AC3: Category Filter Dropdown */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.2)',
                background: 'rgba(255,255,255,0.1)',
                color: 'white',
                fontSize: '0.95rem',
                cursor: 'pointer',
                minWidth: '140px',
              }}
            >
              <option value="all" style={{ background: '#1e3a5f' }}>All Categories</option>
              <option value="vacation" style={{ background: '#1e3a5f' }}>🏖️ Vacation</option>
              <option value="business" style={{ background: '#1e3a5f' }}>💼 Business</option>
              <option value="weekend" style={{ background: '#1e3a5f' }}>🏙️ Weekend</option>
              <option value="adventure" style={{ background: '#1e3a5f' }}>🧗 Adventure</option>
              <option value="family" style={{ background: '#1e3a5f' }}>👨‍👩‍👧‍👦 Family</option>
              <option value="honeymoon" style={{ background: '#1e3a5f' }}>💕 Honeymoon</option>
              <option value="friends" style={{ background: '#1e3a5f' }}>🎉 Friends</option>
              <option value="solo" style={{ background: '#1e3a5f' }}>🎒 Solo</option>
            </select>
          </div>
        )}

        {/* F010 AC7/AC8: Storage usage and clear data */}
        {trips.length > 0 && (
          <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem' }}>
              📦 {getStorageUsage()}
            </span>
            <button
              onClick={handleClearAllData}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'rgba(255,255,255,0.4)',
                fontSize: '0.75rem',
                cursor: 'pointer',
                padding: '0.25rem 0.5rem',
                textDecoration: 'underline',
              }}
              title="Delete all trips and clear localStorage"
            >
              Clear all data
            </button>
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
                {/* Delete Button */}
                <button
                  onClick={(e) => handleDeleteClick(e, trip)}
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '80px',
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
                  title="Delete trip"
                >
                  🗑️ Delete
                </button>
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
                {/* T024: Archive/Unarchive Button */}
                <button
                  onClick={(e) => trip.archived ? handleUnarchiveClick(e, trip) : handleArchiveClick(e, trip)}
                  style={{
                    position: 'absolute',
                    top: '50px',
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
                  title={trip.archived ? "Restore to main view" : "Archive this trip"}
                >
                  {trip.archived ? '📤 Unarchive' : '📦 Archive'}
                </button>
                <div style={{ padding: '1.25rem' }}>
                  {editingTripId === trip.id ? (
                    <input
                      autoFocus
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onBlur={() => handleSaveName(trip.id)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveName(trip.id)}
                      style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600', border: '2px solid #3b82f6', borderRadius: '8px', padding: '0.25rem 0.5rem', width: '100%', outline: 'none' }}
                    />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600' }}>{trip.name}</h3>
                      <button
                        onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleEditName(trip); }}
                        title="Edit trip name"
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 8px', fontSize: '1rem', opacity: 0.5 }}
                      >
                        ✏️
                      </button>
                    </div>
                  )}
                  {/* AC2: Category badges on trip card */}
                  {trip.categories && trip.categories.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginTop: '0.5rem' }}>
                      {trip.categories.map((cat) => {
                        const config = CATEGORY_CONFIG[cat];
                        if (!config) {
                          // Custom tag - show as generic badge
                          return (
                            <span
                              key={cat}
                              style={{
                                background: '#e2e8f0',
                                color: '#64748b',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '6px',
                                fontSize: '0.7rem',
                                fontWeight: '500',
                              }}
                            >
                              {cat}
                            </span>
                          );
                        }
                        return (
                          <span
                            key={cat}
                            style={{
                              background: `${config.color}15`,
                              color: config.color,
                              padding: '0.25rem 0.5rem',
                              borderRadius: '6px',
                              fontSize: '0.7rem',
                              fontWeight: '500',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                            }}
                          >
                            {config.icon} {config.label}
                          </span>
                        );
                      })}
                    </div>
                  )}
                  <p style={{ margin: '0.5rem 0 0', color: '#64748b', fontSize: '0.875rem' }}>
                    📅 {trip.startDate} → {trip.endDate}
                    {(() => {
                      const start = new Date(trip.startDate).getTime();
                      const end = new Date(trip.endDate).getTime();
                      const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
                      return ` · ${duration} day${duration !== 1 ? 's' : ''}`;
                    })()}
                    {(() => {
                      const now = new Date();
                      now.setHours(0, 0, 0, 0);
                      const tripStart = new Date(trip.startDate);
                      tripStart.setHours(0, 0, 0, 0);
                      const daysUntil = Math.ceil((tripStart.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                      let countdown = '';
                      let badgeColor = '';
                      if (daysUntil < 0) {
                        return null; // Don't show badge for past trips
                      } else if (daysUntil === 0) {
                        countdown = 'Today!';
                        badgeColor = '#22c55e';
                      } else if (daysUntil === 1) {
                        countdown = 'Tomorrow';
                        badgeColor = '#22c55e';
                      } else if (daysUntil <= 7) {
                        countdown = `in ${daysUntil} days`;
                        badgeColor = '#f59e0b';
                      } else if (daysUntil <= 30) {
                        const weeks = Math.ceil(daysUntil / 7);
                        countdown = `in ${weeks} week${weeks > 1 ? 's' : ''}`;
                        badgeColor = '#3b82f6';
                      } else {
                        const months = Math.ceil(daysUntil / 30);
                        countdown = `in ${months} month${months > 1 ? 's' : ''}`;
                        badgeColor = '#8b5cf6';
                      }
                      return (
                        <span style={{ 
                          marginLeft: '0.5rem', 
                          padding: '2px 8px', 
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          backgroundColor: badgeColor,
                          color: 'white'
                        }}>
                          {countdown}
                        </span>
                      );
                    })()}
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
            
            {/* Create from Template Button */}
            <button
              onClick={() => setShowTemplateModal(true)}
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
                cursor: 'pointer',
              }}
            >
              📋 From Template
            </button>
          </div>
        )}
      </div>

      {/* T024: Archived Trips Section */}
      {archivedTrips.length > 0 && (
        <div style={{ marginTop: '3rem' }}>
          <h2 style={{ 
            fontSize: '1.5rem', 
            fontWeight: '700', 
            color: 'white', 
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            📦 Archived Trips ({archivedTrips.length})
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1.5rem',
          }}>
            {archivedTrips.map((trip) => (
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
                  opacity: 0.8,
                }}
                className="trip-card"
                onClick={() => router.push(`/trips/${trip.id}`)}
              >
                <div style={{
                  height: '120px',
                  background: trip.coverImage 
                    ? `url(${trip.coverImage}) center/cover`
                    : `linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)`,
                }} />
                {/* Archived Badge */}
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  left: '10px',
                  background: 'rgba(107, 114, 128, 0.9)',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                }}>
                  📦 Archived
                </div>
                {/* Unarchive Button */}
                <button
                  onClick={(e) => handleUnarchiveClick(e, trip)}
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
                  title="Restore to main view"
                >
                  📤 Unarchive
                </button>
                <div style={{ padding: '1rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '600' }}>
                    {trip.name}
                  </h3>
                  <p style={{ margin: '0.5rem 0 0', color: '#64748b', fontSize: '0.875rem' }}>
                    📅 {trip.startDate} → {trip.endDate}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && tripToDelete && (
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
        onClick={() => setShowDeleteModal(false)}
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
            <h2 style={{ margin: '0 0 1rem', fontSize: '1.5rem', color: '#dc2626' }}>
              Delete Trip?
            </h2>
            <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
              Are you sure you want to delete "<strong>{tripToDelete.name}</strong>"?
              <br />
              This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                onClick={() => setShowDeleteModal(false)}
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
                onClick={() => {
                  deleteTrip(tripToDelete.id);
                  setShowDeleteModal(false);
                  setTripToDelete(null);
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#dc2626',
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Template Modal for creating from template */}
      <TemplateModal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        mode="load"
      />
    </div>
    </>
  );
}
