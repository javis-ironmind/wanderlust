'use client';

import { useState } from 'react';
import { Flight } from '@/lib/types';
import { useTripStore } from '@/lib/store';
import { X, Plane, Save, Trash2 } from 'lucide-react';

// Common airlines for autocomplete
const AIRLINES = [
  { code: 'AA', name: 'American Airlines' },
  { code: 'UA', name: 'United Airlines' },
  { code: 'DL', name: 'Delta Air Lines' },
  { code: 'WN', name: 'Southwest Airlines' },
  { code: 'B6', name: 'JetBlue Airways' },
  { code: 'AS', name: 'Alaska Airlines' },
  { code: 'NK', name: 'Spirit Airlines' },
  { code: 'F9', name: 'Frontier Airlines' },
  { code: 'BA', name: 'British Airways' },
  { code: 'LH', name: 'Lufthansa' },
  { code: 'AF', name: 'Air France' },
  { code: 'KL', name: 'KLM Royal Dutch' },
  { code: 'EK', name: 'Emirates' },
  { code: 'QR', name: 'Qatar Airways' },
  { code: 'SQ', name: 'Singapore Airlines' },
  { code: 'CX', name: 'Cathay Pacific' },
  { code: 'JL', name: 'Japan Airlines' },
  { code: 'NH', name: 'All Nippon Airways' },
  { code: 'AC', name: 'Air Canada' },
  { code: 'QF', name: 'Qantas' },
];

