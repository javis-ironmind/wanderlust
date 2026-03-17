'use client';

import { useState, useEffect } from 'react';
import { useTripActions } from '@/lib/store';
import { ActivityCategory, Activity } from '@/lib/types';

// Category definitions with icons
const CATEGORIES: { value: ActivityCategory; label: string; icon: string }[] = [
  { value: 'flight', label: 'Flight', icon: '✈️' },
  { value: 'hotel', label: 'Hotel', icon: '🏨' },
  { value: 'restaurant', label: 'Restaurant', icon: '🍽️' },
  { value: 'attraction', label: 'Attraction', icon: '🎭' },
  { value: 'activity', label: 'Activity', icon: '🎯' },
  { value: 'transport', label: 'Transport', icon: '🚗' },
  { value: 'shopping', label: 'Shopping', icon: '🛍️' },
  { value: 'entertainment', label: 'Entertainment', icon: '🎬' },
  { value: 'other', label: 'Other', icon: '📌' },
];

interface AddActivityFormProps {
  isOpen: boolean;
  onClose: () => void;
  tripId: string;
  dayId: string;
  existingActivityCount: number;
}

export default function AddActivityForm({
  isOpen,
  onClose,
  tripId,
  dayId,
  existingActivityCount,
}: AddActivityFormProps) {
  const { addActivity } = useTripActions();
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ActivityCategory>('activity');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [locationName, setLocationName] = useState('');
  const [locationAddress, setLocationAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [cost, setCost] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Location search state (placeholder for future implementation)
  const [locationQuery, setLocationQuery] = useState('');
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [isLocationSearching, setIsLocationSearching] = useState(false);
  
  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTitle('');
      setDescription('');
      setCategory('activity');
      setStartTime('');
      setEndTime('');
      setLocationName('');
      setLocationAddress('');
      setNotes('');
      setCost('');
      setErrors({});
      setLocationQuery('');
      setShowLocationSuggestions(false);
    }
  }, [isOpen]);
  
  // Validate form
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    const activityToAdd: Activity = {
      id: `activity-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      startTime: startTime || undefined,
      endTime: endTime || undefined,
      location: locationName ? {
        id: `loc-${Date.now()}`,
        name: locationName,
        address: locationAddress,
        latitude: 0,
        longitude: 0,
      } : undefined,
      notes: notes.trim() || undefined,
      cost: cost ? parseFloat(cost) : undefined,
      currency: cost ? 'USD' : undefined,
      order: existingActivityCount,
    };
    
    addActivity(tripId, dayId, activityToAdd);
    
    onClose();
  };
  
  // Handle location search (placeholder - would integrate with Places API)
  const handleLocationSearch = (query: string) => {
    setLocationQuery(query);
    if (query.length > 2) {
      setIsLocationSearching(true);
      // Simulate search delay - in real implementation would call Places API
      setTimeout(() => {
        setIsLocationSearching(false);
        setShowLocationSuggestions(query.length > 0);
      }, 500);
    } else {
      setShowLocationSuggestions(false);
    }
  };
  
  // Handle selecting a location suggestion
  const handleLocationSelect = (suggestion: { name: string; address: string }) => {
    setLocationName(suggestion.name);
    setLocationAddress(suggestion.address);
    setLocationQuery(suggestion.name);
    setShowLocationSuggestions(false);
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className="relative bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Add Activity</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            {/* Title - Required */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., Visit Eiffel Tower"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-500">{errors.title}</p>
              )}
            </div>
            
            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-none"
                placeholder="Optional description"
              />
            </div>
            
            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value as ActivityCategory)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Time Pickers - Start and End */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time
                </label>
                <input
                  type="time"
                  id="startTime"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                />
              </div>
              <div>
                <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
                  End Time
                </label>
                <input
                  type="time"
                  id="endTime"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                />
              </div>
            </div>
            
            {/* Location Search */}
            <div className="relative">
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">📍</span>
                <input
                  type="text"
                  id="location"
                  value={locationQuery}
                  onChange={(e) => handleLocationSearch(e.target.value)}
                  onFocus={() => locationQuery.length > 2 && setShowLocationSuggestions(true)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  placeholder="Search for a place..."
                  autoComplete="off"
                />
                {isLocationSearching && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  </span>
                )}
              </div>
              
              {/* Location Suggestions Dropdown */}
              {showLocationSuggestions && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => handleLocationSelect({ name: 'Sample Location 1', address: '123 Main St, City' })}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-medium">Sample Location 1</span>
                    <span className="block text-sm text-gray-500">123 Main St, City</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLocationSelect({ name: 'Sample Location 2', address: '456 Oak Ave, Town' })}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-medium">Sample Location 2</span>
                    <span className="block text-sm text-gray-500">456 Oak Ave, Town</span>
                  </button>
                  <p className="px-4 py-2 text-sm text-gray-500">
                    Start typing to search locations...
                  </p>
                </div>
              )}
              
              {/* Hidden fields to store selected location */}
              {locationName && (
                <input type="hidden" name="locationName" value={locationName} />
              )}
            </div>
            
            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-none"
                placeholder="Any additional notes..."
              />
            </div>
            
            {/* Cost */}
            <div>
              <label htmlFor="cost" className="block text-sm font-medium text-gray-700 mb-1">
                Cost (USD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                <input
                  type="number"
                  id="cost"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  min="0"
                  step="0.01"
                  className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  placeholder="0.00"
                />
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Save Activity
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
