'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTripStore } from '@/lib/store';
import { Activity } from '@/lib/types';
import { SortableActivityList } from '@/components/SortableActivityList';
import { FlightForm } from '@/components/FlightForm';
import { Plus, Calendar, MapPin, ChevronLeft, Plane } from 'lucide-react';

export default function TripDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params.tripId as string;
  
  const { trips, moveActivityToDay, reorderActivities, deleteActivity, addActivity } = useTripStore();
  const trip = trips.find((t) => t.id === tripId);
  
  const [isAddingActivity, setIsAddingActivity] = useState<string | null>(null);
  const [newActivityTitle, setNewActivityTitle] = useState('');
  const [showFlightForm, setShowFlightForm] = useState(false);
  const [editingFlightId, setEditingFlightId] = useState<string | null>(null);
  
  if (!trip) {
    return (
      <div style={{ padding: '2rem', fontFamily: 'system-ui', maxWidth: '800px', margin: '0 auto' }}>
        <button onClick={() => router.back()} style={{ marginBottom: '1rem' }}>← Back</button>
        <h1>Trip not found</h1>
        <p>The trip with ID {tripId} was not found.</p>
      </div>
    );
  }
  
  // Find editing flight
  const editingFlight = editingFlightId 
    ? trip.flights.find(f => f.id === editingFlightId) 
    : undefined;
  
  const handleMoveActivity = (tid: string, sourceDayId: string, destDayId: string, activityId: string) => {
    moveActivityToDay(tid, sourceDayId, destDayId, activityId);
  };
  
  const handleReorder = (tid: string, dayId: string, activityIds: string[]) => {
    reorderActivities(tid, dayId, activityIds);
  };
  
  const handleDeleteActivity = (dayId: string, activityId: string) => {
    deleteActivity(tripId, dayId, activityId);
  };
  
  const handleAddActivity = (dayId: string) => {
    if (!newActivityTitle.trim()) return;
    
    const newActivity: Activity = {
      id: `activity-${Date.now()}`,
      title: newActivityTitle,
      category: 'activity',
      order: trip.days.find(d => d.id === dayId)?.activities.length || 0,
    };
    
    addActivity(tripId, dayId, newActivity);
    setNewActivityTitle('');
    setIsAddingActivity(null);
  };
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };
  
  const getDayNumber = (index: number) => {
    const startDate = new Date(trip.startDate);
    const dayDate = new Date(startDate);
    dayDate.setDate(startDate.getDate() + index);
    return dayDate;
  };
  
  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <button 
          onClick={() => router.back()} 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            marginBottom: '1rem',
            padding: '0.5rem 1rem',
            border: 'none',
            background: '#f3f4f6',
            borderRadius: '0.5rem',
            cursor: 'pointer'
          }}
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        
        <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          {trip.name}
        </h1>
        
        <div style={{ display: 'flex', gap: '1rem', color: '#6b7280', fontSize: '0.875rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Calendar className="w-4 h-4" />
            {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <MapPin className="w-4 h-4" />
            {trip.days.length} days
          </span>
          <button
            onClick={() => {
              setEditingFlightId(null);
              setShowFlightForm(true);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.25rem 0.5rem',
              background: trip.flights.length > 0 ? '#eff6ff' : 'transparent',
              border: trip.flights.length > 0 ? '1px solid #bfdbfe' : '1px solid #d1d5db',
              borderRadius: '0.375rem',
              color: '#2563eb',
              fontSize: '0.875rem',
              cursor: 'pointer',
            }}
          >
            <Plane className="w-4 h-4" />
            {trip.flights.length} flights
          </button>
          <button
            onClick={() => {
              setEditingFlightId(null);
              setShowFlightForm(true);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.25rem 0.5rem',
              background: 'transparent',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              color: '#6b7280',
              fontSize: '0.875rem',
              cursor: 'pointer',
            }}
          >
            <Plus className="w-4 h-4" />
            Add Flight
          </button>
        </div>
      </div>
      
      {/* Flights Section - Chronological */}
      {trip.flights.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plane className="w-5 h-5" />
            Flights
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {trip.flights
              .slice()
              .sort((a, b) => {
                if (!a.departureTime) return 1;
                if (!b.departureTime) return -1;
                return new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime();
              })
              .map((flight) => (
                <div
                  key={flight.id}
                  onClick={() => {
                    setEditingFlightId(flight.id);
                    setShowFlightForm(true);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1rem',
                    background: 'white',
                    borderRadius: '0.75rem',
                    border: '1px solid #e5e7eb',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    padding: '0.5rem',
                    background: '#eff6ff',
                    borderRadius: '0.5rem',
                  }}>
                    <Plane className="w-5 h-5" style={{ color: '#2563eb' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', fontSize: '0.9375rem' }}>
                      {flight.airline} {flight.flightNumber}
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: '#6b7280' }}>
                      {flight.departureAirport} → {flight.arrivalAirport}
                      {flight.departureTime && (
                        <> · {new Date(flight.departureTime).toLocaleDateString('en-US', { 
                          month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' 
                        })}</>
                      )}
                    </div>
                  </div>
                  {flight.confirmationNumber && (
                    <div style={{ 
                      fontSize: '0.75rem', 
                      padding: '0.25rem 0.5rem', 
                      background: '#f3f4f6', 
                      borderRadius: '0.375rem',
                      color: '#6b7280',
                    }}>
                      {flight.confirmationNumber}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}
      
      {/* Days Grid */}
      {trip.days.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '4rem', 
          background: '#f9fafb', 
          borderRadius: '1rem',
          color: '#6b7280'
        }}>
          <p>No days added yet.</p>
          <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
            Add days to start planning your trip.
          </p>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '1.5rem'
        }}>
          {trip.days.map((day, index) => {
            const dayDate = getDayNumber(index);
            
            return (
              <div 
                key={day.id}
                style={{
                  background: 'white',
                  borderRadius: '1rem',
                  padding: '1rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  border: '1px solid #e5e7eb'
                }}
              >
                {/* Day Header */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem',
                  paddingBottom: '0.75rem',
                  borderBottom: '1px solid #e5e7eb'
                }}>
                  <div>
                    <h3 style={{ fontWeight: '600', fontSize: '1rem' }}>
                      Day {index + 1}
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      {dayDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  <span style={{ 
                    fontSize: '0.75rem', 
                    background: '#f3f4f6',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '0.5rem',
                    color: '#6b7280'
                  }}>
                    {day.activities.length} activities
                  </span>
                </div>
                
                {/* Activities List with Drag & Drop */}
                <SortableActivityList
                  tripId={tripId}
                  day={day}
                  days={trip.days}
                  onMoveActivity={handleMoveActivity}
                  onReorder={handleReorder}
                  onDeleteActivity={(activityId) => handleDeleteActivity(day.id, activityId)}
                />
                
                {/* Add Activity */}
                {isAddingActivity === day.id ? (
                  <div style={{ marginTop: '1rem' }}>
                    <input
                      type="text"
                      value={newActivityTitle}
                      onChange={(e) => setNewActivityTitle(e.target.value)}
                      placeholder="Activity name"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddActivity(day.id);
                        if (e.key === 'Escape') setIsAddingActivity(null);
                      }}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        marginBottom: '0.5rem'
                      }}
                    />
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleAddActivity(day.id)}
                        style={{
                          flex: 1,
                          padding: '0.5rem',
                          background: '#2563eb',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.5rem',
                          fontSize: '0.875rem',
                          cursor: 'pointer'
                        }}
                      >
                        Add
                      </button>
                      <button
                        onClick={() => setIsAddingActivity(null)}
                        style={{
                          padding: '0.5rem 1rem',
                          background: '#f3f4f6',
                          border: 'none',
                          borderRadius: '0.5rem',
                          fontSize: '0.875rem',
                          cursor: 'pointer'
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsAddingActivity(day.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      width: '100%',
                      marginTop: '1rem',
                      padding: '0.75rem',
                      background: '#f9fafb',
                      border: '1px dashed #d1d5db',
                      borderRadius: '0.5rem',
                      color: '#6b7280',
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <Plus className="w-4 h-4" />
                    Add Activity
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
      
      {/* Flight Form Modal */}
      {showFlightForm && (
        <FlightForm
          tripId={tripId}
          flight={editingFlight}
          onClose={() => {
            setShowFlightForm(false);
            setEditingFlightId(null);
          }}
        />
      )}
    </div>
  );
}
