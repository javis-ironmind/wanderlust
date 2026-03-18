'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { TripMap } from '@/components/map/TripMap';
import { exportTripToPDF } from '@/lib/exportPDF';
import { ShareModal } from '@/components/ShareModal';
import { WeatherWidget } from '@/components/WeatherWidget';
import { BudgetWidget } from '@/components/BudgetWidget';
import PackingList from '@/components/PackingList';
import CloudSyncSettings from '@/components/CloudSyncSettings';
import CalendarExport from '@/components/CalendarExport';

type Activity = {
  id: string;
  title: string;
  category?: string;
  startTime?: string;  // ISO datetime
  endTime?: string;    // ISO datetime
  startDate?: string;  // For multi-day activities (YYYY-MM-DD)
  endDate?: string;    // For multi-day activities (YYYY-MM-DD)
  cost?: number;
  currency?: string;
  location?: {
    latitude?: number;
    longitude?: number;
    name?: string;
  };
};

type Day = {
  id: string;
  date: string;
  activities: Activity[];
};

// Sort activities by start time within a day
function sortActivitiesByTime(activities: Activity[]): Activity[] {
  return [...activities].sort((a, b) => {
    // Activities without start time go to the end
    if (!a.startTime && !b.startTime) return 0;
    if (!a.startTime) return 1;
    if (!b.startTime) return -1;
    
    // Compare by start time
    return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
  });
}

type Trip = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  days: Day[];
  flights: any[];
  hotels: any[];
  budgetTotal?: number;
};

