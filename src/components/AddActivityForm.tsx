'use client';

import { useState } from 'react';
import { useTripActions } from '@/lib/store';
import { ActivityCategory } from '@/lib/types';
import { X, Clock, MapPin, DollarSign, FileText } from 'lucide-react';

interface AddActivityFormProps {
  tripId: string;
  dayId: string;
  onComplete?: () => void;
}

const CATEGORIES: { value: ActivityCategory; label: string }[] = [
  { value: 'activity', label: 'Activity' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'attraction', label: 'Attraction' },
  { value: 'transport', label: 'Transport' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'other', label: 'Other' },
];

export function AddActivityForm({ tripId, dayId, onComplete }: AddActivityFormProps) {
  const { addActivity } = useTripActions();
  
  const [name, setName] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState<ActivityCategory>('activity');
  const [notes, setNotes] = useState('');
  const [cost, setCost] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      return;
    }
    
    setIsSubmitting(true);
    
    const activity = {
      id: `activity-${Date.now()}`,
      name: name.trim(),
      time: time || undefined,
      location: location || undefined,
      category,
      notes: notes || undefined,
      cost: cost ? parseFloat(cost) : undefined,
    };
    
    addActivity(tripId, dayId, activity);
    
    // Reset form
    setName('');
    setTime('');
    setLocation('');
    setCategory('activity');
    setNotes('');
    setCost('');
    
    setIsSubmitting(false);
    onComplete?.();
  };

  return (
    <form onSubmit={handleSubmit} style={{ 
      backgroundColor: '#f8fafc', 
      padding: '1rem', 
      borderRadius: '0.5rem',
      border: '1px solid #e2e8f0'
    }}>
      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Activity name *"
          required
          style={{
            width: '100%',
            padding: '0.625rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.375rem',
            fontSize: '0.875rem'
          }}
        />
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
        <div style={{ position: 'relative' }}>
          <Clock size={16} style={{ 
            position: 'absolute', 
            left: '0.625rem', 
            top: '50%', 
            transform: 'translateY(-50%)',
            color: '#9ca3af'
          }} />
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            placeholder="Time"
            style={{
              width: '100%',
              padding: '0.625rem 0.625rem 0.625rem 2.25rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              fontSize: '0.875rem'
            }}
          />
        </div>
        
        <div style={{ position: 'relative' }}>
          <DollarSign size={16} style={{ 
            position: 'absolute', 
            left: '0.625rem', 
            top: '50%', 
            transform: 'translateY(-50%)',
            color: '#9ca3af'
          }} />
          <input
            type="number"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            placeholder="Cost ($)"
            step="0.01"
            min="0"
            style={{
              width: '100%',
              padding: '0.625rem 0.625rem 0.625rem 2.25rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              fontSize: '0.875rem'
            }}
          />
        </div>
      </div>
      
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ position: 'relative' }}>
          <MapPin size={16} style={{ 
            position: 'absolute', 
            left: '0.625rem', 
            top: '50%', 
            transform: 'translateY(-50%)',
            color: '#9ca3af'
          }} />
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Location"
            style={{
              width: '100%',
              padding: '0.625rem 0.625rem 0.625rem 2.25rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              fontSize: '0.875rem'
            }}
          />
        </div>
      </div>
      
      <div style={{ marginBottom: '1rem' }}>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as ActivityCategory)}
          style={{
            width: '100%',
            padding: '0.625rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.375rem',
            fontSize: '0.875rem',
            backgroundColor: 'white'
          }}
        >
          {CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>
      
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ position: 'relative' }}>
          <FileText size={16} style={{ 
            position: 'absolute', 
            left: '0.625rem', 
            top: '0.625rem',
            color: '#9ca3af'
          }} />
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes (optional)"
            rows={2}
            style={{
              width: '100%',
              padding: '0.625rem 0.625rem 0.625rem 2.25rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
              resize: 'vertical'
            }}
          />
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
        {onComplete && (
          <button
            type="button"
            onClick={onComplete}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#f1f5f9',
              color: '#475569',
              border: '1px solid #e2e8f0',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={!name.trim() || isSubmitting}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: name.trim() ? '#3b82f6' : '#94a3b8',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: name.trim() ? 'pointer' : 'not-allowed',
            fontSize: '0.875rem'
          }}
        >
          Add Activity
        </button>
      </div>
    </form>
  );
}