// Major airports with IATA codes
const AIRPORTS = [
  { code: 'JFK', name: 'John F. Kennedy International', city: 'New York' },
  { code: 'LAX', name: 'Los Angeles International', city: 'Los Angeles' },
  { code: 'ORD', name: "O'Hare International", city: 'Chicago' },
  { code: 'DFW', name: 'Dallas/Fort Worth International', city: 'Dallas' },
  { code: 'DEN', name: 'Denver International', city: 'Denver' },
  { code: 'SFO', name: 'San Francisco International', city: 'San Francisco' },
  { code: 'SEA', name: 'Seattle-Tacoma International', city: 'Seattle' },
  { code: 'LAS', name: 'Harry Reid International', city: 'Las Vegas' },
  { code: 'MCO', name: 'Orlando International', city: 'Orlando' },
  { code: 'MIA', name: 'Miami International', city: 'Miami' },
  { code: 'ATL', name: 'Hartsfield-Jackson Atlanta', city: 'Atlanta' },
  { code: 'BOS', name: 'Logan International', city: 'Boston' },
  { code: 'PHX', name: 'Phoenix Sky Harbor', city: 'Phoenix' },
  { code: 'IAH', name: 'George Bush Intercontinental', city: 'Houston' },
  { code: 'MSP', name: 'Minneapolis-St Paul', city: 'Minneapolis' },
  { code: 'DTW', name: 'Detroit Metropolitan', city: 'Detroit' },
  { code: 'PHL', name: 'Philadelphia International', city: 'Philadelphia' },
  { code: 'LGA', name: 'LaGuardia', city: 'New York' },
  { code: 'FLL', name: 'Fort Lauderdale-Hollywood', city: 'Fort Lauderdale' },
  { code: 'BWI', name: 'Baltimore/Washington International', city: 'Baltimore' },
  { code: 'DCA', name: 'Ronald Reagan Washington National', city: 'Washington DC' },
  { code: 'SLC', name: 'Salt Lake City International', city: 'Salt Lake City' },
  { code: 'SAN', name: 'San Diego International', city: 'San Diego' },
  { code: 'TPA', name: 'Tampa International', city: 'Tampa' },
  { code: 'PDX', name: 'Portland International', city: 'Portland' },
  { code: 'HNL', name: 'Daniel K. Inouye International', city: 'Honolulu' },
  { code: 'LHR', name: 'London Heathrow', city: 'London' },
  { code: 'CDG', name: 'Paris Charles de Gaulle', city: 'Paris' },
  { code: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt' },
  { code: 'AMS', name: 'Amsterdam Schiphol', city: 'Amsterdam' },
  { code: 'NRT', name: 'Narita International', city: 'Tokyo' },
  { code: 'HND', name: 'Tokyo Haneda', city: 'Tokyo' },
  { code: 'ICN', name: 'Incheon International', city: 'Seoul' },
  { code: 'SIN', name: 'Singapore Changi', city: 'Singapore' },
  { code: 'HKG', name: 'Hong Kong International', city: 'Hong Kong' },
  { code: 'DXB', name: 'Dubai International', city: 'Dubai' },
  { code: 'SYD', name: 'Sydney Kingsford Smith', city: 'Sydney' },
  { code: 'MEX', name: 'Benito Juarez International', city: 'Mexico City' },
  { code: 'YYZ', name: 'Toronto Pearson International', city: 'Toronto' },
  { code: 'YVR', name: 'Vancouver International', city: 'Vancouver' },
];

interface FlightFormProps {
  tripId: string;
  flight?: Flight;
  onClose: () => void;
  onSave?: () => void;
}

export function FlightForm({ tripId, flight, onClose, onSave }: FlightFormProps) {
  const { addFlight, updateFlight, deleteFlight } = useTripStore();
  
  // Form state
  const [airline, setAirline] = useState(flight?.airline || '');
  const [flightNumber, setFlightNumber] = useState(flight?.flightNumber || '');
  const [departureAirport, setDepartureAirport] = useState(flight?.departureAirport || '');
  const [departureCity, setDepartureCity] = useState(flight?.departureCity || '');
  const [departureTime, setDepartureTime] = useState(
    flight?.departureTime ? flight.departureTime.slice(0, 16) : ''
  );
  const [arrivalAirport, setArrivalAirport] = useState(flight?.arrivalAirport || '');
  const [arrivalCity, setArrivalCity] = useState(flight?.arrivalCity || '');
  const [arrivalTime, setArrivalTime] = useState(
    flight?.arrivalTime ? flight.arrivalTime.slice(0, 16) : ''
  );
  const [terminal, setTerminal] = useState(flight?.terminal || '');
  const [gate, setGate] = useState(flight?.gate || '');
  const [confirmationNumber, setConfirmationNumber] = useState(flight?.confirmationNumber || '');
  const [seat, setSeat] = useState(flight?.seat || '');
  const [notes, setNotes] = useState(flight?.notes || '');
  const [cost, setCost] = useState(flight?.cost?.toString() || '');
  const [currency, setCurrency] = useState(flight?.currency || 'USD');
  
  // UI state
  const [showAirlineDropdown, setShowAirlineDropdown] = useState(false);
  const [showDepartureDropdown, setShowDepartureDropdown] = useState(false);
  const [showArrivalDropdown, setShowArrivalDropdown] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Filtered options
  const filteredAirlines = AIRLINES.filter(
    (a) =>
      a.name.toLowerCase().includes(airline.toLowerCase()) ||
      a.code.toLowerCase().includes(airline.toLowerCase())
  );
  
  const filteredDepartureAirports = AIRPORTS.filter(
    (a) =>
      a.code.toLowerCase().includes(departureAirport.toLowerCase()) ||
      a.city.toLowerCase().includes(departureAirport.toLowerCase()) ||
      a.name.toLowerCase().includes(departureAirport.toLowerCase())
  );
  
  const filteredArrivalAirports = AIRPORTS.filter(
    (a) =>
      a.code.toLowerCase().includes(arrivalAirport.toLowerCase()) ||
      a.city.toLowerCase().includes(arrivalAirport.toLowerCase()) ||
      a.name.toLowerCase().includes(arrivalAirport.toLowerCase())
  );
  
  const selectAirline = (airlineObj: typeof AIRLINES[0]) => {
    setAirline(airlineObj.name);
    setShowAirlineDropdown(false);
  };
  
  const selectDepartureAirport = (airportObj: typeof AIRPORTS[0]) => {
    setDepartureAirport(airportObj.code);
    setDepartureCity(airportObj.city);
    setShowDepartureDropdown(false);
  };
  
  const selectArrivalAirport = (airportObj: typeof AIRPORTS[0]) => {
    setArrivalAirport(airportObj.code);
    setArrivalCity(airportObj.city);
    setShowArrivalDropdown(false);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!airline.trim() || !flightNumber.trim() || !departureAirport.trim() || !arrivalAirport.trim()) {
      alert('Please fill in all required fields');
      return;
    }
    
    const flightData: Flight = {
      id: flight?.id || `flight-${Date.now()}`,
      airline,
      flightNumber: flightNumber.toUpperCase(),
      departureAirport: departureAirport.toUpperCase(),
      departureCity,
      departureTime: departureTime ? new Date(departureTime).toISOString() : '',
      arrivalAirport: arrivalAirport.toUpperCase(),
      arrivalCity,
      arrivalTime: arrivalTime ? new Date(arrivalTime).toISOString() : '',
      terminal,
      gate,
      confirmationNumber,
      seat,
      notes,
      cost: cost ? parseFloat(cost) : undefined,
      currency,
    };
    
    if (flight) {
      updateFlight(tripId, flight.id, flightData);
    } else {
      addFlight(tripId, flightData);
    }
    
    onSave?.();
    onClose();
  };
  
  const handleDelete = () => {
    if (flight) {
      deleteFlight(tripId, flight.id);
      onClose();
    }
  };
  
  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.625rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    outline: 'none',
    transition: 'border-color 0.2s',
  };
  
  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.75rem',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '0.375rem',
  };
  
  const dropdownStyle: React.CSSProperties = {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    background: 'white',
    border: '1px solid #d1d5db',
    borderRadius: '0.5rem',
    maxHeight: '200px',
    overflow: 'auto',
    zIndex: 50,
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  };
  
  const dropdownItemStyle: React.CSSProperties = {
    padding: '0.5rem 0.75rem',
    fontSize: '0.875rem',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };
  
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '1rem',
          width: '100%',
          maxWidth: '600px',
          maxHeight: '90vh',
          overflow: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem 1.5rem',
            borderBottom: '1px solid #e5e7eb',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plane className="w-5 h-5" style={{ color: '#2563eb' }} />
            <h2 style={{ fontSize: '1.125rem', fontWeight: '600' }}>
              {flight ? 'Edit Flight' : 'Add Flight'}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '0.25rem',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#6b7280',
            }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          {/* Required Fields Section */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '1rem', color: '#111827' }}>
              Flight Details *
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              {/* Airline */}
              <div style={{ position: 'relative' }}>
                <label style={labelStyle}>Airline *</label>
                <input
                  type="text"
                  value={airline}
                  onChange={(e) => {
                    setAirline(e.target.value);
                    setShowAirlineDropdown(true);
                  }}
                  onFocus={() => setShowAirlineDropdown(true)}
                  onBlur={() => setTimeout(() => setShowAirlineDropdown(false), 200)}
                  placeholder="e.g., American Airlines"
                  style={inputStyle}
                />
                {showAirlineDropdown && filteredAirlines.length > 0 && (
                  <div style={dropdownStyle}>
                    {filteredAirlines.slice(0, 8).map((airlineObj) => (
                      <div
                        key={airlineObj.code}
                        style={dropdownItemStyle}
                        onMouseDown={() => selectAirline(airlineObj)}
                      >
                        <span>{airlineObj.name}</span>
                        <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>{airlineObj.code}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Flight Number */}
              <div>
                <label style={labelStyle}>Flight Number *</label>
                <input
                  type="text"
                  value={flightNumber}
                  onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
                  placeholder="e.g., AA123"
                  style={inputStyle}
                />
              </div>
            </div>
            
            {/* Departure */}
            <div style={{ marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.75rem', color: '#111827' }}>
                Departure *
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: '0.75rem' }}>
                <div style={{ position: 'relative' }}>
                  <label style={labelStyle}>Airport *</label>
                  <input
                    type="text"
                    value={departureAirport}
                    onChange={(e) => {
                      setDepartureAirport(e.target.value);
                      setShowDepartureDropdown(true);
                    }}
                    onFocus={() => setShowDepartureDropdown(true)}
                    onBlur={() => setTimeout(() => setShowDepartureDropdown(false), 200)}
                    placeholder="JFK"
                    style={inputStyle}
                  />
                  {showDepartureDropdown && filteredDepartureAirports.length > 0 && (
                    <div style={dropdownStyle}>
                      {filteredDepartureAirports.slice(0, 6).map((airportObj) => (
                        <div
                          key={airportObj.code}
                          style={dropdownItemStyle}
                          onMouseDown={() => selectDepartureAirport(airportObj)}
                        >
                          <span>{airportObj.code}</span>
                          <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>{airportObj.city}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div>
                  <label style={labelStyle}>City</label>
                  <input
                    type="text"
                    value={departureCity}
                    onChange={(e) => setDepartureCity(e.target.value)}
                    placeholder="New York"
                    style={inputStyle}
                  />
                </div>
                
                <div>
                  <label style={labelStyle}>Date/Time</label>
                  <input
                    type="datetime-local"
                    value={departureTime}
                    onChange={(e) => setDepartureTime(e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>
            
            {/* Arrival */}
            <div style={{ marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.75rem', color: '#111827' }}>
                Arrival *
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: '0.75rem' }}>
                <div style={{ position: 'relative' }}>
                  <label style={labelStyle}>Airport *</label>
                  <input
                    type="text"
                    value={arrivalAirport}
                    onChange={(e) => {
                      setArrivalAirport(e.target.value);
                      setShowArrivalDropdown(true);
                    }}
                    onFocus={() => setShowArrivalDropdown(true)}
                    onBlur={() => setTimeout(() => setShowArrivalDropdown(false), 200)}
                    placeholder="LAX"
                    style={inputStyle}
                  />
                  {showArrivalDropdown && filteredArrivalAirports.length > 0 && (
                    <div style={dropdownStyle}>
                      {filteredArrivalAirports.slice(0, 6).map((airportObj) => (
                        <div
                          key={airportObj.code}
                          style={dropdownItemStyle}
                          onMouseDown={() => selectArrivalAirport(airportObj)}
                        >
                          <span>{airportObj.code}</span>
                          <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>{airportObj.city}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div>
                  <label style={labelStyle}>City</label>
                  <input
                    type="text"
                    value={arrivalCity}
                    onChange={(e) => setArrivalCity(e.target.value)}
                    placeholder="Los Angeles"
                    style={inputStyle}
                  />
                </div>
                
                <div>
                  <label style={labelStyle}>Date/Time</label>
                  <input
                    type="datetime-local"
                    value={arrivalTime}
                    onChange={(e) => setArrivalTime(e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Optional Fields */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '1rem', color: '#111827' }}>
              Additional Details
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={labelStyle}>Terminal</label>
                <input
                  type="text"
                  value={terminal}
                  onChange={(e) => setTerminal(e.target.value)}
                  placeholder="A"
                  style={inputStyle}
                />
              </div>
              
              <div>
                <label style={labelStyle}>Gate</label>
                <input
                  type="text"
                  value={gate}
                  onChange={(e) => setGate(e.target.value)}
                  placeholder="B12"
                  style={inputStyle}
                />
              </div>
              
              <div>
                <label style={labelStyle}>Seat</label>
                <input
                  type="text"
                  value={seat}
                  onChange={(e) => setSeat(e.target.value)}
                  placeholder="12A"
                  style={inputStyle}
                />
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={labelStyle}>Confirmation Number</label>
                <input
                  type="text"
                  value={confirmationNumber}
                  onChange={(e) => setConfirmationNumber(e.target.value)}
                  placeholder="ABC123"
                  style={inputStyle}
                />
              </div>
              
              <div>
                <label style={labelStyle}>Cost</label>
                <input
                  type="number"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  style={inputStyle}
                />
              </div>
              
              <div>
                <label style={labelStyle}>Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="CAD">CAD</option>
                  <option value="AUD">AUD</option>
                  <option value="JPY">JPY</option>
                </select>
              </div>
            </div>
            
            <div>
              <label style={labelStyle}>Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional notes..."
                rows={2}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>
          </div>
          
          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
            <div>
              {flight && (
                showDeleteConfirm ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.875rem', color: '#dc2626' }}>Delete this flight?</span>
                    <button
                      type="button"
                      onClick={handleDelete}
                      style={{
                        padding: '0.375rem 0.75rem',
                        background: '#dc2626',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                      }}
                    >
                      Yes, Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      style={{
                        padding: '0.375rem 0.75rem',
                        background: '#f3f4f6',
                        border: 'none',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                      padding: '0.5rem',
                      background: 'transparent',
                      border: 'none',
                      color: '#dc2626',
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                )
              )}
            </div>
            
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '0.625rem 1.25rem',
                  background: '#f3f4f6',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  padding: '0.625rem 1.25rem',
                  background: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                }}
              >
                <Save className="w-4 h-4" />
                {flight ? 'Update Flight' : 'Add Flight'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
