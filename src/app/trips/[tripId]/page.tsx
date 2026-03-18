'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTrip, useTripActions } from '@/lib/store';
import { FlightForm } from '@/components/FlightForm';
import { HotelForm } from '@/components/HotelForm';
import { Plane, Building2, Plus, Calendar, MapPin, Clock, Trash2, Edit } from 'lucide-react';

export default function TripDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params.tripId as string;
  
  const { trips, currentTripId } = useTrip();
  const { setCurrentTrip, deleteFlight, deleteHotel } = useTripActions();
  
  const [showFlightForm, setShowFlightForm] = useState(false);
  const [showHotelForm, setShowHotelForm] = useState(false);
  const [editingFlight, setEditingFlight] = useState<string | null>(null);
  const [editingHotel, setEditingHotel] = useState<string | null>(null);
  
  // Set current trip on mount
  useEffect(() => {
    setCurrentTrip(tripId);
    return () => setCurrentTrip(null);
  }, [tripId, setCurrentTrip]);
  
  const trip = trips.find(t => t.id === tripId);
  
  if (!trip) {
    return (
      <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', color: 'white' }}>
        <button
          onClick={() => router.push('/trips')}
          style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', marginBottom: '1rem' }}
        >
          ← Back to Trips
        </button>
        <p>Trip not found</p>
      </div>
    );
  }
  
  // Sort flights by departure time
  const sortedFlights = [...trip.flights].sort((a, b) => 
    new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime()
  );
  
  // Sort hotels by check-in date
  const sortedHotels = [...trip.hotels].sort((a, b) => 
    new Date(a.checkInDate).getTime() - new Date(b.checkInDate).getTime()
  );
  
  // Format date
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  
  // Format time
  const formatTime = (timeStr: string) => {
    if (!timeStr) return '';
    const date = new Date(timeStr);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };
  
  // Calculate nights for hotel
  const getNights = (checkIn: string, checkOut: string) => {
    if (!checkIn || !checkOut) return 0;
    return Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      {/* Header */}
      <button
        onClick={() => router.push('/trips')}
        style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', marginBottom: '1rem' }}
      >
        ← Back to Trips
      </button>
      
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', color: 'white', marginBottom: '0.5rem' }}>{trip.name}</h1>
        <p style={{ color: 'white', fontSize: '1.1rem', opacity: 0.8 }}>
          {formatDate(trip.startDate)} → {formatDate(trip.endDate)}
        </p>
      </div>
      
      {/* Flights Section */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.5rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plane className="w-5 h-5" style={{ color: '#2563eb' }} />
            Flights
          </h2>
          <button
            onClick={() => setShowFlightForm(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.5rem 1rem',
              background: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer',
            }}
          >
            <Plus className="w-4 h-4" />
            Add Flight
          </button>
        </div>
        
        {sortedFlights.length === 0 ? (
          <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', textAlign: 'center' }}>
            <p style={{ color: '#666' }}>No flights added yet</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {sortedFlights.map((flight) => (
              <div
                key={flight.id}
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '1rem 1.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ 
                    width: '40px', 
                    height: '40px', 
                    borderRadius: '8px', 
                    background: '#eff6ff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#2563eb'
                  }}>
                    <Plane className="w-5 h-5" />
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', color: '#111827' }}>
                      {flight.airline} {flight.flightNumber}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      {flight.departureAirport} → {flight.arrivalAirport}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                      <Clock className="w-3 h-3" />
                      {formatTime(flight.departureTime)}
                      {flight.confirmationNumber && (
                        <span style={{ marginLeft: '0.5rem' }}>• {flight.confirmationNumber}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => setEditingFlight(flight.id)}
                    style={{
                      padding: '0.375rem',
                      background: 'transparent',
                      border: 'none',
                      color: '#6b7280',
                      cursor: 'pointer',
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteFlight(tripId, flight.id)}
                    style={{
                      padding: '0.375rem',
                      background: 'transparent',
                      border: 'none',
                      color: '#dc2626',
                      cursor: 'pointer',
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Hotels Section */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.5rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building2 className="w-5 h-5" style={{ color: '#7c3aed' }} />
            Hotels
          </h2>
          <button
            onClick={() => setShowHotelForm(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.5rem 1rem',
              background: '#7c3aed',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer',
            }}
          >
            <Plus className="w-4 h-4" />
            Add Hotel
          </button>
        </div>
        
        {sortedHotels.length === 0 ? (
          <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', textAlign: 'center' }}>
            <p style={{ color: '#666' }}>No hotels added yet</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {sortedHotels.map((hotel) => {
              const nights = getNights(hotel.checkInDate, hotel.checkOutDate);
              return (
                <div
                  key={hotel.id}
                  style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '1rem 1.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ 
                      width: '40px', 
                      height: '40px', 
                      borderRadius: '8px', 
                      background: '#f3e8ff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#7c3aed'
                    }}>
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div style={{ fontWeight: '600', color: '#111827' }}>
                        {hotel.name}
                        {hotel.roomType && <span style={{ fontWeight: '400', color: '#6b7280' }}> • {hotel.roomType}</span>}
                      </div>
                      {hotel.address && (
                        <div style={{ fontSize: '0.875rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <MapPin className="w-3 h-3" />
                          {hotel.address}
                        </div>
                      )}
                      <div style={{ fontSize: '0.75rem', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                        <Calendar className="w-3 h-3" />
                        {formatDate(hotel.checkInDate)} → {formatDate(hotel.checkOutDate)}
                        {nights > 0 && <span>({nights} night{nights > 1 ? 's' : ''})</span>}
                        {hotel.confirmationNumber && (
                          <span>• {hotel.confirmationNumber}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => setEditingHotel(hotel.id)}
                      style={{
                        padding: '0.375rem',
                        background: 'transparent',
                        border: 'none',
                        color: '#6b7280',
                        cursor: 'pointer',
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteHotel(tripId, hotel.id)}
                      style={{
                        padding: '0.375rem',
                        background: 'transparent',
                        border: 'none',
                        color: '#dc2626',
                        cursor: 'pointer',
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Flight Form Modal */}
      {(showFlightForm || editingFlight) && (
        <FlightForm
          tripId={tripId}
          flight={editingFlight ? trip.flights.find(f => f.id === editingFlight) : undefined}
          onClose={() => {
            setShowFlightForm(false);
            setEditingFlight(null);
          }}
        />
      )}
      
      {/* Hotel Form Modal */}
      {(showHotelForm || editingHotel) && (
        <HotelForm
          tripId={tripId}
          hotel={editingHotel ? trip.hotels.find(h => h.id === editingHotel) : undefined}
          onClose={() => {
            setShowHotelForm(false);
            setEditingHotel(null);
          }}
        />
      )}
    </div>
  );
}
