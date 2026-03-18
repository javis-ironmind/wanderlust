'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { TripMap } from '@/components/map/TripMap';
import { exportTripToPDF } from '@/lib/exportPDF';
import { ShareModal } from '@/components/ShareModal';
import { WeatherWidget } from '@/components/WeatherWidget';
import { BudgetWidget } from '@/components/BudgetWidget';
import PackingList from '@/components/PackingList';
import CalendarExport from '@/components/CalendarExport';

type Activity = {
  id: string;
  title: string;
  category?: string;
  startTime?: string;  // ISO datetime
  endTime?: string;    // ISO datetime
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
  const [newActivityCost, setNewActivityCost] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);

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

        {/* Itinerary */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1e3a5f', margin: 0 }}>
              {currentDay?.date || 'No days'}
            </h2>
            <button
              onClick={() => setShowAddModal(true)}
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: 'none',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              + Add Activity
            </button>
          </div>
          
          {(!currentDay || !currentDay.activities || currentDay.activities.length === 0) ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
              <p>No activities planned yet</p>
              <p style={{ fontSize: '0.875rem' }}>Click "+ Add Activity" to start building!</p>
            </div>
          ) : (
            <div>
              {currentDay.activities.map((activity) => (
                <div key={activity.id} style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1rem', color: '#1e3a5f' }}>{activity.title}</h3>
                    {activity.startTime && (
                      <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: '#64748b' }}>
                        {new Date(activity.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {activity.endTime && ` - ${new Date(activity.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                      </p>
                    )}
                    {activity.category && (
                      <span style={{ 
                        display: 'inline-block',
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '6px', 
                        background: '#eff6ff', 
                        color: '#3b82f6',
                        fontSize: '0.75rem',
                        marginTop: '0.25rem',
                      }}>
                        {activity.category}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
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

      {/* Add Activity Modal - NO MAP */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: '#000000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '1rem',
        }} onClick={() => setShowAddModal(false)}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '1.5rem',
            width: '100%',
            maxWidth: '400px',
          }} onClick={e => e.stopPropagation()}>
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
    </div>
  );
}
