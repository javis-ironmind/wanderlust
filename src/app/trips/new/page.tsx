'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// Trip categories
const TRIP_CATEGORIES = [
  { value: 'vacation', label: 'Vacation', icon: '🏖️', color: '#10B981' },
  { value: 'business', label: 'Business', icon: '💼', color: '#3B82F6' },
  { value: 'weekend', label: 'Weekend Getaway', icon: '🏙️', color: '#8B5CF6' },
  { value: 'adventure', label: 'Adventure', icon: '🧗', color: '#F59E0B' },
  { value: 'family', label: 'Family', icon: '👨‍👩‍👧‍👦', color: '#EC4899' },
  { value: 'honeymoon', label: 'Honeymoon', icon: '💕', color: '#EF4444' },
  { value: 'friends', label: 'Friends', icon: '🎉', color: '#6366F1' },
  { value: 'solo', label: 'Solo', icon: '🎒', color: '#14B8A6' },
];

export default function NewTripPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [collaborators, setCollaborators] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validation: end date must be after start date
    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      setError('End date must be after start date');
      return;
    }
    
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
    
    // Parse collaborators into array
    const collaboratorsList = collaborators
      .split(',')
      .map(c => c.trim())
      .filter(c => c.length > 0);
    
    // Handle custom tags
    let categories = [...selectedCategories];
    if (customTag.trim()) {
      categories.push(customTag.trim().toLowerCase());
    }
    
    const newTrip = {
      id: `trip-${Date.now()}`,
      name,
      startDate,
      endDate,
      coverImage: coverImage || null,
      collaborators: collaboratorsList,
      categories, // AC5: Multiple tags support
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
            {error && (
              <div style={{ 
                padding: '0.75rem 1rem', 
                background: '#fef2f2', 
                border: '1px solid #fecaca', 
                borderRadius: '8px', 
                color: '#dc2626',
                fontSize: '0.875rem'
              }}>
                {error}
              </div>
            )}
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151', fontSize: '0.875rem' }}>
                Where are you going? *
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
                  outline: 'none',
                }}
                placeholder="e.g., San Francisco"
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151', fontSize: '0.875rem' }}>
                  Start Date *
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
                  End Date *
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
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151', fontSize: '0.875rem' }}>
                Cover Image URL <span style={{ color: '#9ca3af', fontWeight: '400' }}>(optional)</span>
              </label>
              <input
                name="coverImage"
                type="url"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '0.875rem 1rem', 
                  borderRadius: '12px', 
                  border: '2px solid #e2e8f0', 
                  fontSize: '1rem',
                  outline: 'none',
                }}
                placeholder="https://example.com/image.jpg"
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151', fontSize: '0.875rem' }}>
                Collaborators <span style={{ color: '#9ca3af', fontWeight: '400' }}>(optional, comma-separated)</span>
              </label>
              <input
                name="collaborators"
                type="text"
                value={collaborators}
                onChange={(e) => setCollaborators(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '0.875rem 1rem', 
                  borderRadius: '12px', 
                  border: '2px solid #e2e8f0', 
                  fontSize: '1rem',
                  outline: 'none',
                }}
                placeholder="alice@example.com, bob@example.com"
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>
            
            {/* AC1: Category selector */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151', fontSize: '0.875rem' }}>
                Categories <span style={{ color: '#9ca3af', fontWeight: '400' }}>(select all that apply)</span>
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                {TRIP_CATEGORIES.map((cat) => {
                  const isSelected = selectedCategories.includes(cat.value);
                  return (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setSelectedCategories(selectedCategories.filter(c => c !== cat.value));
                        } else {
                          setSelectedCategories([...selectedCategories, cat.value]);
                        }
                      }}
                      style={{
                        padding: '0.5rem 0.75rem',
                        borderRadius: '8px',
                        border: `2px solid ${isSelected ? cat.color : '#e2e8f0'}`,
                        background: isSelected ? `${cat.color}15` : 'white',
                        color: isSelected ? cat.color : '#374151',
                        fontSize: '0.875rem',
                        fontWeight: isSelected ? '600' : '400',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.375rem',
                        transition: 'all 0.2s',
                      }}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
              {/* Custom tag input - AC5: Multiple tags support */}
              <input
                type="text"
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '0.75rem 1rem', 
                  borderRadius: '12px', 
                  border: '2px solid #e2e8f0', 
                  fontSize: '0.875rem',
                  outline: 'none',
                }}
                placeholder="Add custom tag..."
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
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
