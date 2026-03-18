'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { TripMap } from '@/components/map/TripMap';
import { exportTripToPDF } from '@/lib/exportPDF';
import { ShareModal } from '@/components/ShareModal';
import TemplateModal from '@/components/TemplateModal';
import { WeatherWidget } from '@/components/WeatherWidget';
import { BudgetWidget } from '@/components/BudgetWidget';
import PackingList from '@/components/PackingList';
import CloudSyncSettings from '@/components/CloudSyncSettings';
import CalendarExport from '@/components/CalendarExport';
import { FlightForm } from '@/components/FlightForm';
import { HotelForm } from '@/components/HotelForm';
import { ReminderSettings } from '@/components/ReminderSettings';
import { ReminderBell } from '@/components/ReminderBell';
import { hasWriteAccess, validateAccessCode } from '@/lib/shareTrip';
import { addReminder, removeReminder } from '@/lib/reminders';

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
  reminder?: number; // minutes before (15, 30, 60, 120, 1440)
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
  categories?: string[];
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
  const [newActivityReminder, setNewActivityReminder] = useState<number | undefined>(undefined);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'itinerary' | 'explore' | 'budget' | 'journal' | 'flights'>('itinerary');
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set()); // Track which days are expanded
  const [quickAddText, setQuickAddText] = useState<Record<string, string>>({}); // Quick add input per day
  const [showMap, setShowMap] = useState(false); // AC5: FAB to toggle map view on/off
  const [showFlightModal, setShowFlightModal] = useState(false);
  const [showHotelModal, setShowHotelModal] = useState(false);
  const [isSharedReadOnly, setIsSharedReadOnly] = useState(false);
  const [shareCode, setShareCode] = useState<string | null>(null);
  
  // T015: Category editing state
  const [showCategoryEditor, setShowCategoryEditor] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [customCategory, setCustomCategory] = useState('');
  
  const PREDEFINED_CATEGORIES = ['Business', 'Vacation', 'Adventure', 'Cultural', 'Relaxation', 'Romantic', 'Family', 'Solo'];

  // AC2 & AC6: Check for share parameter and track views
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('share');
      
      if (code) {
        setShareCode(code);
        const permission = validateAccessCode(tripId, code);
        
        // If no valid permission or only read, show read-only
        if (!permission || permission === 'read') {
          setIsSharedReadOnly(true);
        }
        
        // AC6: Track view count in localStorage
        const viewKey = `wanderlust_views_${tripId}`;
        const views = parseInt(localStorage.getItem(viewKey) || '0', 10);
        localStorage.setItem(viewKey, String(views + 1));
      }
    }
  }, [tripId]);
  const markers = useMemo(() => {
    if (!trip?.days) return [];
    const allActivities = trip.days.flatMap(day => day.activities);
    return allActivities
      .filter(activity => activity.location?.latitude && activity.location?.longitude)
      .map(activity => ({
        id: activity.id,
        position: [activity.location!.latitude!, activity.location!.longitude!] as [number, number],
        title: activity.title,
        category: activity.category || 'other',
      }));
  }, [trip]);

  // AC3: Compute route polyline from markers in order
  const routePositions = useMemo(() => {
    return markers.map(m => m.position);
  }, [markers]);

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
      reminder: newActivityReminder,
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
    
    // Save reminder if set
    if (newActivityReminder && newActivityStartTime) {
      addReminder(
        tripId,
        newActivity.id,
        newActivity.title,
        newActivityStartTime,
        newActivityReminder
      );
    }
    
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
    setNewActivityReminder(undefined);
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

  // T015: Handle add category
  const handleAddCategory = () => {
    if (!trip) return;
    const categoryToAdd = selectedCategory === 'custom' ? customCategory.trim() : selectedCategory;
    if (!categoryToAdd) return;
    
    const currentCategories = trip.categories || [];
    if (currentCategories.includes(categoryToAdd)) return;
    
    const updatedTrip = { ...trip, categories: [...currentCategories, categoryToAdd] };
    setTrip(updatedTrip);
    
    const saved = localStorage.getItem('wanderlust_trips');
    if (saved) {
      const trips: Trip[] = JSON.parse(saved);
      const updatedTrips = trips.map(t => t.id === tripId ? updatedTrip : t);
      localStorage.setItem('wanderlust_trips', JSON.stringify(updatedTrips));
    }
    
    setSelectedCategory('');
    setCustomCategory('');
    setShowCategoryEditor(false);
  };

  // T015: Handle remove category
  const handleRemoveCategory = (categoryToRemove: string) => {
    if (!trip) return;
    
    const updatedTrip = { 
      ...trip, 
      categories: (trip.categories || []).filter(c => c !== categoryToRemove) 
    };
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

  // AC6: Get view count
  const getViewCount = () => {
    if (typeof window === 'undefined') return 0;
    const viewKey = `wanderlust_views_${tripId}`;
    return parseInt(localStorage.getItem(viewKey) || '0', 10);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trip?.days, expandedDays.size]);

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
          {/* T015: Category display and editing */}
          <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
            {trip?.categories && trip.categories.length > 0 ? (
              trip.categories.map((cat) => (
                <span key={cat} style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                  padding: '0.25rem 0.5rem', background: 'rgba(59, 130, 246, 0.3)',
                  borderRadius: '6px', color: 'white', fontSize: '0.75rem', fontWeight: '600',
                }}>
                  {cat}
                  {!isSharedReadOnly && (
                    <button
                      onClick={() => handleRemoveCategory(cat)}
                      style={{
                        background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.7)',
                        cursor: 'pointer', padding: '0', marginLeft: '0.25rem', fontSize: '0.75rem',
                      }}
                    >
                      ×
                    </button>
                  )}
                </span>
              ))
            ) : (
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem' }}>No categories</span>
            )}
            {!isSharedReadOnly && (
              <button
                onClick={() => setShowCategoryEditor(!showCategoryEditor)}
                style={{
                  background: 'rgba(139, 92, 246, 0.3)', border: 'none', borderRadius: '6px',
                  color: 'white', fontSize: '0.7rem', padding: '0.25rem 0.5rem', cursor: 'pointer',
                }}
              >
                + Category
              </button>
            )}
          </div>
          {/* T015: Category editor dropdown */}
          {showCategoryEditor && !isSharedReadOnly && (
            <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{
                  padding: '0.35rem 0.5rem', borderRadius: '6px', border: 'none',
                  fontSize: '0.75rem', background: 'white', color: '#1e3a5f',
                }}
              >
                <option value="">Select category...</option>
                {PREDEFINED_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
                <option value="custom">+ Custom</option>
              </select>
              {selectedCategory === 'custom' && (
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="Custom category"
                  style={{
                    padding: '0.35rem 0.5rem', borderRadius: '6px', border: 'none',
                    fontSize: '0.75rem', width: '120px',
                  }}
                />
              )}
              <button
                onClick={handleAddCategory}
                disabled={!selectedCategory || (selectedCategory === 'custom' && !customCategory.trim())}
                style={{
                  background: '#3b82f6', border: 'none', borderRadius: '6px',
                  color: 'white', fontSize: '0.7rem', padding: '0.35rem 0.75rem', cursor: 'pointer',
                }}
              >
                Add
              </button>
            </div>
          )}
          
          {/* T016: Reminder Bell */}
          <div style={{ marginLeft: 'auto' }}>
            <ReminderBell tripId={tripId} />
          </div>
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
          { id: 'flights', label: '✈️ Flights' },
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
          <button
            onClick={() => setShowTemplateModal(true)}
            style={{
              background: '#059669',
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
            💾 Save as Template
          </button>
          {trip && <CalendarExport trip={trip} />}
        </div>
        
        <h1 style={{ fontSize: '2rem', fontWeight: '700', color: 'white', marginBottom: '0.25rem' }}>
          {trip.name}
        </h1>
        {/* AC2: Show read-only indicator for shared trips */}
        {isSharedReadOnly && (
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            padding: '0.5rem 1rem', 
            background: 'rgba(139, 92, 246, 0.2)', 
            borderRadius: '8px',
            marginBottom: '1rem',
            border: '1px solid #8b5cf6'
          }}>
            <span style={{ fontSize: '1rem' }}>👁️</span>
            <span style={{ color: '#c4b5fd', fontSize: '0.875rem', fontWeight: '600' }}>
              Viewing Shared Trip {shareCode && `(Code: ${shareCode})`}
            </span>
            <span style={{ color: '#a78bfa', fontSize: '0.75rem' }}>
              • {getViewCount()} views
            </span>
          </div>
        )}
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

        {/* Flights & Hotels Section (T009) */}
        <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600', color: '#1e3a5f' }}>✈️ Flights & Hotels</h2>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setShowFlightModal?.(true)}
                style={{
                  background: '#3b82f6',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                + Flight
              </button>
              <button
                onClick={() => setShowHotelModal?.(true)}
                style={{
                  background: '#8b5cf6',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                + Hotel
              </button>
            </div>
          </div>

          {/* Flights */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '1rem', fontWeight: '600', color: '#334155' }}>Flights</h3>
            {trip.flights && trip.flights.length > 0 ? (
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {trip.flights.map((flight: any) => (
                  <div key={flight.id} style={{ 
                    padding: '1rem', 
                    background: '#f8fafc', 
                    borderRadius: '8px', 
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <div>
                      <div style={{ fontWeight: '600', color: '#1e3a5f' }}>{flight.airline} {flight.flightNumber}</div>
                      <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                        {flight.departureAirport} → {flight.arrivalAirport}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                        {flight.departureTime ? new Date(flight.departureTime).toLocaleString() : 'No time'}
                      </div>
                      {flight.confirmationNumber && (
                        <div style={{ fontSize: '0.8rem', color: '#3b82f6' }}>Confirmation: {flight.confirmationNumber}</div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', background: '#e2e8f0', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Edit</button>
                      <button style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', background: '#fee2e2', border: 'none', borderRadius: '4px', cursor: 'pointer', color: '#dc2626' }}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ margin: 0, color: '#94a3b8', fontStyle: 'italic' }}>No flights added yet</p>
            )}
          </div>

          {/* Hotels */}
          <div>
            <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '1rem', fontWeight: '600', color: '#334155' }}>Hotels</h3>
            {trip.hotels && trip.hotels.length > 0 ? (
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {trip.hotels.map((hotel: any) => (
                  <div key={hotel.id} style={{ 
                    padding: '1rem', 
                    background: '#f8fafc', 
                    borderRadius: '8px', 
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <div>
                      <div style={{ fontWeight: '600', color: '#1e3a5f' }}>{hotel.name}</div>
                      <div style={{ fontSize: '0.875rem', color: '#64748b' }}>{hotel.address}</div>
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                        Check-in: {hotel.checkInDate} → Check-out: {hotel.checkOutDate}
                      </div>
                      {hotel.confirmationNumber && (
                        <div style={{ fontSize: '0.8rem', color: '#8b5cf6' }}>Confirmation: {hotel.confirmationNumber}</div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', background: '#e2e8f0', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Edit</button>
                      <button style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', background: '#fee2e2', border: 'none', borderRadius: '4px', cursor: 'pointer', color: '#dc2626' }}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ margin: 0, color: '#94a3b8', fontStyle: 'italic' }}>No hotels added yet</p>
            )}
          </div>
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
                  {/* Quick add button in header - hidden in read-only */}
                  {!isSharedReadOnly && (
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
                  )}
                </div>
                
                {/* AC3: "Add a place" input when expanded - hidden in read-only */}
                {isExpanded && !isSharedReadOnly && (
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
                    {/* AC4: Auto-fill and Optimize buttons - hidden in read-only */}
                    {!isSharedReadOnly && (
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
                    )}
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

        {/* Map - AC1: Shows only when activities have locations */}
        {showMap && markers.length > 0 && (
          <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', minHeight: '250px', marginBottom: '1rem' }}>
            <TripMap 
              className="leaflet-container" 
              markers={markers}
              route={routePositions}
            />
          </div>
        )}

        {/* AC5: FAB to toggle map view on/off */}
        {markers.length > 0 && (
          <button
            onClick={() => setShowMap(!showMap)}
            style={{
              position: 'fixed',
              bottom: '7rem',
              right: '2rem',
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              border: 'none',
              background: showMap ? '#3b82f6' : '#64748b',
              color: 'white',
              fontSize: '1.25rem',
              cursor: 'pointer',
              zIndex: 100,
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            }}
            title={showMap ? 'Hide Map' : 'Show Map'}
          >
            🗺️
          </button>
        )}

        {/* Share Modal */}
        <ShareModal
          tripId={tripId}
          tripName={trip?.name || ''}
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
        />

        {/* Template Modal */}
        <TemplateModal
          isOpen={showTemplateModal}
          onClose={() => setShowTemplateModal(false)}
          mode="save"
          tripId={tripId}
        />

        {/* Flight Modal */}
        {showFlightModal && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000,
          }} onClick={() => setShowFlightModal(false)}>
            <div style={{
              background: 'white', borderRadius: '12px', padding: '1.5rem', maxWidth: '500px', width: '90%',
              maxHeight: '90vh', overflow: 'auto',
            }} onClick={e => e.stopPropagation()}>
              <FlightForm
                tripId={tripId}
                onClose={() => setShowFlightModal(false)}
              />
            </div>
          </div>
        )}

        {/* Hotel Modal */}
        {showHotelModal && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000,
          }} onClick={() => setShowHotelModal(false)}>
            <div style={{
              background: 'white', borderRadius: '12px', padding: '1.5rem', maxWidth: '500px', width: '90%',
              maxHeight: '90vh', overflow: 'auto',
            }} onClick={e => e.stopPropagation()}>
              <HotelForm
                tripId={tripId}
                onClose={() => setShowHotelModal(false)}
              />
            </div>
          </div>
        )}
      </div>

      {/* Mobile Floating Action Button - disabled in read-only mode */}
      {!isSharedReadOnly && (
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
      )}

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
            
            {/* Reminder input */}
            <div style={{ marginBottom: '1.5rem' }}>
              <ReminderSettings 
                reminder={newActivityReminder} 
                onChange={setNewActivityReminder} 
              />
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

      {/* AC4: Floating Action Buttons - modified for read-only mode */}
      <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', zIndex: 100 }}>
        {!isSharedReadOnly && (
          <button onClick={() => setShowAddModal(true)} style={{
            width: '56px', height: '56px', borderRadius: '16px', border: 'none',
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            color: 'white', fontSize: '1.5rem', cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(59, 130, 246, 0.4)',
          }}>+</button>
        )}
        <button onClick={() => trip && exportTripToPDF(trip)} style={{
          width: '48px', height: '48px', borderRadius: '14px', border: 'none',
          background: '#10b981', color: 'white', fontSize: '1.25rem', cursor: 'pointer',
        }}>📄</button>
        {!isSharedReadOnly && (
          <button onClick={() => setShowShareModal(true)} style={{
            width: '48px', height: '48px', borderRadius: '14px', border: 'none',
            background: '#8b5cf6', color: 'white', fontSize: '1.25rem', cursor: 'pointer',
          }}>🔗</button>
        )}
      </div>

    </div>
  );
}
