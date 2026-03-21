'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Calendar, Map, Hotel, Plane, Utensils, Compass, Archive, Plus, ChevronRight,
  GripVertical, Share2, Users, Clock, DollarSign, Search, X, ArrowLeft, Edit2
} from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { BottomNav } from '@/components/BottomNav';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import LocationSearch from '@/components/LocationSearch';
import { TripMap } from '@/components/map/TripMap';
import { useTripStore } from '@/lib/store';
import { Activity, Trip, Day } from '@/lib/types';
import { DAY_COLORS } from '@/lib/map-colors';

const CATEGORY_ICONS: Record<string, typeof Map> = {
  flight: Plane,
  hotel: Hotel,
  restaurant: Utensils,
  attraction: Compass,
  activity: Compass,
  transport: Map,
  shopping: Compass,
  entertainment: Compass,
  other: Compass,
};

const CATEGORY_COLORS: Record<string, string> = {
  flight: '#9b3f25',
  hotel: '#5c614d',
  restaurant: '#735737',
  attraction: '#8e6f4e',
  activity: '#9b3f25',
  transport: '#5c614d',
  shopping: '#735737',
  entertainment: '#8e6f4e',
  other: '#9b3f25',
};

export default function TripDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params.tripId as string;

  const trips = useTripStore((state) => state.trips);
  const updateTrip = useTripStore((state) => state.updateTrip);
  const addActivity = useTripStore((state) => state.addActivity);
  const updateActivity = useTripStore((state) => state.updateActivity);
  const deleteActivity = useTripStore((state) => state.deleteActivity);
  const fetchTripsFromAPI = useTripStore((state) => state.fetchTripsFromAPI);
  const isInitialized = useTripStore((state) => state.isInitialized);

  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  const [showAddModal, setShowAddModal] = useState(false);
  const [newActivityName, setNewActivityName] = useState('');
  const [newActivityCategory, setNewActivityCategory] = useState('activity');
  const [newActivityTime, setNewActivityTime] = useState('');
  const [newActivityLocation, setNewActivityLocation] = useState<{ name: string; address: string; latitude?: number; longitude?: number } | undefined>();
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [editActivityName, setEditActivityName] = useState('');
  const [activeNav, setActiveNav] = useState('itinerary');
  const mountedRef = useRef(true);

  // Load trip data - API first, fallback to localStorage
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    const loadTrip = async () => {
      if (typeof window === 'undefined' || !mountedRef.current) return;

      // If store is not yet initialized, fetch from API
      if (!isInitialized) {
        await fetchTripsFromAPI();
      }

      // Find trip from store
      if (mountedRef.current) {
        const found = useTripStore.getState().trips.find(t => t.id === tripId);
        if (found) {
          setTrip(found);
          if (found.days?.length > 0) {
            setSelectedDay(found.days[0].id);
            setExpandedDays(new Set([found.days[0].id]));
          }
        }
        setLoading(false);
      }
    };

    loadTrip();
  }, [tripId, isInitialized, fetchTripsFromAPI]);

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

  const handleAddActivity = () => {
    if (!newActivityName.trim() || !selectedDay || !trip) return;

    const newActivity: Activity = {
      id: `activity-${Date.now()}`,
      title: newActivityName.trim(),
      category: newActivityCategory as Activity['category'],
      startTime: newActivityTime || undefined,
      order: trip.days.find(d => d.id === selectedDay)?.activities.length || 0,
      location: newActivityLocation?.latitude && newActivityLocation?.longitude
        ? {
            id: `location-${Date.now()}`,
            name: newActivityLocation.name,
            address: newActivityLocation.address,
            latitude: newActivityLocation.latitude,
            longitude: newActivityLocation.longitude,
          }
        : undefined,
    };

    addActivity(tripId, selectedDay, newActivity);

    // Update local state
    setTrip(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        days: prev.days.map(d =>
          d.id === selectedDay ? { ...d, activities: [...d.activities, newActivity] } : d
        ),
      };
    });

    setNewActivityName('');
    setNewActivityCategory('activity');
    setNewActivityTime('');
    setNewActivityLocation(undefined);
    setShowAddModal(false);
  };

  const handleDeleteActivity = (activityId: string) => {
    if (!selectedDay || !trip) return;

    deleteActivity(tripId, selectedDay, activityId);

    setTrip(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        days: prev.days.map(d =>
          d.id === selectedDay ? { ...d, activities: d.activities.filter(a => a.id !== activityId) } : d
        ),
      };
    });
  };

  const handleEditActivity = () => {
    if (!editingActivity || !editActivityName.trim() || !selectedDay || !trip) return;

    updateActivity(tripId, selectedDay, editingActivity.id, {
      title: editActivityName.trim(),
    });

    setTrip(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        days: prev.days.map(d =>
          d.id === selectedDay
            ? { ...d, activities: d.activities.map(a => a.id === editingActivity.id ? { ...a, title: editActivityName.trim() } : a) }
            : d
        ),
      };
    });

    setEditingActivity(null);
    setEditActivityName('');
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return `${startDate.toLocaleDateString('en-US', options)} - ${endDate.toLocaleDateString('en-US', { ...options, year: 'numeric' })}`;
  };

  const markers = useMemo(() => {
    if (!trip?.days) return [];
    return trip.days.flatMap((day, dayIndex) =>
      day.activities
        .filter(a => a.location?.latitude && a.location?.longitude)
        .map(a => ({
          id: a.id,
          position: [a.location!.latitude!, a.location!.longitude!] as [number, number],
          title: a.title,
          category: a.category,
          dayIndex,
          color: DAY_COLORS[dayIndex % DAY_COLORS.length],
        }))
    );
  }, [trip]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4faff] flex items-center justify-center">
        <p className="text-secondary">Loading...</p>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-[#f4faff] flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-serif text-2xl text-[#0e1d25] mb-4">Trip not found</h2>
          <Link href="/trips" className="text-[#9b3f25] font-medium hover:underline">
            ← Back to Trips
          </Link>
        </div>
      </div>
    );
  }

  const days = trip.days || [];
  const currentDay = days.find(d => d.id === selectedDay);

  return (
    <div className="min-h-screen bg-[#f4faff]">
      <Navigation />

      <div className="flex">
        {/* Side Navigation - Desktop */}
        <aside className="hidden lg:flex flex-col h-[calc(100vh-81px)] w-64 border-r border-[#ddc0b9]/20 sticky top-[81px] py-8 px-4 bg-white">
          <div className="mb-8 px-4">
            <h2 className="font-serif text-xl text-[#9b3f25] mb-1">The Wanderer</h2>
            <p className="text-xs text-secondary uppercase tracking-widest">Curated Journal</p>
          </div>

          <nav className="flex-1 space-y-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Compass },
              { id: 'itinerary', label: 'Itinerary', icon: Map },
              { id: 'flights', label: 'Flights', icon: Plane },
              { id: 'lodging', label: 'Lodging', icon: Hotel },
              { id: 'archive', label: 'Archive', icon: Archive },
            ].map(item => {
              const Icon = item.icon;
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveNav(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? 'bg-orange-50 text-[#9b3f25] font-bold border-r-4 border-[#9b3f25]'
                      : 'text-slate-600 hover:bg-slate-100 hover:translate-x-1'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <Link
            href="/trips/new"
            className="mx-4 mt-auto bg-gradient-to-br from-[#9b3f25] to-[#bb563b] text-white py-4 rounded-full font-semibold editorial-shadow flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <Plus className="w-5 h-5" />
            Start New Trip
          </Link>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden p-6 lg:p-12 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[#9b3f25] font-medium">
                <Calendar className="w-4 h-4" />
                <span>{formatDateRange(trip.startDate, trip.endDate)}</span>
              </div>
              <h1 className="font-serif text-5xl lg:text-6xl text-[#0e1d25] font-bold tracking-tight">
                {trip.name}
              </h1>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-6 py-3 bg-[#daebf5] text-[#0e1d25] rounded-full font-medium hover:bg-[#d5e5ef] transition-colors">
                <Share2 className="w-4 h-4" />
                Share
              </button>
              <button className="flex items-center gap-2 px-6 py-3 bg-[#daebf5] text-[#0e1d25] rounded-full font-medium hover:bg-[#d5e5ef] transition-colors">
                <Users className="w-4 h-4" />
                Collaborate
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Timeline */}
            <div className="lg:col-span-7 space-y-8">
              {days.map((day, index) => {
                const isExpanded = expandedDays.has(day.id);
                const dayNumber = String(index + 1).padStart(2, '0');

                return (
                  <section key={day.id}>
                    {/* Day Header */}
                    <div
                      className="flex items-center justify-between mb-6 cursor-pointer group"
                      onClick={() => toggleDay(day.id)}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                            isExpanded
                              ? 'bg-[#9b3f25] text-white'
                              : 'bg-[#d5e5ef] text-[#56423d]'
                          }`}
                        >
                          {dayNumber}
                        </div>
                        <div>
                          <h3 className="font-serif text-2xl font-bold text-[#0e1d25]">
                            {formatDate(day.date)}
                          </h3>
                          <p className="text-secondary text-sm">{day.location || trip.name}</p>
                        </div>
                      </div>
                      <ChevronRight
                        className={`w-6 h-6 text-slate-400 transition-transform ${
                          isExpanded ? 'rotate-90' : ''
                        }`}
                      />
                    </div>

                    {/* Day Activities */}
                    {isExpanded && (
                      <div className="space-y-6 ml-6 pl-10 border-l-2 border-[#ddc0b9]/30 pb-4">
                        {day.activities.length === 0 ? (
                          <p className="text-secondary text-sm italic">No activities planned</p>
                        ) : (
                          day.activities.map((activity, actIndex) => {
                            const Icon = CATEGORY_ICONS[activity.category] || Map;
                            const color = CATEGORY_COLORS[activity.category] || '#9b3f25';
                            const isLast = actIndex === day.activities.length - 1;

                            return (
                              <div key={activity.id} className="relative">
                                {/* Timeline dot */}
                                <div
                                  className="absolute -left-[53px] top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white border-2 flex items-center justify-center z-10"
                                  style={{ borderColor: color }}
                                >
                                  <Icon className="w-3 h-3" style={{ color }} />
                                </div>

                                {/* Activity card */}
                                <div className="relative bg-white rounded-xl p-6 editorial-shadow border border-[#ddc0b9]/10 group">
                                  <div className="flex items-start gap-4">
                                    {/* Drag handle */}
                                    <div className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 pt-1">
                                      <GripVertical className="w-5 h-5" />
                                    </div>

                                    <div className="flex-1">
                                      <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-2">
                                        <div>
                                          {activity.startTime && (
                                            <span className="text-[#9b3f25] font-bold text-sm">
                                              {activity.startTime}
                                            </span>
                                          )}
                                          <h4 className="font-bold text-lg text-[#0e1d25]">
                                            {activity.title}
                                          </h4>
                                        </div>
                                        <span
                                          className="px-3 py-1 rounded-full text-xs font-medium mt-2 md:mt-0"
                                          style={{
                                            backgroundColor: `${color}15`,
                                            color: color,
                                          }}
                                        >
                                          {activity.category}
                                        </span>
                                      </div>

                                      {activity.location?.name && (
                                        <p className="text-sm text-[#56423d] mt-1">
                                          📍 {activity.location.name}
                                        </p>
                                      )}

                                      {activity.notes && (
                                        <p className="text-sm text-[#56423d]/70 mt-2 leading-relaxed">
                                          {activity.notes}
                                        </p>
                                      )}
                                    </div>

                                    {/* Action buttons */}
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button
                                        onClick={() => {
                                          setEditingActivity(activity);
                                          setEditActivityName(activity.title);
                                        }}
                                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                      >
                                        <Edit2 className="w-4 h-4 text-slate-400" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteActivity(activity.id)}
                                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                                      >
                                        <X className="w-4 h-4 text-red-400" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}

                        {/* Add activity button */}
                        <button
                          onClick={() => {
                            setSelectedDay(day.id);
                            setShowAddModal(true);
                          }}
                          className="w-full py-3 border-2 border-dashed border-[#ddc0b9]/30 rounded-xl text-[#9b3f25] font-medium hover:bg-[#e7f6ff] transition-colors flex items-center justify-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Add Activity
                        </button>
                      </div>
                    )}
                  </section>
                );
              })}
            </div>

            {/* Sticky Map Panel */}
            <div className="lg:col-span-5 relative">
              <div className="sticky top-[105px] h-[calc(100vh-140px)] rounded-3xl overflow-hidden editorial-shadow border border-[#ddc0b9]/20">
                <TripMap markers={markers} className="w-full h-full" />

                {/* Map controls */}
                <div className="absolute bottom-6 right-6 flex flex-col gap-2">
                  <button className="w-12 h-12 bg-white/90 backdrop-blur-md rounded-xl editorial-shadow flex items-center justify-center hover:bg-white transition-colors">
                    <Plus className="w-5 h-5 text-slate-600" />
                  </button>
                  <button className="w-12 h-12 bg-white/90 backdrop-blur-md rounded-xl editorial-shadow flex items-center justify-center hover:bg-white transition-colors">
                    -
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* FAB */}
      <FloatingActionButton onClick={() => setShowAddModal(true)} label="Add Item" />

      {/* Add Activity Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-[#ccdce7]/60 backdrop-blur-sm"
            onClick={() => setShowAddModal(false)}
          />
          <div className="relative bg-white w-full max-w-lg rounded-xl shadow-[0_24px_48px_rgba(14,29,37,0.12)] p-8">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute right-4 top-4 p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>

            <h3 className="font-serif text-2xl font-bold text-[#0e1d25] mb-6">
              Add Activity
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block font-medium text-[#0e1d25] mb-2">Activity Name</label>
                <input
                  type="text"
                  value={newActivityName}
                  onChange={(e) => setNewActivityName(e.target.value)}
                  placeholder="e.g., Visit the Colosseum"
                  className="w-full px-4 py-3 bg-[#e7f6ff] border-none rounded-lg focus:ring-2 focus:ring-[#9b3f25] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block font-medium text-[#0e1d25] mb-2">Category</label>
                <select
                  value={newActivityCategory}
                  onChange={(e) => setNewActivityCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-[#e7f6ff] border-none rounded-lg focus:ring-2 focus:ring-[#9b3f25] focus:bg-white transition-all"
                >
                  <option value="activity">Activity</option>
                  <option value="attraction">Attraction</option>
                  <option value="restaurant">Restaurant</option>
                  <option value="hotel">Hotel</option>
                  <option value="flight">Flight</option>
                  <option value="transport">Transport</option>
                  <option value="shopping">Shopping</option>
                  <option value="entertainment">Entertainment</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-[#0e1d25] mb-2">Time (optional)</label>
                <input
                  type="time"
                  value={newActivityTime}
                  onChange={(e) => setNewActivityTime(e.target.value)}
                  className="w-full px-4 py-3 bg-[#e7f6ff] border-none rounded-lg focus:ring-2 focus:ring-[#9b3f25] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block font-medium text-[#0e1d25] mb-2">Location (optional)</label>
                <LocationSearch
                  value={newActivityLocation}
                  onChange={setNewActivityLocation}
                  placeholder="Search for a location..."
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-6 py-4 border-2 border-[#ddc0b9]/50 text-[#9b3f25] rounded-full font-bold hover:bg-[#9b3f25]/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddActivity}
                  disabled={!newActivityName.trim()}
                  className="flex-1 px-6 py-4 bg-gradient-to-br from-[#9b3f25] to-[#bb563b] text-white rounded-full font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Add Activity
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Activity Modal */}
      {editingActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-[#ccdce7]/60 backdrop-blur-sm"
            onClick={() => setEditingActivity(null)}
          />
          <div className="relative bg-white w-full max-w-lg rounded-xl shadow-[0_24px_48px_rgba(14,29,37,0.12)] p-8">
            <button
              onClick={() => setEditingActivity(null)}
              className="absolute right-4 top-4 p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>

            <h3 className="font-serif text-2xl font-bold text-[#0e1d25] mb-6">
              Edit Activity
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block font-medium text-[#0e1d25] mb-2">Activity Name</label>
                <input
                  type="text"
                  value={editActivityName}
                  onChange={(e) => setEditActivityName(e.target.value)}
                  className="w-full px-4 py-3 bg-[#e7f6ff] border-none rounded-lg focus:ring-2 focus:ring-[#9b3f25] focus:bg-white transition-all"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setEditingActivity(null)}
                  className="flex-1 px-6 py-4 border-2 border-[#ddc0b9]/50 text-[#9b3f25] rounded-full font-bold hover:bg-[#9b3f25]/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditActivity}
                  disabled={!editActivityName.trim()}
                  className="flex-1 px-6 py-4 bg-gradient-to-br from-[#9b3f25] to-[#bb563b] text-white rounded-full font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomNav />

      <OfflineIndicator />
    </div>
  );
}
