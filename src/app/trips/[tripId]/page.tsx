'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Calendar, Map, Plane, Utensils, Compass, Archive, Plus, ChevronRight,
  GripVertical, Share2, Users, Clock, DollarSign, Search, X, ArrowLeft, Edit2,
  Settings, Trash2, Hotel as HotelIcon
} from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { BottomNav } from '@/components/BottomNav';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import LocationSearch from '@/components/LocationSearch';
import { TripMap } from '@/components/map/TripMap';
import { useTripStore } from '@/lib/store';
import { Activity, Trip, Day, Flight, Hotel } from '@/lib/types';
import { DAY_COLORS } from '@/lib/map-colors';

const CATEGORY_ICONS: Record<string, typeof Map> = {
  flight: Plane,
  hotel: HotelIcon,
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
  const deleteTrip = useTripStore((state) => state.deleteTrip);
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
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [editActivityName, setEditActivityName] = useState('');
  const [editActivityCategory, setEditActivityCategory] = useState('');
  const [editActivityTime, setEditActivityTime] = useState('');
  const [editActivityLocation, setEditActivityLocation] = useState<{ name: string; address: string; latitude?: number; longitude?: number } | undefined>();
  const [editActivityNotes, setEditActivityNotes] = useState('');
  const [activeNav, setActiveNav] = useState('itinerary');
  const mountedRef = useRef(true);

  // Flight state
  const [showFlightModal, setShowFlightModal] = useState(false);
  const [editingFlight, setEditingFlight] = useState<Flight | null>(null);
  const [flightForm, setFlightForm] = useState({
    airline: '',
    flightNumber: '',
    departureAirport: '',
    departureCity: '',
    departureTime: '',
    arrivalAirport: '',
    arrivalCity: '',
    arrivalTime: '',
    confirmationNumber: '',
    terminal: '',
    gate: '',
    seat: '',
    notes: '',
    cost: '',
    currency: 'USD',
  });

  // Hotel state
  const [showHotelModal, setShowHotelModal] = useState(false);
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);
  const [hotelForm, setHotelForm] = useState({
    name: '',
    address: '',
    latitude: '',
    longitude: '',
    checkInDate: '',
    checkInTime: '',
    checkOutDate: '',
    checkOutTime: '',
    confirmationNumber: '',
    phone: '',
    email: '',
    website: '',
    notes: '',
    cost: '',
    currency: 'USD',
    roomType: '',
  });

  const addFlight = useTripStore((state) => state.addFlight);
  const updateFlight = useTripStore((state) => state.updateFlight);
  const deleteFlight = useTripStore((state) => state.deleteFlight);
  const addHotel = useTripStore((state) => state.addHotel);
  const updateHotel = useTripStore((state) => state.updateHotel);
  const deleteHotel = useTripStore((state) => state.deleteHotel);

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

  const handleDeleteTrip = () => {
    if (!trip) return;
    deleteTrip(trip.id);
    router.push('/trips');
  };

  const handleEditActivity = () => {
    if (!editingActivity || !editActivityName.trim() || !selectedDay || !trip) return;

    updateActivity(tripId, selectedDay, editingActivity.id, {
      title: editActivityName.trim(),
      category: editActivityCategory as Activity['category'],
      startTime: editActivityTime || undefined,
      location: editActivityLocation?.latitude && editActivityLocation?.longitude
        ? { id: editingActivity.location?.id || '', ...editActivityLocation }
        : undefined,
      notes: editActivityNotes || undefined,
    });

    setTrip(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        days: prev.days.map(d =>
          d.id === selectedDay
            ? {
                ...d,
                activities: d.activities.map(a =>
                  a.id === editingActivity.id
                    ? {
                        ...a,
                        title: editActivityName.trim(),
                        category: editActivityCategory as Activity['category'],
                        startTime: editActivityTime || undefined,
                        location: editActivityLocation?.latitude && editActivityLocation?.longitude
                          ? { id: a.location?.id || '', ...editActivityLocation }
                          : undefined,
                        notes: editActivityNotes || undefined,
                      }
                    : a
                )
              }
            : d
        ),
      };
    });

    setEditingActivity(null);
    setEditActivityName('');
    setEditActivityCategory('');
    setEditActivityTime('');
    setEditActivityLocation(undefined);
    setEditActivityNotes('');
  };

  // Flight handlers
  const handleAddFlight = () => {
    if (!flightForm.airline || !flightForm.flightNumber || !flightForm.departureAirport || !flightForm.arrivalAirport) return;

    const newFlight: Flight = {
      id: `flight-${Date.now()}`,
      airline: flightForm.airline,
      flightNumber: flightForm.flightNumber,
      departureAirport: flightForm.departureAirport,
      departureCity: flightForm.departureCity,
      departureTime: flightForm.departureTime,
      arrivalAirport: flightForm.arrivalAirport,
      arrivalCity: flightForm.arrivalCity,
      arrivalTime: flightForm.arrivalTime,
      confirmationNumber: flightForm.confirmationNumber || undefined,
      terminal: flightForm.terminal || undefined,
      gate: flightForm.gate || undefined,
      seat: flightForm.seat || undefined,
      notes: flightForm.notes || undefined,
      cost: flightForm.cost ? parseFloat(flightForm.cost) : undefined,
      currency: flightForm.currency,
    };

    addFlight(tripId, newFlight);
    setTrip(prev => prev ? { ...prev, flights: [...prev.flights, newFlight] } : prev);
    setShowFlightModal(false);
    setFlightForm({
      airline: '',
      flightNumber: '',
      departureAirport: '',
      departureCity: '',
      departureTime: '',
      arrivalAirport: '',
      arrivalCity: '',
      arrivalTime: '',
      confirmationNumber: '',
      terminal: '',
      gate: '',
      seat: '',
      notes: '',
      cost: '',
      currency: 'USD',
    });
  };

  const handleEditFlight = () => {
    if (!editingFlight || !flightForm.airline || !flightForm.flightNumber) return;

    updateFlight(tripId, editingFlight.id, {
      airline: flightForm.airline,
      flightNumber: flightForm.flightNumber,
      departureAirport: flightForm.departureAirport,
      departureCity: flightForm.departureCity,
      departureTime: flightForm.departureTime,
      arrivalAirport: flightForm.arrivalAirport,
      arrivalCity: flightForm.arrivalCity,
      arrivalTime: flightForm.arrivalTime,
      confirmationNumber: flightForm.confirmationNumber || undefined,
      terminal: flightForm.terminal || undefined,
      gate: flightForm.gate || undefined,
      seat: flightForm.seat || undefined,
      notes: flightForm.notes || undefined,
      cost: flightForm.cost ? parseFloat(flightForm.cost) : undefined,
      currency: flightForm.currency,
    });

    setTrip(prev => prev ? {
      ...prev,
      flights: prev.flights.map(f => f.id === editingFlight.id ? { ...f,
        airline: flightForm.airline,
        flightNumber: flightForm.flightNumber,
        departureAirport: flightForm.departureAirport,
        departureCity: flightForm.departureCity,
        departureTime: flightForm.departureTime,
        arrivalAirport: flightForm.arrivalAirport,
        arrivalCity: flightForm.arrivalCity,
        arrivalTime: flightForm.arrivalTime,
        confirmationNumber: flightForm.confirmationNumber || undefined,
        terminal: flightForm.terminal || undefined,
        gate: flightForm.gate || undefined,
        seat: flightForm.seat || undefined,
        notes: flightForm.notes || undefined,
        cost: flightForm.cost ? parseFloat(flightForm.cost) : undefined,
        currency: flightForm.currency,
      } : f)
    } : prev);

    setEditingFlight(null);
    setShowFlightModal(false);
    setFlightForm({
      airline: '',
      flightNumber: '',
      departureAirport: '',
      departureCity: '',
      departureTime: '',
      arrivalAirport: '',
      arrivalCity: '',
      arrivalTime: '',
      confirmationNumber: '',
      terminal: '',
      gate: '',
      seat: '',
      notes: '',
      cost: '',
      currency: 'USD',
    });
  };

  const handleDeleteFlight = (flightId: string) => {
    deleteFlight(tripId, flightId);
    setTrip(prev => prev ? { ...prev, flights: prev.flights.filter(f => f.id !== flightId) } : prev);
  };

  const openEditFlight = (flight: Flight) => {
    setEditingFlight(flight);
    setFlightForm({
      airline: flight.airline,
      flightNumber: flight.flightNumber,
      departureAirport: flight.departureAirport,
      departureCity: flight.departureCity,
      departureTime: flight.departureTime,
      arrivalAirport: flight.arrivalAirport,
      arrivalCity: flight.arrivalCity,
      arrivalTime: flight.arrivalTime,
      confirmationNumber: flight.confirmationNumber || '',
      terminal: flight.terminal || '',
      gate: flight.gate || '',
      seat: flight.seat || '',
      notes: flight.notes || '',
      cost: flight.cost?.toString() || '',
      currency: flight.currency || 'USD',
    });
    setShowFlightModal(true);
  };

  // Hotel handlers
  const handleAddHotel = () => {
    if (!hotelForm.name || !hotelForm.address || !hotelForm.checkInDate || !hotelForm.checkOutDate) return;

    const newHotel: Hotel = {
      id: `hotel-${Date.now()}`,
      name: hotelForm.name,
      address: hotelForm.address,
      latitude: hotelForm.latitude ? parseFloat(hotelForm.latitude) : undefined,
      longitude: hotelForm.longitude ? parseFloat(hotelForm.longitude) : undefined,
      checkInDate: hotelForm.checkInDate,
      checkInTime: hotelForm.checkInTime || undefined,
      checkOutDate: hotelForm.checkOutDate,
      checkOutTime: hotelForm.checkOutTime || undefined,
      confirmationNumber: hotelForm.confirmationNumber || undefined,
      phone: hotelForm.phone || undefined,
      email: hotelForm.email || undefined,
      website: hotelForm.website || undefined,
      notes: hotelForm.notes || undefined,
      cost: hotelForm.cost ? parseFloat(hotelForm.cost) : undefined,
      currency: hotelForm.currency,
      roomType: hotelForm.roomType || undefined,
    };

    addHotel(tripId, newHotel);
    setTrip(prev => prev ? { ...prev, hotels: [...prev.hotels, newHotel] } : prev);
    setShowHotelModal(false);
    setHotelForm({
      name: '',
      address: '',
      latitude: '',
      longitude: '',
      checkInDate: '',
      checkInTime: '',
      checkOutDate: '',
      checkOutTime: '',
      confirmationNumber: '',
      phone: '',
      email: '',
      website: '',
      notes: '',
      cost: '',
      currency: 'USD',
      roomType: '',
    });
  };

  const handleEditHotel = () => {
    if (!editingHotel || !hotelForm.name || !hotelForm.address) return;

    updateHotel(tripId, editingHotel.id, {
      name: hotelForm.name,
      address: hotelForm.address,
      latitude: hotelForm.latitude ? parseFloat(hotelForm.latitude) : undefined,
      longitude: hotelForm.longitude ? parseFloat(hotelForm.longitude) : undefined,
      checkInDate: hotelForm.checkInDate,
      checkInTime: hotelForm.checkInTime || undefined,
      checkOutDate: hotelForm.checkOutDate,
      checkOutTime: hotelForm.checkOutTime || undefined,
      confirmationNumber: hotelForm.confirmationNumber || undefined,
      phone: hotelForm.phone || undefined,
      email: hotelForm.email || undefined,
      website: hotelForm.website || undefined,
      notes: hotelForm.notes || undefined,
      cost: hotelForm.cost ? parseFloat(hotelForm.cost) : undefined,
      currency: hotelForm.currency,
      roomType: hotelForm.roomType || undefined,
    });

    setTrip(prev => prev ? {
      ...prev,
      hotels: prev.hotels.map(h => h.id === editingHotel.id ? { ...h,
        name: hotelForm.name,
        address: hotelForm.address,
        latitude: hotelForm.latitude ? parseFloat(hotelForm.latitude) : undefined,
        longitude: hotelForm.longitude ? parseFloat(hotelForm.longitude) : undefined,
        checkInDate: hotelForm.checkInDate,
        checkInTime: hotelForm.checkInTime || undefined,
        checkOutDate: hotelForm.checkOutDate,
        checkOutTime: hotelForm.checkOutTime || undefined,
        confirmationNumber: hotelForm.confirmationNumber || undefined,
        phone: hotelForm.phone || undefined,
        email: hotelForm.email || undefined,
        website: hotelForm.website || undefined,
        notes: hotelForm.notes || undefined,
        cost: hotelForm.cost ? parseFloat(hotelForm.cost) : undefined,
        currency: hotelForm.currency,
        roomType: hotelForm.roomType || undefined,
      } : h)
    } : prev);

    setEditingHotel(null);
    setShowHotelModal(false);
    setHotelForm({
      name: '',
      address: '',
      latitude: '',
      longitude: '',
      checkInDate: '',
      checkInTime: '',
      checkOutDate: '',
      checkOutTime: '',
      confirmationNumber: '',
      phone: '',
      email: '',
      website: '',
      notes: '',
      cost: '',
      currency: 'USD',
      roomType: '',
    });
  };

  const handleDeleteHotel = (hotelId: string) => {
    deleteHotel(tripId, hotelId);
    setTrip(prev => prev ? { ...prev, hotels: prev.hotels.filter(h => h.id !== hotelId) } : prev);
  };

  const openEditHotel = (hotel: Hotel) => {
    setEditingHotel(hotel);
    setHotelForm({
      name: hotel.name,
      address: hotel.address,
      latitude: hotel.latitude?.toString() || '',
      longitude: hotel.longitude?.toString() || '',
      checkInDate: hotel.checkInDate,
      checkInTime: hotel.checkInTime || '',
      checkOutDate: hotel.checkOutDate,
      checkOutTime: hotel.checkOutTime || '',
      confirmationNumber: hotel.confirmationNumber || '',
      phone: hotel.phone || '',
      email: hotel.email || '',
      website: hotel.website || '',
      notes: hotel.notes || '',
      cost: hotel.cost?.toString() || '',
      currency: hotel.currency || 'USD',
      roomType: hotel.roomType || '',
    });
    setShowHotelModal(true);
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
              { id: 'lodging', label: 'Lodging', icon: HotelIcon },
              { id: 'archive', label: 'Archive', icon: Archive },
              { id: 'settings', label: 'Settings', icon: Settings },
            ].map(item => {
              const Icon = item.icon;
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === 'settings') {
                      setShowSettingsModal(true);
                    } else {
                      setActiveNav(item.id);
                    }
                  }}
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
            {/* Itinerary / Timeline View */}
            {(activeNav === 'itinerary' || activeNav === 'dashboard') && (
              <>
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
                                              setEditActivityCategory(activity.category);
                                              setEditActivityTime(activity.startTime || '');
                                              setEditActivityLocation(activity.location);
                                              setEditActivityNotes(activity.notes || '');
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
              </>
            )}

            {/* Flights View */}
            {activeNav === 'flights' && (
              <div className="lg:col-span-12">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="font-serif text-3xl font-bold text-[#0e1d25]">Flights</h2>
                    <p className="text-secondary mt-1">Manage your flight bookings</p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingFlight(null);
                      setFlightForm({
                        airline: '',
                        flightNumber: '',
                        departureAirport: '',
                        departureCity: '',
                        departureTime: '',
                        arrivalAirport: '',
                        arrivalCity: '',
                        arrivalTime: '',
                        confirmationNumber: '',
                        terminal: '',
                        gate: '',
                        seat: '',
                        notes: '',
                        cost: '',
                        currency: 'USD',
                      });
                      setShowFlightModal(true);
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-[#9b3f25] to-[#bb563b] text-white rounded-full font-bold shadow-lg hover:shadow-xl transition-all"
                  >
                    <Plus className="w-5 h-5" />
                    Add Flight
                  </button>
                </div>

                {trip.flights && trip.flights.length > 0 ? (
                  <div className="space-y-4">
                    {trip.flights.map((flight) => (
                      <div key={flight.id} className="bg-white rounded-xl p-6 editorial-shadow border border-[#ddc0b9]/10">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-10 h-10 rounded-full bg-[#9b3f25]/10 flex items-center justify-center">
                                <Plane className="w-5 h-5 text-[#9b3f25]" />
                              </div>
                              <div>
                                <h4 className="font-bold text-lg text-[#0e1d25]">
                                  {flight.airline} {flight.flightNumber}
                                </h4>
                                {flight.confirmationNumber && (
                                  <p className="text-sm text-secondary">Confirmation: {flight.confirmationNumber}</p>
                                )}
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 mt-4">
                              <div>
                                <p className="text-xs text-secondary uppercase tracking-wider">Departure</p>
                                <p className="font-bold text-[#0e1d25]">{flight.departureAirport}</p>
                                <p className="text-sm text-secondary">{flight.departureCity}</p>
                                <p className="text-sm text-[#9b3f25] font-medium">
                                  {new Date(flight.departureTime).toLocaleString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: 'numeric',
                                    minute: '2-digit',
                                  })}
                                </p>
                              </div>
                              <div className="flex items-center justify-center">
                                <div className="w-full border-t-2 border-dashed border-[#ddc0b9]/30 relative">
                                  <Plane className="w-4 h-4 text-[#9b3f25] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-1" />
                                </div>
                              </div>
                              <div>
                                <p className="text-xs text-secondary uppercase tracking-wider">Arrival</p>
                                <p className="font-bold text-[#0e1d25]">{flight.arrivalAirport}</p>
                                <p className="text-sm text-secondary">{flight.arrivalCity}</p>
                                <p className="text-sm text-[#9b3f25] font-medium">
                                  {new Date(flight.arrivalTime).toLocaleString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: 'numeric',
                                    minute: '2-digit',
                                  })}
                                </p>
                              </div>
                            </div>

                            {(flight.terminal || flight.gate || flight.seat) && (
                              <div className="flex gap-4 mt-4 pt-4 border-t border-[#ddc0b9]/10">
                                {flight.terminal && (
                                  <div>
                                    <p className="text-xs text-secondary">Terminal</p>
                                    <p className="font-medium text-[#0e1d25]">{flight.terminal}</p>
                                  </div>
                                )}
                                {flight.gate && (
                                  <div>
                                    <p className="text-xs text-secondary">Gate</p>
                                    <p className="font-medium text-[#0e1d25]">{flight.gate}</p>
                                  </div>
                                )}
                                {flight.seat && (
                                  <div>
                                    <p className="text-xs text-secondary">Seat</p>
                                    <p className="font-medium text-[#0e1d25]">{flight.seat}</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => openEditFlight(flight)}
                              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                              <Edit2 className="w-4 h-4 text-slate-400" />
                            </button>
                            <button
                              onClick={() => handleDeleteFlight(flight.id)}
                              className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-white rounded-xl editorial-shadow border border-[#ddc0b9]/10">
                    <Plane className="w-12 h-12 text-[#ddc0b9] mx-auto mb-4" />
                    <h3 className="font-serif text-xl text-[#0e1d25] mb-2">No flights added</h3>
                    <p className="text-secondary mb-6">Add your flight details to keep everything organized</p>
                    <button
                      onClick={() => {
                        setEditingFlight(null);
                        setShowFlightModal(true);
                      }}
                      className="px-6 py-3 bg-gradient-to-br from-[#9b3f25] to-[#bb563b] text-white rounded-full font-bold shadow-lg inline-flex items-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      Add Your First Flight
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Lodging View */}
            {activeNav === 'lodging' && (
              <div className="lg:col-span-12">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="font-serif text-3xl font-bold text-[#0e1d25]">Lodging</h2>
                    <p className="text-secondary mt-1">Manage your accommodation bookings</p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingHotel(null);
                      setHotelForm({
                        name: '',
                        address: '',
                        latitude: '',
                        longitude: '',
                        checkInDate: '',
                        checkInTime: '',
                        checkOutDate: '',
                        checkOutTime: '',
                        confirmationNumber: '',
                        phone: '',
                        email: '',
                        website: '',
                        notes: '',
                        cost: '',
                        currency: 'USD',
                        roomType: '',
                      });
                      setShowHotelModal(true);
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-[#9b3f25] to-[#bb563b] text-white rounded-full font-bold shadow-lg hover:shadow-xl transition-all"
                  >
                    <Plus className="w-5 h-5" />
                    Add Hotel
                  </button>
                </div>

                {trip.hotels && trip.hotels.length > 0 ? (
                  <div className="space-y-4">
                    {trip.hotels.map((hotel) => (
                      <div key={hotel.id} className="bg-white rounded-xl p-6 editorial-shadow border border-[#ddc0b9]/10">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-10 h-10 rounded-full bg-[#5c614d]/10 flex items-center justify-center">
                                <HotelIcon className="w-5 h-5 text-[#5c614d]" />
                              </div>
                              <div>
                                <h4 className="font-bold text-lg text-[#0e1d25]">{hotel.name}</h4>
                                {hotel.confirmationNumber && (
                                  <p className="text-sm text-secondary">Confirmation: {hotel.confirmationNumber}</p>
                                )}
                              </div>
                            </div>

                            <p className="text-sm text-secondary mb-3">📍 {hotel.address}</p>

                            <div className="grid grid-cols-2 gap-4 mt-4">
                              <div>
                                <p className="text-xs text-secondary uppercase tracking-wider">Check-in</p>
                                <p className="font-medium text-[#0e1d25]">
                                  {new Date(hotel.checkInDate).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                  })}
                                </p>
                                {hotel.checkInTime && (
                                  <p className="text-sm text-[#5c614d] font-medium">{hotel.checkInTime}</p>
                                )}
                              </div>
                              <div>
                                <p className="text-xs text-secondary uppercase tracking-wider">Check-out</p>
                                <p className="font-medium text-[#0e1d25]">
                                  {new Date(hotel.checkOutDate).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                  })}
                                </p>
                                {hotel.checkOutTime && (
                                  <p className="text-sm text-[#5c614d] font-medium">{hotel.checkOutTime}</p>
                                )}
                              </div>
                            </div>

                            {hotel.roomType && (
                              <div className="mt-3 pt-3 border-t border-[#ddc0b9]/10">
                                <p className="text-xs text-secondary">Room Type</p>
                                <p className="font-medium text-[#0e1d25]">{hotel.roomType}</p>
                              </div>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => openEditHotel(hotel)}
                              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                              <Edit2 className="w-4 h-4 text-slate-400" />
                            </button>
                            <button
                              onClick={() => handleDeleteHotel(hotel.id)}
                              className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-white rounded-xl editorial-shadow border border-[#ddc0b9]/10">
                    <HotelIcon className="w-12 h-12 text-[#ddc0b9] mx-auto mb-4" />
                    <h3 className="font-serif text-xl text-[#0e1d25] mb-2">No hotels added</h3>
                    <p className="text-secondary mb-6">Add your accommodation details to keep everything organized</p>
                    <button
                      onClick={() => {
                        setEditingHotel(null);
                        setShowHotelModal(true);
                      }}
                      className="px-6 py-3 bg-gradient-to-br from-[#9b3f25] to-[#bb563b] text-white rounded-full font-bold shadow-lg inline-flex items-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      Add Your First Hotel
                    </button>
                  </div>
                )}
              </div>
            )}
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
          <div className="relative bg-white w-full max-w-lg rounded-xl shadow-[0_24px_48px_rgba(14,29,37,0.12)] p-8 max-h-[90vh] overflow-y-auto">
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

              <div>
                <label className="block font-medium text-[#0e1d25] mb-2">Category</label>
                <select
                  value={editActivityCategory}
                  onChange={(e) => setEditActivityCategory(e.target.value)}
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
                  value={editActivityTime}
                  onChange={(e) => setEditActivityTime(e.target.value)}
                  className="w-full px-4 py-3 bg-[#e7f6ff] border-none rounded-lg focus:ring-2 focus:ring-[#9b3f25] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block font-medium text-[#0e1d25] mb-2">Location (optional)</label>
                <LocationSearch
                  value={editActivityLocation}
                  onChange={setEditActivityLocation}
                  placeholder="Search for a location..."
                />
              </div>

              <div>
                <label className="block font-medium text-[#0e1d25] mb-2">Notes (optional)</label>
                <textarea
                  value={editActivityNotes}
                  onChange={(e) => setEditActivityNotes(e.target.value)}
                  rows={3}
                  placeholder="Add any notes about this activity..."
                  className="w-full px-4 py-3 bg-[#e7f6ff] border-none rounded-lg focus:ring-2 focus:ring-[#9b3f25] focus:bg-white transition-all resize-none"
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

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-[#ccdce7]/60 backdrop-blur-sm"
            onClick={() => setShowSettingsModal(false)}
          />
          <div className="relative bg-white w-full max-w-md rounded-xl shadow-[0_24px_48px_rgba(14,29,37,0.12)] p-8">
            <button
              onClick={() => setShowSettingsModal(false)}
              className="absolute right-4 top-4 p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>

            <h3 className="font-serif text-2xl font-bold text-[#0e1d25] mb-6">
              Trip Settings
            </h3>

            <div className="space-y-4">
              <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                <div className="flex items-center gap-3 mb-2">
                  <Trash2 className="w-5 h-5 text-red-500" />
                  <span className="font-bold text-red-700">Delete Trip</span>
                </div>
                <p className="text-sm text-red-600/80 mb-3">
                  This action cannot be undone. All activities, flights, and hotels will be permanently deleted.
                </p>
                <button
                  onClick={handleDeleteTrip}
                  className="w-full px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
                >
                  Delete {trip?.name}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Flight Modal */}
      {showFlightModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-[#ccdce7]/60 backdrop-blur-sm"
            onClick={() => setShowFlightModal(false)}
          />
          <div className="relative bg-white w-full max-w-lg rounded-xl shadow-[0_24px_48px_rgba(14,29,37,0.12)] p-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowFlightModal(false)}
              className="absolute right-4 top-4 p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>

            <h3 className="font-serif text-2xl font-bold text-[#0e1d25] mb-6">
              {editingFlight ? 'Edit Flight' : 'Add Flight'}
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-[#0e1d25] mb-2">Airline *</label>
                  <input
                    type="text"
                    value={flightForm.airline}
                    onChange={(e) => setFlightForm({ ...flightForm, airline: e.target.value })}
                    placeholder="e.g., United"
                    className="w-full px-4 py-3 bg-[#e7f6ff] border-none rounded-lg focus:ring-2 focus:ring-[#9b3f25] focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#0e1d25] mb-2">Flight Number *</label>
                  <input
                    type="text"
                    value={flightForm.flightNumber}
                    onChange={(e) => setFlightForm({ ...flightForm, flightNumber: e.target.value })}
                    placeholder="e.g., UA123"
                    className="w-full px-4 py-3 bg-[#e7f6ff] border-none rounded-lg focus:ring-2 focus:ring-[#9b3f25] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-[#0e1d25] mb-2">Departure Airport *</label>
                  <input
                    type="text"
                    value={flightForm.departureAirport}
                    onChange={(e) => setFlightForm({ ...flightForm, departureAirport: e.target.value })}
                    placeholder="e.g., SFO"
                    className="w-full px-4 py-3 bg-[#e7f6ff] border-none rounded-lg focus:ring-2 focus:ring-[#9b3f25] focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#0e1d25] mb-2">Departure City</label>
                  <input
                    type="text"
                    value={flightForm.departureCity}
                    onChange={(e) => setFlightForm({ ...flightForm, departureCity: e.target.value })}
                    placeholder="e.g., San Francisco"
                    className="w-full px-4 py-3 bg-[#e7f6ff] border-none rounded-lg focus:ring-2 focus:ring-[#9b3f25] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-[#0e1d25] mb-2">Departure Time *</label>
                <input
                  type="datetime-local"
                  value={flightForm.departureTime}
                  onChange={(e) => setFlightForm({ ...flightForm, departureTime: e.target.value })}
                  className="w-full px-4 py-3 bg-[#e7f6ff] border-none rounded-lg focus:ring-2 focus:ring-[#9b3f25] focus:bg-white transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-[#0e1d25] mb-2">Arrival Airport *</label>
                  <input
                    type="text"
                    value={flightForm.arrivalAirport}
                    onChange={(e) => setFlightForm({ ...flightForm, arrivalAirport: e.target.value })}
                    placeholder="e.g., JFK"
                    className="w-full px-4 py-3 bg-[#e7f6ff] border-none rounded-lg focus:ring-2 focus:ring-[#9b3f25] focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#0e1d25] mb-2">Arrival City</label>
                  <input
                    type="text"
                    value={flightForm.arrivalCity}
                    onChange={(e) => setFlightForm({ ...flightForm, arrivalCity: e.target.value })}
                    placeholder="e.g., New York"
                    className="w-full px-4 py-3 bg-[#e7f6ff] border-none rounded-lg focus:ring-2 focus:ring-[#9b3f25] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-[#0e1d25] mb-2">Arrival Time *</label>
                <input
                  type="datetime-local"
                  value={flightForm.arrivalTime}
                  onChange={(e) => setFlightForm({ ...flightForm, arrivalTime: e.target.value })}
                  className="w-full px-4 py-3 bg-[#e7f6ff] border-none rounded-lg focus:ring-2 focus:ring-[#9b3f25] focus:bg-white transition-all"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block font-medium text-[#0e1d25] mb-2">Terminal</label>
                  <input
                    type="text"
                    value={flightForm.terminal}
                    onChange={(e) => setFlightForm({ ...flightForm, terminal: e.target.value })}
                    placeholder="e.g., 1"
                    className="w-full px-4 py-3 bg-[#e7f6ff] border-none rounded-lg focus:ring-2 focus:ring-[#9b3f25] focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#0e1d25] mb-2">Gate</label>
                  <input
                    type="text"
                    value={flightForm.gate}
                    onChange={(e) => setFlightForm({ ...flightForm, gate: e.target.value })}
                    placeholder="e.g., A12"
                    className="w-full px-4 py-3 bg-[#e7f6ff] border-none rounded-lg focus:ring-2 focus:ring-[#9b3f25] focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#0e1d25] mb-2">Seat</label>
                  <input
                    type="text"
                    value={flightForm.seat}
                    onChange={(e) => setFlightForm({ ...flightForm, seat: e.target.value })}
                    placeholder="e.g., 12A"
                    className="w-full px-4 py-3 bg-[#e7f6ff] border-none rounded-lg focus:ring-2 focus:ring-[#9b3f25] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-[#0e1d25] mb-2">Confirmation Number</label>
                <input
                  type="text"
                  value={flightForm.confirmationNumber}
                  onChange={(e) => setFlightForm({ ...flightForm, confirmationNumber: e.target.value })}
                  placeholder="e.g., ABC123"
                  className="w-full px-4 py-3 bg-[#e7f6ff] border-none rounded-lg focus:ring-2 focus:ring-[#9b3f25] focus:bg-white transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-[#0e1d25] mb-2">Cost</label>
                  <input
                    type="number"
                    value={flightForm.cost}
                    onChange={(e) => setFlightForm({ ...flightForm, cost: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-4 py-3 bg-[#e7f6ff] border-none rounded-lg focus:ring-2 focus:ring-[#9b3f25] focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#0e1d25] mb-2">Currency</label>
                  <select
                    value={flightForm.currency}
                    onChange={(e) => setFlightForm({ ...flightForm, currency: e.target.value })}
                    className="w-full px-4 py-3 bg-[#e7f6ff] border-none rounded-lg focus:ring-2 focus:ring-[#9b3f25] focus:bg-white transition-all"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="JPY">JPY</option>
                    <option value="CAD">CAD</option>
                    <option value="AUD">AUD</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-[#0e1d25] mb-2">Notes</label>
                <textarea
                  value={flightForm.notes}
                  onChange={(e) => setFlightForm({ ...flightForm, notes: e.target.value })}
                  rows={2}
                  placeholder="Any additional notes..."
                  className="w-full px-4 py-3 bg-[#e7f6ff] border-none rounded-lg focus:ring-2 focus:ring-[#9b3f25] focus:bg-white transition-all resize-none"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setShowFlightModal(false)}
                  className="flex-1 px-6 py-4 border-2 border-[#ddc0b9]/50 text-[#9b3f25] rounded-full font-bold hover:bg-[#9b3f25]/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={editingFlight ? handleEditFlight : handleAddFlight}
                  disabled={!flightForm.airline || !flightForm.flightNumber || !flightForm.departureAirport || !flightForm.arrivalAirport || !flightForm.departureTime || !flightForm.arrivalTime}
                  className="flex-1 px-6 py-4 bg-gradient-to-br from-[#9b3f25] to-[#bb563b] text-white rounded-full font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {editingFlight ? 'Save Changes' : 'Add Flight'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hotel Modal */}
      {showHotelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-[#ccdce7]/60 backdrop-blur-sm"
            onClick={() => setShowHotelModal(false)}
          />
          <div className="relative bg-white w-full max-w-lg rounded-xl shadow-[0_24px_48px_rgba(14,29,37,0.12)] p-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowHotelModal(false)}
              className="absolute right-4 top-4 p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>

            <h3 className="font-serif text-2xl font-bold text-[#0e1d25] mb-6">
              {editingHotel ? 'Edit Hotel' : 'Add Hotel'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block font-medium text-[#0e1d25] mb-2">Hotel Name *</label>
                <input
                  type="text"
                  value={hotelForm.name}
                  onChange={(e) => setHotelForm({ ...hotelForm, name: e.target.value })}
                  placeholder="e.g., Marriott Times Square"
                  className="w-full px-4 py-3 bg-[#e7f6ff] border-none rounded-lg focus:ring-2 focus:ring-[#9b3f25] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block font-medium text-[#0e1d25] mb-2">Address *</label>
                <input
                  type="text"
                  value={hotelForm.address}
                  onChange={(e) => setHotelForm({ ...hotelForm, address: e.target.value })}
                  placeholder="e.g., 1535 Broadway, New York, NY"
                  className="w-full px-4 py-3 bg-[#e7f6ff] border-none rounded-lg focus:ring-2 focus:ring-[#9b3f25] focus:bg-white transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-[#0e1d25] mb-2">Check-in Date *</label>
                  <input
                    type="date"
                    value={hotelForm.checkInDate}
                    onChange={(e) => setHotelForm({ ...hotelForm, checkInDate: e.target.value })}
                    className="w-full px-4 py-3 bg-[#e7f6ff] border-none rounded-lg focus:ring-2 focus:ring-[#9b3f25] focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#0e1d25] mb-2">Check-in Time</label>
                  <input
                    type="time"
                    value={hotelForm.checkInTime}
                    onChange={(e) => setHotelForm({ ...hotelForm, checkInTime: e.target.value })}
                    className="w-full px-4 py-3 bg-[#e7f6ff] border-none rounded-lg focus:ring-2 focus:ring-[#9b3f25] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-[#0e1d25] mb-2">Check-out Date *</label>
                  <input
                    type="date"
                    value={hotelForm.checkOutDate}
                    onChange={(e) => setHotelForm({ ...hotelForm, checkOutDate: e.target.value })}
                    className="w-full px-4 py-3 bg-[#e7f6ff] border-none rounded-lg focus:ring-2 focus:ring-[#9b3f25] focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#0e1d25] mb-2">Check-out Time</label>
                  <input
                    type="time"
                    value={hotelForm.checkOutTime}
                    onChange={(e) => setHotelForm({ ...hotelForm, checkOutTime: e.target.value })}
                    className="w-full px-4 py-3 bg-[#e7f6ff] border-none rounded-lg focus:ring-2 focus:ring-[#9b3f25] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-[#0e1d25] mb-2">Room Type</label>
                <input
                  type="text"
                  value={hotelForm.roomType}
                  onChange={(e) => setHotelForm({ ...hotelForm, roomType: e.target.value })}
                  placeholder="e.g., King Suite"
                  className="w-full px-4 py-3 bg-[#e7f6ff] border-none rounded-lg focus:ring-2 focus:ring-[#9b3f25] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block font-medium text-[#0e1d25] mb-2">Confirmation Number</label>
                <input
                  type="text"
                  value={hotelForm.confirmationNumber}
                  onChange={(e) => setHotelForm({ ...hotelForm, confirmationNumber: e.target.value })}
                  placeholder="e.g., CONF123456"
                  className="w-full px-4 py-3 bg-[#e7f6ff] border-none rounded-lg focus:ring-2 focus:ring-[#9b3f25] focus:bg-white transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-[#0e1d25] mb-2">Phone</label>
                  <input
                    type="tel"
                    value={hotelForm.phone}
                    onChange={(e) => setHotelForm({ ...hotelForm, phone: e.target.value })}
                    placeholder="e.g., +1 212-555-0100"
                    className="w-full px-4 py-3 bg-[#e7f6ff] border-none rounded-lg focus:ring-2 focus:ring-[#9b3f25] focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#0e1d25] mb-2">Email</label>
                  <input
                    type="email"
                    value={hotelForm.email}
                    onChange={(e) => setHotelForm({ ...hotelForm, email: e.target.value })}
                    placeholder="e.g., hotel@email.com"
                    className="w-full px-4 py-3 bg-[#e7f6ff] border-none rounded-lg focus:ring-2 focus:ring-[#9b3f25] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-[#0e1d25] mb-2">Website</label>
                <input
                  type="url"
                  value={hotelForm.website}
                  onChange={(e) => setHotelForm({ ...hotelForm, website: e.target.value })}
                  placeholder="e.g., https://marriott.com"
                  className="w-full px-4 py-3 bg-[#e7f6ff] border-none rounded-lg focus:ring-2 focus:ring-[#9b3f25] focus:bg-white transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-[#0e1d25] mb-2">Cost</label>
                  <input
                    type="number"
                    value={hotelForm.cost}
                    onChange={(e) => setHotelForm({ ...hotelForm, cost: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-4 py-3 bg-[#e7f6ff] border-none rounded-lg focus:ring-2 focus:ring-[#9b3f25] focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#0e1d25] mb-2">Currency</label>
                  <select
                    value={hotelForm.currency}
                    onChange={(e) => setHotelForm({ ...hotelForm, currency: e.target.value })}
                    className="w-full px-4 py-3 bg-[#e7f6ff] border-none rounded-lg focus:ring-2 focus:ring-[#9b3f25] focus:bg-white transition-all"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="JPY">JPY</option>
                    <option value="CAD">CAD</option>
                    <option value="AUD">AUD</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-[#0e1d25] mb-2">Notes</label>
                <textarea
                  value={hotelForm.notes}
                  onChange={(e) => setHotelForm({ ...hotelForm, notes: e.target.value })}
                  rows={2}
                  placeholder="Any additional notes..."
                  className="w-full px-4 py-3 bg-[#e7f6ff] border-none rounded-lg focus:ring-2 focus:ring-[#9b3f25] focus:bg-white transition-all resize-none"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setShowHotelModal(false)}
                  className="flex-1 px-6 py-4 border-2 border-[#ddc0b9]/50 text-[#9b3f25] rounded-full font-bold hover:bg-[#9b3f25]/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={editingHotel ? handleEditHotel : handleAddHotel}
                  disabled={!hotelForm.name || !hotelForm.address || !hotelForm.checkInDate || !hotelForm.checkOutDate}
                  className="flex-1 px-6 py-4 bg-gradient-to-br from-[#9b3f25] to-[#bb563b] text-white rounded-full font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {editingHotel ? 'Save Changes' : 'Add Hotel'}
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
