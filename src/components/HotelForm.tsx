'use client';

import { useState } from 'react';
import { Hotel } from '@/lib/types';
import { useTripStore } from '@/lib/store';
import { X, Building2, Save, Trash2, Calendar, MapPin, Phone, Globe } from 'lucide-react';
import LocationSearch from '@/components/LocationSearch';

// Common hotel chains for autocomplete
const HOTEL_CHAINS = [
  { name: 'Marriott', website: 'marriott.com' },
  { name: 'Hilton', website: 'hilton.com' },
  { name: 'Hyatt', website: 'hyatt.com' },
  { name: 'InterContinental', website: 'ihg.com' },
  { name: 'Accor', website: 'accor.com' },
  { name: 'Wyndham', website: 'wyndhamhotels.com' },
  { name: 'Choice Hotels', website: 'choicehotels.com' },
  { name: 'Best Western', website: 'bestwestern.com' },
  { name: 'Radisson', website: 'radissonhotels.com' },
  { name: 'Four Seasons', website: 'fourseasons.com' },
  { name: 'Ritz-Carlton', website: 'ritzcarlton.com' },
  { name: 'St. Regis', website: 'marriott.com' },
  { name: 'W Hotel', website: 'marriott.com' },
  { name: 'Sheraton', website: 'marriott.com' },
  { name: 'Westin', website: 'marriott.com' },
  { name: 'Courtyard', website: 'marriott.com' },
  { name: 'Residence Inn', website: 'marriott.com' },
  { name: 'Fairmont', website: 'accor.com' },
  { name: 'Novotel', website: 'accor.com' },
  { name: 'ibis', website: 'accor.com' },
];

// Popular cities for quick address entry
const POPULAR_CITIES = [
  { name: 'New York', country: 'USA' },
  { name: 'Los Angeles', country: 'USA' },
  { name: 'London', country: 'UK' },
  { name: 'Paris', country: 'France' },
  { name: 'Tokyo', country: 'Japan' },
  { name: 'Sydney', country: 'Australia' },
  { name: 'Dubai', country: 'UAE' },
  { name: 'Singapore', country: 'Singapore' },
  { name: 'Rome', country: 'Italy' },
  { name: 'Barcelona', country: 'Spain' },
  { name: 'Amsterdam', country: 'Netherlands' },
  { name: 'Berlin', country: 'Germany' },
  { name: 'Toronto', country: 'Canada' },
  { name: 'Vancouver', country: 'Canada' },
  { name: 'San Francisco', country: 'USA' },
  { name: 'Chicago', country: 'USA' },
  { name: 'Miami', country: 'USA' },
  { name: 'Las Vegas', country: 'USA' },
  { name: 'Honolulu', country: 'USA' },
  { name: 'Bangkok', country: 'Thailand' },
];

interface HotelFormProps {
  tripId: string;
  hotel?: Hotel;
  onClose: () => void;
  onSave?: () => void;
}