export default function TripDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params.tripId as string;
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newActivityName, setNewActivityName] = useState('');
  const [newActivityCategory, setNewActivityCategory] = useState('activity');
  const [newActivityStartTime, setNewActivityStartTime] = useState('');
  const [newActivityEndTime, setNewActivityEndTime] = useState('');
  const [newActivityStartDate, setNewActivityStartDate] = useState(''); // For multi-day
  const [newActivityEndDate, setNewActivityEndDate] = useState(''); // For multi-day
  const [newActivityCost, setNewActivityCost] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'itinerary' | 'explore' | 'budget' | 'journal'>('itinerary');
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set()); // Track which days are expanded
  const [quickAddText, setQuickAddText] = useState<Record<string, string>>({}); // Quick add input per day

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('wanderlust_trips');
      if (saved) {
        const trips: Trip[] = JSON.parse(saved);
        const found = trips.find(t => t.id === tripId);
        if (found) {
          setTrip(found);
          if (found.days && found.days.length > 0) {
            setSelectedDay(found.days[0].id);
          }
        }
      }
      setLoading(false);
    }
  }, [tripId]);

  const handleAddActivity = () => {
    if (!newActivityName.trim() || !selectedDay || !trip) return;
    
    const newActivity: Activity = {
      id: `activity-${Date.now()}`,
      title: newActivityName.trim(),
      category: newActivityCategory,
      startTime: newActivityStartTime || undefined,
      endTime: newActivityEndTime || undefined,
      startDate: newActivityStartDate || undefined,
      endDate: newActivityEndDate || undefined,
      cost: newActivityCost ? parseFloat(newActivityCost) : undefined,
      currency: 'USD',
    };
    
    const updatedDays = trip.days.map(day => {
      if (day.id === selectedDay) {
        return {
          ...day,
          activities: [...day.activities, newActivity],
        };
      }
      return day;
    });
    
    const updatedTrip = { ...trip, days: updatedDays };
    setTrip(updatedTrip);
    
    const saved = localStorage.getItem('wanderlust_trips');
    if (saved) {
      const trips: Trip[] = JSON.parse(saved);
      const updatedTrips = trips.map(t => t.id === tripId ? updatedTrip : t);
      localStorage.setItem('wanderlust_trips', JSON.stringify(updatedTrips));
    }
    
    setNewActivityName('');
    setNewActivityCategory('activity');
    setNewActivityStartTime('');
    setNewActivityEndTime('');
    setNewActivityStartDate('');
    setNewActivityEndDate('');
    setNewActivityCost('');
    setShowAddModal(false);
  };

  const handleUpdateBudget = (budget: number) => {
    if (!trip) return;
    const updatedTrip = { ...trip, budgetTotal: budget };
    setTrip(updatedTrip);
    
    const saved = localStorage.getItem('wanderlust_trips');
    if (saved) {
      const trips: Trip[] = JSON.parse(saved);
      const updatedTrips = trips.map(t => t.id === tripId ? updatedTrip : t);
      localStorage.setItem('wanderlust_trips', JSON.stringify(updatedTrips));
    }
  };

  // Toggle day expansion (collapsible sections)
  const toggleDay = (dayId: string) => {
    setExpandedDays(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dayId)) {
        newSet.delete(dayId);
      } else {
        newSet.add(dayId);
      }
      return newSet;
    });
  };

  // Quick add activity to a day
  const handleQuickAdd = (dayId: string) => {
    const text = quickAddText[dayId]?.trim();
    if (!text || !trip) return;
    
    const newActivity: Activity = {
      id: `activity-${Date.now()}`,
      title: text,
      category: 'activity',
    };
    
    const updatedDays = trip.days.map(day => {
      if (day.id === dayId) {
        return { ...day, activities: [...day.activities, newActivity] };
      }
      return day;
    });
    
    const updatedTrip = { ...trip, days: updatedDays };
    setTrip(updatedTrip);
    
    const saved = localStorage.getItem('wanderlust_trips');
    if (saved) {
      const trips: Trip[] = JSON.parse(saved);
      const updatedTrips = trips.map(t => t.id === tripId ? updatedTrip : t);
      localStorage.setItem('wanderlust_trips', JSON.stringify(updatedTrips));
    }
    
    setQuickAddText(prev => ({ ...prev, [dayId]: '' }));
  };

  // Auto-fill day placeholder
  const handleAutoFillDay = (dayId: string) => {
    alert('Auto-fill: Coming soon! This will suggest popular activities for this location.');
  };

  // Optimize route placeholder
  const handleOptimizeRoute = (dayId: string) => {
    alert('Optimize Route: Coming soon! This will reorder activities for optimal travel time.');
  };

  // Initialize expanded days with first day on load
  useEffect(() => {
    if (trip?.days?.length && expandedDays.size === 0) {
      setExpandedDays(new Set([trip.days[0].id]));
    }
  }, [trip?.days]);

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

  if (!trip) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)',
        padding: '2rem',
      }}>
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          <button
            onClick={() => router.push('/trips')}
            style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', marginBottom: '1rem' }}
          >
            ← Back to Trips
          </button>
          <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', textAlign: 'center' }}>
            <h2 style={{ color: '#1e3a5f', marginBottom: '1rem' }}>Trip not found</h2>
            <button
              onClick={() => router.push('/trips')}
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '10px',
                border: 'none',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                marginTop: '1rem',
              }}
            >
              Go to My Trips
            </button>
          </div>
        </div>
      </div>
    );
  }

  const days = trip.days || [];
  const currentDay = days.find(d => d.id === selectedDay) || days[0];

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)',
      padding: '1rem',
      paddingBottom: '5rem',
    }}>
      {/* AC1: Hero image with trip cover */}
      <div style={{
        height: '200px',
        background: trip?.name?.includes('Paris') 
          ? 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(30,58,95,1) 100%), url(https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200) center/cover'
          : trip?.name?.includes('Tokyo')
          ? 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(30,58,95,1) 100%), url(https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200) center/cover'
          : trip?.name?.includes('New York')
          ? 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(30,58,95,1) 100%), url(https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1200) center/cover'
          : 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(30,58,95,1) 100%), url(https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200) center/cover',
        borderRadius: '20px',
        position: 'relative',
        marginBottom: '1rem',
      }}>
        <div style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between' }}>
          <button
            onClick={() => router.push('/trips')}
            style={{ 
              background: 'rgba(0,0,0,0.5)', 
              border: 'none', 
              color: 'white', 
              cursor: 'pointer',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              backdropFilter: 'blur(4px)',
            }}
          >
            ← Back
          </button>
        </div>
        {/* AC2: Trip title with dates */}
        <div style={{ 
          position: 'absolute', 
          bottom: '1rem', 
          left: '1rem', 
          right: '1rem',
        }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: 'white', margin: 0 }}>
            {trip?.name || 'Trip'}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', margin: '0.25rem 0 0' }}>
            📅 {trip?.startDate} → {trip?.endDate}
          </p>
        </div>
      </div>

      {/* AC5: Reservation icons row */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', overflowX: 'auto' }}>
        {[
          { icon: '✈️', label: 'Flight' },
          { icon: '🏨', label: 'Hotel' },
          { icon: '🚗', label: 'Car' },
          { icon: '🍽️', label: 'Restaurant' },
          { icon: '📎', label: 'More' },
        ].map((item) => (
          <button key={item.label} style={{
            display: 'flex', alignItems: 'center', gap: '0.25rem',
            padding: '0.5rem 0.75rem', background: '#1e3a5f', border: 'none',
            borderRadius: '8px', color: 'white', fontSize: '0.8rem',
          }}>
            {item.icon} {item.label}
          </button>
        ))}
      </div>

      {/* AC3: Tab navigation */}
      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        {[
          { id: 'overview', label: '📋 Overview' },
          { id: 'itinerary', label: '📅 Itinerary' },
          { id: 'explore', label: '🔍 Explore' },
          { id: 'budget', label: '💰 $' },
          { id: 'journal', label: '📝 Journal' },
        ].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
            style={{
              padding: '0.5rem 0.75rem', background: 'transparent', border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid #3b82f6' : '2px solid transparent',
              color: activeTab === tab.id ? 'white' : 'rgba(255,255,255,0.5)',
              cursor: 'pointer', fontSize: '0.8rem',
            }}>
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            onClick={() => router.push('/trips')}
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: 'rgba(255,255,255,0.7)', 
              cursor: 'pointer', 
              marginBottom: '1rem',
              fontSize: '0.875rem',
            }}
          >
            ← Back to Trips
          </button>
          <button
            onClick={() => trip && exportTripToPDF(trip)}
            style={{
              background: '#10b981',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: 'none',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
              marginBottom: '1rem',
              marginRight: '0.5rem',
            }}
          >
            📄 Export PDF
          </button>
          <button
            onClick={() => setShowShareModal(true)}
            style={{
              background: '#8b5cf6',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: 'none',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
              marginBottom: '1rem',
            }}
          >
            🔗 Share
          </button>
          {trip && <CalendarExport trip={trip} />}
        </div>
        
        <h1 style={{ fontSize: '2rem', fontWeight: '700', color: 'white', marginBottom: '0.25rem' }}>
          {trip.name}
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '1rem' }}>
          {trip.startDate} → {trip.endDate}
        </p>

        {/* Budget Widget */}
        <BudgetWidget trip={trip} onUpdateBudget={handleUpdateBudget} />

        {/* Cloud Sync Settings */}
        <div style={{ marginTop: '1rem' }}>
          <CloudSyncSettings />
        </div>

        {/* Packing List */}
        <div style={{ marginTop: '1rem' }}>
          <PackingList tripId={tripId} />
        </div>

        {days.length > 0 && (
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
            {days.map((day, index) => (
              <div key={day.id} style={{ position: 'relative' }}>
                <button
                  onClick={() => setSelectedDay(day.id)}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '10px',
                    border: 'none',
                    background: selectedDay === day.id ? '#3b82f6' : '#334155',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Day {index + 1} ({day.activities?.length || 0})
                </button>
                <WeatherWidget 
                  tripId={trip.id}
                  startDate={trip.startDate}
                  endDate={trip.endDate}
                  location={trip.name.split(' ').pop() || trip.name} 
                  date={day.date}
                />
              </div>
            ))}
          </div>
        )}

        {/* Itinerary - Collapsible Day Sections (T002) */}
        <div style={{ marginBottom: '1rem' }}>
          {days.map((day, index) => {
            const isExpanded = expandedDays.has(day.id);
            const activityCount = day.activities?.length || 0;
            
            return (
              <div key={day.id} style={{ 
                background: 'white', 
                borderRadius: '12px', 
                marginBottom: '0.75rem',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              }}>
                {/* AC1: Collapsible Day Header with Toggle */}
                <div 
                  onClick={() => toggleDay(day.id)}
                  style={{ 
                    padding: '1rem 1.25rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    background: isExpanded ? '#f8fafc' : 'white',
                    borderBottom: isExpanded ? '1px solid #e2e8f0' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {/* AC1: ▼ / ▶ toggle icon */}
                    <span style={{ 
                      fontSize: '0.75rem', 
                      color: '#64748b',
                      transition: 'transform 0.2s',
                      transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                    }}>
                      {isExpanded ? '▼' : '▶'}
                    </span>
                    {/* AC2: Date and activity count */}
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: '#1e3a5f' }}>
                        Day {index + 1}
                      </h3>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
                        {day.date} • {activityCount} {activityCount === 1 ? 'activity' : 'activities'}
                      </p>
                    </div>
                  </div>
                  {/* Quick add button in header */}
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedDay(day.id); setShowAddModal(true); }}
                    style={{
                      background: '#3b82f6',
                      color: 'white',
                      padding: '0.4rem 0.75rem',
                      borderRadius: '6px',
                      border: 'none',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    + Add
                  </button>
                </div>
                
                {/* AC3: "Add a place" input when expanded */}
                {isExpanded && (
                  <div style={{ padding: '0.75rem 1.25rem', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="text"
                        placeholder="Add a place..."
                        value={quickAddText[day.id] || ''}
                        onChange={(e) => setQuickAddText(prev => ({ ...prev, [day.id]: e.target.value }))}
                        onKeyDown={(e) => e.key === 'Enter' && handleQuickAdd(day.id)}
                        style={{
                          flex: 1,
                          padding: '0.5rem 0.75rem',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          fontSize: '0.875rem',
                          outline: 'none',
                        }}
                      />
                      <button
                        onClick={() => handleQuickAdd(day.id)}
                        style={{
                          background: '#10b981',
                          color: 'white',
                          padding: '0.5rem 1rem',
                          borderRadius: '8px',
                          border: 'none',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                        }}
                      >
                        Add
                      </button>
                    </div>
                    {/* AC4: Auto-fill and Optimize buttons */}
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                      <button
                        onClick={() => handleAutoFillDay(day.id)}
                        style={{
                          background: '#f59e0b',
                          color: 'white',
                          padding: '0.35rem 0.75rem',
                          borderRadius: '6px',
                          border: 'none',
                          fontSize: '0.7rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                        }}
                      >
                        ⚡ Auto-fill day
                      </button>
                      <button
                        onClick={() => handleOptimizeRoute(day.id)}
                        style={{
                          background: '#8b5cf6',
                          color: 'white',
                          padding: '0.35rem 0.75rem',
                          borderRadius: '6px',
                          border: 'none',
                          fontSize: '0.7rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                        }}
                      >
                        🗺️ Optimize route
                      </button>
                    </div>
                  </div>
                )}
                
                {/* AC5 & AC6: Activities with time, name, category icon, drag handle */}
                {isExpanded && (
                  <div>
                    {(!day.activities || day.activities.length === 0) ? (
                      <div style={{ padding: '1.5rem', textAlign: 'center', color: '#94a3b8' }}>
                        <p style={{ margin: 0 }}>No activities yet</p>
                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem' }}>Add a place above or click + Add</p>
                      </div>
                    ) : (
                      sortActivitiesByTime(day.activities).map((activity) => (
                        <div 
                          key={activity.id} 
                          style={{ 
                            padding: '1rem 1.25rem', 
                            borderBottom: '1px solid #f1f5f9',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                          }}
                        >
                          {/* AC6: Drag handle */}
                          <div style={{ 
                            cursor: 'grab', 
                            color: '#cbd5e1',
                            fontSize: '1rem',
                          }}
                          title="Drag to reorder"
                          >
                            ⋮⋮
                          </div>
                          {/* AC5: Time, name, category icon */}
                          <div style={{ flex: 1 }}>
                            {activity.startTime && (
                              <p style={{ margin: 0, fontSize: '0.75rem', color: '#3b82f6', fontWeight: '600' }}>
                                {new Date(activity.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                {activity.endTime && ` - ${new Date(activity.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                              </p>
                            )}
                            <h4 style={{ margin: '0.25rem 0 0', fontSize: '0.95rem', color: '#1e3a5f' }}>
                              {activity.title}
                            </h4>
                          </div>
                          {/* AC5: Category icon */}
                          {activity.category && (
                            <span style={{ 
                              padding: '0.25rem 0.5rem', 
                              borderRadius: '6px', 
                              background: '#eff6ff', 
                              color: '#3b82f6',
                              fontSize: '0.7rem',
                              fontWeight: '600',
                            }}>
                              {activity.category === 'flight' ? '✈️' : 
                               activity.category === 'hotel' ? '🏨' : 
                               activity.category === 'restaurant' ? '🍽️' : 
                               activity.category === 'activity' ? '🎯' : '📍'}
                            </span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Map */}
        <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', minHeight: '250px' }}>
          <TripMap className="leaflet-container" markers={[]} />
        </div>

        {/* Share Modal */}
        <ShareModal
          tripId={tripId}
          tripName={trip?.name || ''}
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
        />
      </div>

      {/* Mobile Floating Action Button */}
      <button
        className="mobile-fab hide-on-desktop"
        onClick={() => setShowAddModal(true)}
        aria-label="Add Activity"
        style={{
          border: 'none',
          cursor: 'pointer',
        }}
      >
        <span style={{ fontSize: '1.5rem', fontWeight: '300' }}>+</span>
      </button>

      {/* Add Activity Modal - full screen on mobile */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: '#000000',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          zIndex: 100,
        }} onClick={() => setShowAddModal(false)}>
          <div 
            className="mobile-full-screen"
            style={{
              background: 'white',
              borderRadius: '16px 16px 0 0',
              padding: '1.5rem',
              width: '100%',
              maxWidth: '400px',
              maxHeight: '90vh',
              overflowY: 'auto',
            }} 
            onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 1rem', color: '#1e3a5f', fontSize: '1.25rem' }}>Add Activity</h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.875rem' }}>
                Activity Name
              </label>
              <input
                type="text"
                value={newActivityName}
                onChange={e => setNewActivityName(e.target.value)}
                placeholder="e.g., Visit Golden Gate"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '2px solid #e2e8f0',
                  fontSize: '1rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
                autoFocus
              />
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.875rem' }}>
                Category
              </label>
              <select
                value={newActivityCategory}
                onChange={e => setNewActivityCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '2px solid #e2e8f0',
                  fontSize: '1rem',
                  outline: 'none',
                  background: 'white',
                  boxSizing: 'border-box',
                }}
              >
                <option value="activity">Activity</option>
                <option value="restaurant">Restaurant</option>
                <option value="attraction">Attraction</option>
                <option value="transport">Transport</option>
                <option value="hotel">Hotel</option>
                <option value="shopping">Shopping</option>
                <option value="entertainment">Entertainment</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Time inputs */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.875rem' }}>
                Start Time (optional)
              </label>
              <input
                type="datetime-local"
                value={newActivityStartTime}
                onChange={e => setNewActivityStartTime(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '2px solid #e2e8f0',
                  fontSize: '1rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.875rem' }}>
                End Time (optional)
              </label>
              <input
                type="datetime-local"
                value={newActivityEndTime}
                onChange={e => setNewActivityEndTime(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '2px solid #e2e8f0',
                  fontSize: '1rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Multi-day activity dates */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.875rem' }}>
                Start Date (for multi-day activities)
              </label>
              <input
                type="date"
                value={newActivityStartDate}
                onChange={e => setNewActivityStartDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '2px solid #e2e8f0',
                  fontSize: '1rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.875rem' }}>
                End Date (for multi-day activities)
              </label>
              <input
                type="date"
                value={newActivityEndDate}
                onChange={e => setNewActivityEndDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '2px solid #e2e8f0',
                  fontSize: '1rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            
            {/* Cost input */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.875rem' }}>
                Cost (optional)
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <span style={{ 
                  padding: '0.75rem', 
                  background: '#f1f5f9', 
                  borderRadius: '8px 0 0 8px',
                  border: '2px solid #e2e8f0',
                  borderRight: 'none',
                  color: '#64748b',
                }}>
                  $
                </span>
                <input
                  type="number"
                  value={newActivityCost}
                  onChange={e => setNewActivityCost(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    borderRadius: '0 8px 8px 0',
                    border: '2px solid #e2e8f0',
                    fontSize: '1rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setShowAddModal(false)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '2px solid #e2e8f0',
                  background: 'white',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleAddActivity}
                disabled={!newActivityName.trim()}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: newActivityName.trim() 
                    ? 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)' 
                    : '#94a3b8',
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: newActivityName.trim() ? 'pointer' : 'not-allowed',
                }}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AC4: Floating Action Buttons */}
      <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', zIndex: 100 }}>
        <button onClick={() => setShowAddModal(true)} style={{
          width: '56px', height: '56px', borderRadius: '16px', border: 'none',
          background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
          color: 'white', fontSize: '1.5rem', cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(59, 130, 246, 0.4)',
        }}>+</button>
        <button onClick={() => trip && exportTripToPDF(trip)} style={{
          width: '48px', height: '48px', borderRadius: '14px', border: 'none',
          background: '#10b981', color: 'white', fontSize: '1.25rem', cursor: 'pointer',
        }}>📄</button>
        <button onClick={() => setShowShareModal(true)} style={{
          width: '48px', height: '48px', borderRadius: '14px', border: 'none',
          background: '#8b5cf6', color: 'white', fontSize: '1.25rem', cursor: 'pointer',
        }}>🔗</button>
      </div>

    </div>
  );
}