export function HotelForm({ tripId, hotel, onClose, onSave }: HotelFormProps) {
  const { addHotel, updateHotel, deleteHotel } = useTripStore();
  
  // Form state
  const [name, setName] = useState(hotel?.name || '');
  const [address, setAddress] = useState(hotel?.address || '');
  const [latitude, setLatitude] = useState<number | undefined>(hotel?.latitude);
  const [longitude, setLongitude] = useState<number | undefined>(hotel?.longitude);
  const [checkInDate, setCheckInDate] = useState(hotel?.checkInDate || '');
  const [checkInTime, setCheckInTime] = useState(hotel?.checkInTime || '15:00');
  const [checkOutDate, setCheckOutDate] = useState(hotel?.checkOutDate || '');
  const [checkOutTime, setCheckOutTime] = useState(hotel?.checkOutTime || '11:00');
  const [confirmationNumber, setConfirmationNumber] = useState(hotel?.confirmationNumber || '');
  const [roomType, setRoomType] = useState(hotel?.roomType || '');
  const [phone, setPhone] = useState(hotel?.phone || '');
  const [email, setEmail] = useState(hotel?.email || '');
  const [website, setWebsite] = useState(hotel?.website || '');
  const [notes, setNotes] = useState(hotel?.notes || '');
  const [cost, setCost] = useState(hotel?.cost?.toString() || '');
  const [currency, setCurrency] = useState(hotel?.currency || 'USD');
  
  // UI state
  const [showNameDropdown, setShowNameDropdown] = useState(false);
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Calculate nights
  const nights = checkInDate && checkOutDate 
    ? Math.ceil((new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  
  // Filtered options
  const filteredChains = HOTEL_CHAINS.filter(
    (h) => h.name.toLowerCase().includes(name.toLowerCase())
  );
  
  const filteredCities = POPULAR_CITIES.filter(
    (c) => c.name.toLowerCase().includes(address.toLowerCase())
  );
  
  const selectChain = (chain: typeof HOTEL_CHAINS[0]) => {
    setName(chain.name);
    setWebsite(chain.website);
    setShowNameDropdown(false);
  };
  
  const selectCity = (city: typeof POPULAR_CITIES[0]) => {
    setAddress(`${city.name}, ${city.country}`);
    setShowAddressDropdown(false);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!name.trim() || !checkInDate || !checkOutDate) {
      alert('Please fill in all required fields');
      return;
    }
    
    // Check if check-out is after check-in
    if (new Date(checkOutDate) <= new Date(checkInDate)) {
      alert('Check-out date must be after check-in date');
      return;
    }
    
    const hotelData: Hotel = {
      id: hotel?.id || `hotel-${Date.now()}`,
      name,
      address,
      latitude,
      longitude,
      checkInDate,
      checkInTime,
      checkOutDate,
      checkOutTime,
      confirmationNumber,
      roomType,
      phone,
      email,
      website,
      notes,
      cost: cost ? parseFloat(cost) : undefined,
      currency,
    };
    
    if (hotel) {
      updateHotel(tripId, hotel.id, hotelData);
    } else {
      addHotel(tripId, hotelData);
    }
    
    onSave?.();
    onClose();
  };
  
  const handleDelete = () => {
    if (hotel) {
      deleteHotel(tripId, hotel.id);
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
            <Building2 className="w-5 h-5" style={{ color: '#7c3aed' }} />
            <h2 style={{ fontSize: '1.125rem', fontWeight: '600' }}>
              {hotel ? 'Edit Hotel' : 'Add Hotel'}
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
              Hotel Details *
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              {/* Hotel Name */}
              <div style={{ position: 'relative' }}>
                <label style={labelStyle}>Hotel Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setShowNameDropdown(true);
                  }}
                  onFocus={() => setShowNameDropdown(true)}
                  onBlur={() => setTimeout(() => setShowNameDropdown(false), 200)}
                  placeholder="e.g., Marriott Times Square"
                  style={inputStyle}
                />
                {showNameDropdown && filteredChains.length > 0 && (
                  <div style={dropdownStyle}>
                    {filteredChains.slice(0, 8).map((chain) => (
                      <div
                        key={chain.name}
                        style={dropdownItemStyle}
                        onMouseDown={() => selectChain(chain)}
                      >
                        <span>{chain.name}</span>
                        <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>{chain.website}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Room Type */}
              <div>
                <label style={labelStyle}>Room Type</label>
                <input
                  type="text"
                  value={roomType}
                  onChange={(e) => setRoomType(e.target.value)}
                  placeholder="e.g., King Suite"
                  style={inputStyle}
                />
              </div>
            </div>
            
            {/* Address with geocoding autocomplete */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>Address (with geocoding)</label>
              <LocationSearch
                value={address ? { name: address.split(',')[0], address, latitude, longitude } : undefined}
                onChange={(location) => {
                  if (location) {
                    setAddress(location.address);
                    setLatitude(location.latitude);
                    setLongitude(location.longitude);
                  } else {
                    setAddress('');
                    setLatitude(undefined);
                    setLongitude(undefined);
                  }
                }}
                placeholder="Search for hotel address..."
                disabled={false}
              />
              {(latitude && longitude) && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#059669' }}>
                  ✓ Coordinates: {latitude.toFixed(6)}, {longitude.toFixed(6)}
                </div>
              )}
            </div>
          </div>
          
          {/* Check-in/Check-out Dates */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '1rem', color: '#111827' }}>
              Stay Dates *
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '0.75rem' }}>
              {/* Check-in Date */}
              <div>
                <label style={labelStyle}>Check-in Date *</label>
                <div style={{ position: 'relative' }}>
                  <Calendar 
                    className="w-4 h-4" 
                    style={{ 
                      position: 'absolute', 
                      left: '0.75rem', 
                      top: '50%', 
                      transform: 'translateY(-50%)',
                      color: '#9ca3af'
                    }} 
                  />
                  <input
                    type="date"
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    style={{ ...inputStyle, paddingLeft: '2.25rem' }}
                  />
                </div>
              </div>
              
              {/* Check-in Time */}
              <div>
                <label style={labelStyle}>Check-in Time</label>
                <input
                  type="time"
                  value={checkInTime}
                  onChange={(e) => setCheckInTime(e.target.value)}
                  style={inputStyle}
                />
              </div>
              
              {/* Check-out Time */}
              <div>
                <label style={labelStyle}>Check-out Time</label>
                <input
                  type="time"
                  value={checkOutTime}
                  onChange={(e) => setCheckOutTime(e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>
            
            {/* Check-out Date + Nights */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Check-out Date *</label>
                <div style={{ position: 'relative' }}>
                  <Calendar 
                    className="w-4 h-4" 
                    style={{ 
                      position: 'absolute', 
                      left: '0.75rem', 
                      top: '50%', 
                      transform: 'translateY(-50%)',
                      color: '#9ca3af'
                    }} 
                  />
                  <input
                    type="date"
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    style={{ ...inputStyle, paddingLeft: '2.25rem' }}
                  />
                </div>
              </div>
              
              {/* Nights Display */}
              <div>
                <label style={labelStyle}>Nights</label>
                <div
                  style={{
                    ...inputStyle,
                    background: '#f3f4f6',
                    color: nights > 0 ? '#059669' : '#6b7280',
                    fontWeight: nights > 0 ? '600' : '400',
                  }}
                >
                  {nights > 0 ? `${nights} night${nights > 1 ? 's' : ''}` : '—'}
                </div>
              </div>
            </div>
          </div>
          
          {/* Booking Details */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '1rem', color: '#111827' }}>
              Booking Details
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={labelStyle}>Confirmation Number</label>
                <input
                  type="text"
                  value={confirmationNumber}
                  onChange={(e) => setConfirmationNumber(e.target.value)}
                  placeholder="ABC123456"
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
          </div>
          
          {/* Contact Info */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '1rem', color: '#111827' }}>
              Contact Information
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={labelStyle}>Phone</label>
                <div style={{ position: 'relative' }}>
                  <Phone 
                    className="w-4 h-4" 
                    style={{ 
                      position: 'absolute', 
                      left: '0.75rem', 
                      top: '50%', 
                      transform: 'translateY(-50%)',
                      color: '#9ca3af'
                    }} 
                  />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 555-123-4567"
                    style={{ ...inputStyle, paddingLeft: '2.25rem' }}
                  />
                </div>
              </div>
              
              <div>
                <label style={labelStyle}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="hotel@example.com"
                  style={inputStyle}
                />
              </div>
            </div>
            
            <div>
              <label style={labelStyle}>Website / Booking Link</label>
              <div style={{ position: 'relative' }}>
                <Globe 
                  className="w-4 h-4" 
                  style={{ 
                    position: 'absolute', 
                    left: '0.75rem', 
                    top: '50%', 
                    transform: 'translateY(-50%)',
                    color: '#9ca3af'
                  }} 
                />
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://example.com"
                  style={{ ...inputStyle, paddingLeft: '2.25rem' }}
                />
              </div>
            </div>
          </div>
          
          {/* Notes */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={labelStyle}>Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes about your stay..."
              rows={2}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>
          
          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
            <div>
              {hotel && (
                showDeleteConfirm ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.875rem', color: '#dc2626' }}>Delete this hotel?</span>
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
                  background: '#7c3aed',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                }}
              >
                <Save className="w-4 h-4" />
                {hotel ? 'Update Hotel' : 'Add Hotel'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
