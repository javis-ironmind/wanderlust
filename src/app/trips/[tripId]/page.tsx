'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { TripMap } from '@/components/map/TripMap';
import { LocationMapPreview } from '@/components/LocationMapPreview';
import { exportTripToPDF } from '@/lib/exportPDF';
import { ShareModal } from '@/components/ShareModal';
import TemplateModal from '@/components/TemplateModal';
import { WeatherWidget } from '@/components/WeatherWidget';
import { BudgetWidget } from '@/components/BudgetWidget';
import PackingList from '@/components/PackingList';
import TimelineView from '@/components/TimelineView';
import CloudSyncSettings from '@/components/CloudSyncSettings';
import CalendarExport from '@/components/CalendarExport';
import { FlightForm } from '@/components/FlightForm';
import { HotelForm } from '@/components/HotelForm';
import type { Hotel, TripNote } from '@/lib/types';
import { SortableActivityList } from '@/components/SortableActivityList';
import LocationSearch from '@/components/LocationSearch';
import { ReminderSettings } from '@/components/ReminderSettings';
import { ReminderBell } from '@/components/ReminderBell';
import { NotesPanel } from '@/components/NotesPanel';
import { hasWriteAccess, validateAccessCode } from '@/lib/shareTrip';
import { addReminder, removeReminder } from '@/lib/reminders';
import { useTripStore } from '@/lib/store';

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
  notes?: string;
  links?: string[];
  reminder?: number; // minutes before (15, 30, 60, 120, 1440)
};

type Day = {
  id: string;
  date: string;
  activities: Activity[];
  location?: string; // City/location for the day (AC5: "Day X - Location" format)
};

type Flight = {
  id: string;
  airline: string;
  flightNumber: string;
  departureAirport: string;
  departureCity: string;
  departureTime: string;
  arrivalAirport: string;
  arrivalCity: string;
  arrivalTime: string;
  confirmationNumber?: string;
  terminal?: string;
  gate?: string;
  seat?: string;
  notes?: string;
  cost?: number;
  currency?: string;
};

// Airline lookup for display
interface MapMarker {
  id: string;
  position: [number, number];
  title: string;
  category?: string;
}

const AIRLINE_NAMES: Record<string, string> = {
  AA: 'American Airlines', UA: 'United Airlines', DL: 'Delta Air Lines',
  WN: 'Southwest Airlines', B6: 'JetBlue Airways', AS: 'Alaska Airlines',
  NK: 'Spirit Airlines', F9: 'Frontier Airlines', BA: 'British Airways',
  LH: 'Lufthansa', AF: 'Air France', KL: 'KLM Royal Dutch',
  EK: 'Emirates', QR: 'Qatar Airways', SQ: 'Singapore Airlines',
  CX: 'Cathay Pacific', JL: 'Japan Airlines', NH: 'All Nippon Airways',
  AC: 'Air Canada', QF: 'Qantas',
};

// Airport IANA timezone lookup (AC5: local timezone of location)
const AIRPORT_TIMEZONES: Record<string, string> = {
  JFK: 'America/New_York', LAX: 'America/Los_Angeles', ORD: 'America/Chicago',
  DFW: 'America/Chicago', DEN: 'America/Denver', SFO: 'America/Los_Angeles',
  SEA: 'America/Los_Angeles', LAS: 'America/Los_Angeles', MCO: 'America/New_York',
  MIA: 'America/New_York', ATL: 'America/New_York', BOS: 'America/New_York',
  PHX: 'America/Phoenix', IAH: 'America/Chicago', MSP: 'America/Chicago',
  DTW: 'America/Detroit', PHL: 'America/New_York', LGA: 'America/New_York',
  FLL: 'America/New_York', BWI: 'America/New_York', DCA: 'America/New_York',
  SLC: 'America/Denver', SAN: 'America/Los_Angeles', TPA: 'America/New_York',
  PDX: 'America/Los_Angeles', HNL: 'Pacific/Honolulu',
  LHR: 'Europe/London', CDG: 'Europe/Paris', FRA: 'Europe/Berlin',
  AMS: 'Europe/Amsterdam', NRT: 'Asia/Tokyo', HND: 'Asia/Tokyo',
  ICN: 'Asia/Seoul', SIN: 'Asia/Singapore', HKG: 'Asia/Hong_Kong',
  DXB: 'Asia/Dubai', SYD: 'Australia/Sydney', MEX: 'America/Mexico_City',
  YYZ: 'America/Toronto', YVR: 'America/Vancouver',
};

// Airport coordinates for map display (AC9: flights on map)
const AIRPORT_COORDINATES: Record<string, [number, number]> = {
  JFK: [40.6413, -73.7781], LAX: [33.9425, -118.4081], ORD: [41.9742, -87.9073],
  DFW: [32.8998, -97.0403], DEN: [39.8561, -104.6737], SFO: [37.6213, -122.3790],
  SEA: [47.4502, -122.3088], LAS: [36.0840, -115.1537], MCO: [28.4312, -81.3081],
  MIA: [25.7959, -80.2870], ATL: [33.6407, -84.4277], BOS: [42.3656, -71.0096],
  PHX: [33.4352, -112.0101], IAH: [29.9902, -95.3368], MSP: [44.8848, -93.2223],
  DTW: [42.2162, -83.3554], PHL: [39.8729, -75.2437], LGA: [40.7769, -73.8740],
  FLL: [26.0742, -80.1506], BWI: [39.1774, -76.6684], DCA: [38.8512, -77.0403],
  SLC: [40.7899, -111.9791], SAN: [32.7338, -117.1933], TPA: [27.9754, -82.5332],
  PDX: [45.5898, -122.5951], HNL: [21.3187, -157.9225],
  LHR: [51.4700, -0.4543], CDG: [49.0097, 2.5479], FRA: [50.0379, 8.5622],
  AMS: [52.3105, 4.7683], NRT: [35.7720, 140.3929], HND: [35.5494, 139.7798],
  ICN: [37.4602, 126.4407], SIN: [1.3644, 103.9915], HKG: [22.3080, 113.9185],
  DXB: [25.2532, 55.3657], SYD: [-33.9399, 151.1753], MEX: [19.4363, -99.0721],
  YYZ: [43.6777, -79.6248], YVR: [49.1967, -123.1815],
};

// Flight markers for map (AC9: show flights on map for relevant days)
function getFlightMarkers(flights: Flight[], selectedDayId: string | null, days: Day[]): MapMarker[] {
  if (!selectedDayId || !days.length) return [];
  const selectedDay = days.find(d => d.id === selectedDayId);
  if (!selectedDay) return [];
  const selectedDate = new Date(selectedDay.date);

  return flights
    .filter(flight => {
      if (!flight.departureTime) return false;
      const depDate = new Date(flight.departureTime);
      const arrDate = flight.arrivalTime ? new Date(flight.arrivalTime) : depDate;
      return selectedDate >= new Date(Math.min(depDate.getTime(), arrDate.getTime())) &&
             selectedDate <= new Date(Math.max(depDate.getTime(), arrDate.getTime()));
    })
    .flatMap(flight => {
      const markers: MapMarker[] = [];
      const depCoords = AIRPORT_COORDINATES[flight.departureAirport];
      const arrCoords = AIRPORT_COORDINATES[flight.arrivalAirport];
      if (depCoords) {
        markers.push({
          id: `${flight.id}-dep`,
          position: depCoords,
          title: `${flight.departureAirport} (${getAirlineDisplay(flight.airline)} ${flight.flightNumber})`,
          category: 'flight-departure',
        });
      }
      if (arrCoords) {
        markers.push({
          id: `${flight.id}-arr`,
          position: arrCoords,
          title: `${flight.arrivalAirport} (Arrival)`,
          category: 'flight-arrival',
        });
      }
      return markers;
    });
}

// AC8: Hotel markers for map (show hotels relevant for selected day)
function getHotelMarkers(hotels: Hotel[], selectedDayId: string | null, days: Day[]): MapMarker[] {
  if (!selectedDayId || !days.length) return [];
  const selectedDay = days.find(d => d.id === selectedDayId);
  if (!selectedDay) return [];
  const selectedDate = new Date(selectedDay.date);

  return hotels
    .filter(hotel => {
      if (!hotel.latitude || !hotel.longitude) return false;
      if (!hotel.checkInDate || !hotel.checkOutDate) return false;
      const checkIn = new Date(hotel.checkInDate);
      const checkOut = new Date(hotel.checkOutDate);
      return selectedDate >= checkIn && selectedDate <= checkOut;
    })
    .map(hotel => ({
      id: hotel.id,
      position: [hotel.latitude!, hotel.longitude!] as [number, number],
      title: hotel.name,
      category: 'hotel',
    }));
}

// Format time in airport's local timezone (AC5)
function formatTimeInAirportTimezone(isoString: string, airportCode: string): string {
  const tz = AIRPORT_TIMEZONES[airportCode] || undefined;
  if (!tz) return new Date(isoString).toLocaleString();
  return new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true,
  }).format(new Date(isoString));
}

function getAirlineDisplay(code: string): string {
  return AIRLINE_NAMES[code] || code;
}

function formatHotelDateRange(checkIn: string, checkOut: string): string {
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const checkInStr = checkInDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const checkOutStr = checkOutDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
  return `${checkInStr} - ${checkOutStr} (${nights} night${nights !== 1 ? 's' : ''})`;
}

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
  notes?: TripNote[];
  photos?: string[];
  journalEntries?: JournalEntry[];
};

type JournalEntry = {
  id: string;
  date: string;
  content: string;
  createdAt: string;
};

export default function TripDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params.tripId as string;
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('light'); // T022: dark mode

  // T022: Load theme preference on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('wanderlust_theme');
    if (savedTheme) {
      setTheme(savedTheme as 'light' | 'dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
  }, []);

  // T022: Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('wanderlust_theme', theme);
  }, [theme]);

  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newActivityName, setNewActivityName] = useState('');
  const [newActivityCategory, setNewActivityCategory] = useState('activity');
  const [newActivityStartTime, setNewActivityStartTime] = useState('');
  const [newActivityEndTime, setNewActivityEndTime] = useState('');
  const [newActivityStartDate, setNewActivityStartDate] = useState(''); // For multi-day
  const [newActivityEndDate, setNewActivityEndDate] = useState(''); // For multi-day
  const [newActivityCost, setNewActivityCost] = useState('');
  const [newActivityNotes, setNewActivityNotes] = useState('');
  const [newActivityLinks, setNewActivityLinks] = useState('');
  const [newActivityLocationName, setNewActivityLocationName] = useState(''); // AC5: location name
  const [newActivityLat, setNewActivityLat] = useState<number | undefined>(undefined); // AC5: lat
  const [newActivityLng, setNewActivityLng] = useState<number | undefined>(undefined); // AC5: lng
  const [locationSearchResults, setLocationSearchResults] = useState<any[]>([]); // AC5: geocode results
  const [isSearchingLocation, setIsSearchingLocation] = useState(false); // AC5: search in progress
  const [showLocationResults, setShowLocationResults] = useState(false); // AC5: show dropdown
  const [newActivityReminder, setNewActivityReminder] = useState<number | undefined>(undefined);
  // AC6: Edit activity state
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [editActivityName, setEditActivityName] = useState('');
  const [editActivityCategory, setEditActivityCategory] = useState('activity');
  const [editActivityStartTime, setEditActivityStartTime] = useState('');
  const [editActivityEndTime, setEditActivityEndTime] = useState('');
  const [editActivityCost, setEditActivityCost] = useState('');
  const [editActivityLocationName, setEditActivityLocationName] = useState('');
  const [editActivityLat, setEditActivityLat] = useState<number | undefined>(undefined);
  const [editActivityLng, setEditActivityLng] = useState<number | undefined>(undefined);
  const [editActivityReminder, setEditActivityReminder] = useState<number | undefined>(undefined);
  const [editActivityNotes, setEditActivityNotes] = useState('');
  const [editActivityLinks, setEditActivityLinks] = useState('');
  // AC7: Delete activity state
  const [deletingActivityId, setDeletingActivityId] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'itinerary' | 'explore' | 'budget' | 'journal' | 'flights'>('itinerary');
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set()); // Track which days are expanded
  const [quickAddText, setQuickAddText] = useState<Record<string, string>>({}); // Quick add input per day
  const [showMap, setShowMap] = useState(false); // AC5: FAB to toggle map view on/off
  const [showRoute, setShowRoute] = useState(true); // AC7: Toggle route visibility on/off
  const [routeMode, setRouteMode] = useState<'driving' | 'walking'>('driving'); // AC8: Route mode toggle
  const [routeSummary, setRouteSummary] = useState<{ distance: number; duration: number } | null>(null); // AC3/AC4: Route summary
  const [showFlightModal, setShowFlightModal] = useState(false);
  const [editingFlight, setEditingFlight] = useState<Flight | null>(null);
  const [deleteConfirmFlightId, setDeleteConfirmFlightId] = useState<string | null>(null);
  const { deleteFlight, deleteHotel } = useTripStore();
  const [showHotelModal, setShowHotelModal] = useState(false);
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);
  const [deleteConfirmHotelId, setDeleteConfirmHotelId] = useState<string | null>(null);
  const [isSharedReadOnly, setIsSharedReadOnly] = useState(false);
  const [shareCode, setShareCode] = useState<string | null>(null);
  const [extraDayDate, setExtraDayDate] = useState(''); // F002 AC2: for adding extra days
  const [showExtraDayInput, setShowExtraDayInput] = useState(false); // F002 AC2: toggle input visibility
  const [dayToDelete, setDayToDelete] = useState<string | null>(null); // F002 AC3: day being deleted
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); // F002 AC3: show delete confirmation
  const [deletingDayId, setDeletingDayId] = useState<string | null>(null); // F002 AC8: day being animated out
  const [newlyAddedDayId, setNewlyAddedDayId] = useState<string | null>(null); // F002 AC8: newly added day for fade-in
  const [draggedDayId, setDraggedDayId] = useState<string | null>(null); // F002 AC4: day being dragged
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null); // F002 AC4: drop target index
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error' | 'quota-exceeded'>('saved'); // F010 AC2: auto-save indicator
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null); // T019: fullscreen photo viewer
  const [newJournalDate, setNewJournalDate] = useState<string>(''); // T021: new journal entry date
  const [newJournalContent, setNewJournalContent] = useState<string>(''); // T021: new journal entry content
  const [editingJournalId, setEditingJournalId] = useState<string | null>(null); // T021: editing journal entry
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null); // F010 AC3: debounce timer

  // F010 AC3/AC9: Debounced save to localStorage with quota handling
  const debouncedSave = useCallback((trips: Trip[]) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    setSaveStatus('saving');
    saveTimeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem('wanderlust_trips', JSON.stringify(trips));
        setSaveStatus('saved');
      } catch (e: unknown) {
        // F010 AC9: Handle localStorage quota exceeded
        if (e instanceof DOMException && e.name === 'QuotaExceededError') {
          setSaveStatus('quota-exceeded');
          console.error('localStorage quota exceeded:', e);
          // Alert user so they can take action
          window.alert('⚠️ Storage Full! Your browser\'s localStorage is full. Please delete some trips or activities to continue saving.');
        } else {
          setSaveStatus('error');
          console.error('localStorage save error:', e);
        }
      }
    }, 1000);
  }, []);
  
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

  // AC2: Route follows chronological order - sort activities by startTime
  // AC10: Graceful handling - if route can't be generated, return empty array
  const routePositions = useMemo(() => {
    // Filter markers to only the selected day's activities and sort by startTime
    // We need to re-extract from trip.days since markers loses day/time context
    if (!trip?.days || !selectedDay) return [];
    const selectedDayObj = trip.days.find(d => d.id === selectedDay);
    if (!selectedDayObj) return [];
    
    // Get activities with locations, sorted by startTime
    const dayActivitiesWithLocation = selectedDayObj.activities
      .filter(activity => activity.location?.latitude && activity.location?.longitude && activity.startTime)
      .sort((a, b) => {
        const timeA = new Date(a.startTime!).getTime();
        const timeB = new Date(b.startTime!).getTime();
        return timeA - timeB;
      });
    
    // AC10: Graceful handling - need at least 2 points to draw a route
    if (dayActivitiesWithLocation.length < 2) return [];
    
    return dayActivitiesWithLocation.map(activity => 
      [activity.location!.latitude!, activity.location!.longitude!] as [number, number]
    );
  }, [trip?.days, selectedDay]);

  // AC9: Flight markers for map (separate from activity route)
  const flightMarkers = useMemo(() => {
    if (!trip?.flights || !selectedDay) return [];
    return getFlightMarkers(trip.flights, selectedDay, trip.days || []);
  }, [trip?.flights, selectedDay, trip?.days]);

  // AC8: Hotel markers for map (show hotels relevant for selected day)
  const hotelMarkers = useMemo(() => {
    if (!trip?.hotels || !selectedDay) return [];
    return getHotelMarkers(trip.hotels, selectedDay, trip.days || []);
  }, [trip?.hotels, selectedDay, trip?.days]);

  // AC3/AC4: Fetch route summary (distance + duration) from OSRM when route changes
  useEffect(() => {
    if (!showRoute || routePositions.length < 2) {
      setRouteSummary(null);
      return;
    }

    const fetchRouteSummary = async () => {
      // Build coordinates string for OSRM: lon,lat;lon,lat;...
      const coords = routePositions.map(([lat, lng]) => `${lng},${lat}`).join(';');
      const profile = routeMode === 'walking' ? 'foot' : 'car';

      try {
        // Use OSRM public demo server (note: rate limited, not for production)
        const response = await fetch(
          `https://router.project-osrm.org/route/v1/${profile}/${coords}?overview=false`
        );
        if (!response.ok) throw new Error('OSRM request failed');

        const data = await response.json();
        if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
          setRouteSummary({
            distance: data.routes[0].distance, // meters
            duration: data.routes[0].duration,  // seconds
          });
        } else {
          setRouteSummary(null);
        }
      } catch (error) {
        console.error('Route summary error:', error);
        setRouteSummary(null);
      }
    };

    fetchRouteSummary();
  }, [routePositions, routeMode, showRoute]);

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

  // AC5: Location search using Nominatim geocoding
  const searchLocation = async (query: string) => {
    if (!query.trim()) {
      setLocationSearchResults([]);
      return;
    }
    
    setIsSearchingLocation(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
        { headers: { 'Accept': 'application/json' } }
      );
      const data = await response.json();
      setLocationSearchResults(data);
      setShowLocationResults(true);
    } catch (error) {
      console.error('Location search error:', error);
      setLocationSearchResults([]);
    }
    setIsSearchingLocation(false);
  };

  // Debounced location search using useRef
  const locationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // F010 AC5: File input ref for JSON import
  const importInputRef = useRef<HTMLInputElement>(null);
  const handleLocationChange = (value: string) => {
    setNewActivityLocationName(value);
    if (locationTimeoutRef.current) clearTimeout(locationTimeoutRef.current);
    if (value.trim()) {
      locationTimeoutRef.current = setTimeout(() => searchLocation(value), 500);
    } else {
      setLocationSearchResults([]);
      setNewActivityLat(undefined);
      setNewActivityLng(undefined);
    }
  };

  const selectLocationResult = (result: any) => {
    setNewActivityLocationName(result.display_name);
    setNewActivityLat(parseFloat(result.lat));
    setNewActivityLng(parseFloat(result.lon));
    setLocationSearchResults([]);
    setShowLocationResults(false);
  };

  // F010 AC4: Export trip as JSON file
  const handleExportTrip = () => {
    if (!trip) return;
    const dataStr = JSON.stringify(trip, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${trip.name || 'trip'}-${trip.startDate || 'export'}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // F010 AC5: Import trip from JSON file
  const handleImportTrip = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedTrip = JSON.parse(event.target?.result as string);
        
        // Basic validation: check if it has required fields
        if (!importedTrip.name || !importedTrip.startDate || !importedTrip.endDate) {
          alert('Invalid trip file: missing required fields (name, startDate, endDate)');
          return;
        }

        // Assign new IDs to avoid conflicts
        const newTrip = {
          ...importedTrip,
          id: `trip-${Date.now()}`,
          days: (importedTrip.days || []).map((day: any) => ({
            ...day,
            id: `day-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            activities: (day.activities || []).map((act: any) => ({
              ...act,
              id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            })),
          })),
        };

        // Save to localStorage
        const saved = localStorage.getItem('wanderlust_trips');
        const trips = saved ? JSON.parse(saved) : [];
        trips.push(newTrip);
        localStorage.setItem('wanderlust_trips', JSON.stringify(trips));

        // Navigate to the imported trip
        router.push(`/trips/${newTrip.id}`);
      } catch (err) {
        alert('Failed to parse trip file. Please ensure it is a valid JSON.');
        console.error('Import error:', err);
      }
    };
    reader.readAsText(file);
    // Reset input so same file can be selected again
    e.target.value = '';
  };

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
      location: newActivityLocationName ? {
        name: newActivityLocationName,
        latitude: newActivityLat,
        longitude: newActivityLng,
      } : undefined,
      notes: newActivityNotes.trim() || undefined,
      links: newActivityLinks.trim() ? [newActivityLinks.trim()] : undefined,
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
    
    // F010 AC3: Debounced save to localStorage
    const saved = localStorage.getItem('wanderlust_trips');
    if (saved) {
      const trips: Trip[] = JSON.parse(saved);
      const updatedTrips = trips.map(t => t.id === tripId ? updatedTrip : t);
      debouncedSave(updatedTrips);
    }
    
    setNewActivityName('');
    setNewActivityCategory('activity');
    setNewActivityStartTime('');
    setNewActivityEndTime('');
    setNewActivityStartDate('');
    setNewActivityEndDate('');
    setNewActivityCost('');
    setNewActivityNotes('');
    setNewActivityLinks('');
    setNewActivityLocationName('');
    setNewActivityLat(undefined);
    setNewActivityLng(undefined);
    setLocationSearchResults([]);
    setNewActivityReminder(undefined);
    setShowAddModal(false);
  };

  // AC6: Edit existing activity
  const openEditModal = (activity: Activity) => {
    setEditingActivity(activity);
    setEditActivityName(activity.title);
    setEditActivityCategory(activity.category || 'activity');
    setEditActivityStartTime(activity.startTime || '');
    setEditActivityEndTime(activity.endTime || '');
    setEditActivityCost(activity.cost?.toString() || '');
    setEditActivityLocationName(activity.location?.name || '');
    setEditActivityLat(activity.location?.latitude);
    setEditActivityLng(activity.location?.longitude);
    setEditActivityReminder(activity.reminder);
    setEditActivityNotes(activity.notes || '');
    setEditActivityLinks(activity.links?.[0] || '');
  };

  const handleEditActivity = () => {
    if (!editActivityName.trim() || !editingActivity || !trip) return;

    const updatedActivity: Activity = {
      ...editingActivity,
      title: editActivityName.trim(),
      category: editActivityCategory,
      startTime: editActivityStartTime || undefined,
      endTime: editActivityEndTime || undefined,
      cost: editActivityCost ? parseFloat(editActivityCost) : undefined,
      location: editActivityLocationName ? {
        name: editActivityLocationName,
        latitude: editActivityLat,
        longitude: editActivityLng,
      } : editingActivity.location,
      notes: editActivityNotes.trim() || undefined,
      links: editActivityLinks.trim() ? [editActivityLinks.trim()] : undefined,
      reminder: editActivityReminder,
    };

    const updatedDays = trip.days.map(day => ({
      ...day,
      activities: day.activities.map(a => a.id === editingActivity.id ? updatedActivity : a),
    }));

    const updatedTrip = { ...trip, days: updatedDays };
    setTrip(updatedTrip);

    const saved = localStorage.getItem('wanderlust_trips');
    if (saved) {
      const trips: Trip[] = JSON.parse(saved);
      const updatedTrips = trips.map(t => t.id === tripId ? updatedTrip : t);
      debouncedSave(updatedTrips); // F010 AC9: Uses debounced save with quota handling
    }

    // Reset edit state
    setEditingActivity(null);
    setEditActivityName('');
    setEditActivityCategory('activity');
    setEditActivityStartTime('');
    setEditActivityEndTime('');
    setEditActivityCost('');
    setEditActivityLocationName('');
    setEditActivityLat(undefined);
    setEditActivityLng(undefined);
    setEditActivityReminder(undefined);
    setEditActivityNotes('');
    setEditActivityLinks('');
  };

  // AC7: Delete activity with confirmation
  const handleDeleteActivity = () => {
    if (!deletingActivityId || !trip) return;

    const updatedDays = trip.days.map(day => ({
      ...day,
      activities: day.activities.filter(a => a.id !== deletingActivityId),
    }));

    const updatedTrip = { ...trip, days: updatedDays };
    setTrip(updatedTrip);

    const saved = localStorage.getItem('wanderlust_trips');
    if (saved) {
      const trips: Trip[] = JSON.parse(saved);
      const updatedTrips = trips.map(t => t.id === tripId ? updatedTrip : t);
      localStorage.setItem('wanderlust_trips', JSON.stringify(updatedTrips));
    }

    setDeletingActivityId(null);
  };

  // F004 AC1: Handle reordering activities within a single day
  const handleReorder = (tripId: string, dayId: string, activityIds: string[]) => {
    if (!trip) return;

    const updatedDays = trip.days.map(day => {
      if (day.id !== dayId) return day;
      const reorderedActivities = activityIds
        .map(id => day.activities.find(a => a.id === id))
        .filter(Boolean) as Activity[];
      return { ...day, activities: reorderedActivities };
    });

    const updatedTrip = { ...trip, days: updatedDays };
    setTrip(updatedTrip);

    const saved = localStorage.getItem('wanderlust_trips');
    if (saved) {
      const trips: Trip[] = JSON.parse(saved);
      const updatedTrips = trips.map(t => t.id === tripId ? updatedTrip : t);
      localStorage.setItem('wanderlust_trips', JSON.stringify(updatedTrips));
    }
  };

  // F004 AC4: Handle moving activity between days
  const handleMoveActivity = (
    tripId: string,
    sourceDayId: string,
    destDayId: string,
    activityId: string,
    destIndex?: number
  ) => {
    if (!trip) return;

    const sourceDay = trip.days.find(d => d.id === sourceDayId);
    const activity = sourceDay?.activities.find(a => a.id === activityId);
    if (!activity) return;

    const updatedDays = trip.days.map(day => {
      if (day.id === sourceDayId) {
        return { ...day, activities: day.activities.filter(a => a.id !== activityId) };
      }
      if (day.id === destDayId) {
        const activities = [...day.activities];
        if (destIndex !== undefined) {
          activities.splice(destIndex, 0, activity);
        } else {
          activities.push(activity);
        }
        return { ...day, activities };
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
  };

  // F002 AC2: Add extra day beyond trip date range
  const handleAddExtraDay = () => {
    if (!extraDayDate.trim() || !trip) return;
    
    // Check if day with this date already exists
    const existingDay = trip.days.find(d => d.date === extraDayDate);
    if (existingDay) {
      alert('A day with this date already exists.');
      return;
    }
    
    const newDay: Day = {
      id: `day-${extraDayDate}`,
      date: extraDayDate,
      activities: [],
      location: trip.name, // AC5: Same location as trip for extra days
    };
    
    // Add new day and sort by date
    const updatedDays = [...trip.days, newDay].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    const updatedTrip = { ...trip, days: updatedDays };
    setTrip(updatedTrip);
    
    // AC8: Set newly added day for fade-in animation
    setNewlyAddedDayId(newDay.id);
    
    const saved = localStorage.getItem('wanderlust_trips');
    if (saved) {
      const trips: Trip[] = JSON.parse(saved);
      const updatedTrips = trips.map(t => t.id === tripId ? updatedTrip : t);
      localStorage.setItem('wanderlust_trips', JSON.stringify(updatedTrips));
    }
    
    setExtraDayDate('');
    setShowExtraDayInput(false);
    
    // AC8: Clear newlyAddedDayId after animation completes
    setTimeout(() => setNewlyAddedDayId(null), 300);
  };

  // F002 AC3: Delete a day (with confirmation if has activities)
  const handleDeleteDay = (dayId: string) => {
    const dayToDel = trip?.days.find(d => d.id === dayId);
    if (!dayToDel || !trip) return;
    
    // If day has activities, show confirmation
    if (dayToDel.activities && dayToDel.activities.length > 0) {
      setDayToDelete(dayId);
      setShowDeleteConfirm(true);
      return;
    }
    
    // No activities - AC8: animate out then delete
    setDeletingDayId(dayId);
    setTimeout(() => {
      const updatedDays = trip.days.filter(d => d.id !== dayId);
      const updatedTrip = { ...trip, days: updatedDays };
      setTrip(updatedTrip);
      
      const saved = localStorage.getItem('wanderlust_trips');
      if (saved) {
        const trips: Trip[] = JSON.parse(saved);
        const updatedTrips = trips.map(t => t.id === tripId ? updatedTrip : t);
        localStorage.setItem('wanderlust_trips', JSON.stringify(updatedTrips));
      }
      setDeletingDayId(null);
    }, 300);
  };

  // F002 AC3: Confirm delete after confirmation modal
  const handleConfirmDeleteDay = () => {
    if (!dayToDelete || !trip) return;
    
    // AC8: Set deleting state for fade-out animation, then remove after 300ms
    setDeletingDayId(dayToDelete);
    setDayToDelete(null);
    setShowDeleteConfirm(false);
    
    // Delay actual removal to allow fade-out animation to complete
    setTimeout(() => {
      const updatedDays = trip.days.filter(d => d.id !== dayToDelete);
      const updatedTrip = { ...trip, days: updatedDays };
      setTrip(updatedTrip);
      
      const saved = localStorage.getItem('wanderlust_trips');
      if (saved) {
        const trips: Trip[] = JSON.parse(saved);
        const updatedTrips = trips.map(t => t.id === tripId ? updatedTrip : t);
        localStorage.setItem('wanderlust_trips', JSON.stringify(updatedTrips));
      }
      
      setDeletingDayId(null);
    }, 300);
  };

  // F002 AC4: Drag-and-drop day reordering
  const handleDragStart = (e: React.DragEvent, dayId: string) => {
    setDraggedDayId(dayId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropTargetIndex(index);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (!draggedDayId || !trip || draggedDayId === trip.days[targetIndex]?.id) {
      setDraggedDayId(null);
      setDropTargetIndex(null);
      return;
    }

    const currentIndex = trip.days.findIndex(d => d.id === draggedDayId);
    if (currentIndex === -1) return;

    const newDays = [...trip.days];
    const [draggedDay] = newDays.splice(currentIndex, 1);
    newDays.splice(targetIndex, 0, draggedDay);

    const updatedTrip = { ...trip, days: newDays };
    setTrip(updatedTrip);

    const saved = localStorage.getItem('wanderlust_trips');
    if (saved) {
      const trips: Trip[] = JSON.parse(saved);
      const updatedTrips = trips.map(t => t.id === tripId ? updatedTrip : t);
      localStorage.setItem('wanderlust_trips', JSON.stringify(updatedTrips));
    }

    setDraggedDayId(null);
    setDropTargetIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedDayId(null);
    setDropTargetIndex(null);
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

  // T017: Handle notes update
  const handleUpdateNotes = (notes: TripNote[]) => {
    if (!trip) return;
    const updatedTrip = { ...trip, notes };
    setTrip(updatedTrip);
    
    const saved = localStorage.getItem('wanderlust_trips');
    if (saved) {
      const trips: Trip[] = JSON.parse(saved);
      const updatedTrips = trips.map(t => t.id === tripId ? updatedTrip : t);
      localStorage.setItem('wanderlust_trips', JSON.stringify(updatedTrips));
    }
  };

  // T019: Handle photo upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!trip || !e.target.files) return;
    
    const files = Array.from(e.target.files);
    const newPhotos: string[] = [];
    
    for (const file of files) {
      // Limit file size to 500KB to prevent localStorage issues
      if (file.size > 500 * 1024) {
        alert(`File ${file.name} is too large. Max size is 500KB.`);
        continue;
      }
      
      try {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        newPhotos.push(base64);
      } catch (err) {
        console.error('Error reading file:', err);
      }
    }
    
    if (newPhotos.length > 0) {
      const currentPhotos = trip.photos || [];
      const updatedTrip = { ...trip, photos: [...currentPhotos, ...newPhotos] };
      setTrip(updatedTrip);
      
      const saved = localStorage.getItem('wanderlust_trips');
      if (saved) {
        const trips: Trip[] = JSON.parse(saved);
        const updatedTrips = trips.map(t => t.id === tripId ? updatedTrip : t);
        localStorage.setItem('wanderlust_trips', JSON.stringify(updatedTrips));
      }
    }
  };

  // T019: Handle photo delete
  const handleDeletePhoto = (index: number) => {
    if (!trip) return;
    
    const currentPhotos = trip.photos || [];
    const newPhotos = currentPhotos.filter((_, i) => i !== index);
    const updatedTrip = { ...trip, photos: newPhotos };
    setTrip(updatedTrip);
    
    const saved = localStorage.getItem('wanderlust_trips');
    if (saved) {
      const trips: Trip[] = JSON.parse(saved);
      const updatedTrips = trips.map(t => t.id === tripId ? updatedTrip : t);
      localStorage.setItem('wanderlust_trips', JSON.stringify(updatedTrips));
    }
  };

  // T021: Add journal entry
  const handleAddJournalEntry = () => {
    if (!trip || !newJournalContent.trim() || !newJournalDate) return;
    
    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      date: newJournalDate,
      content: newJournalContent.trim(),
      createdAt: new Date().toISOString()
    };
    
    const currentEntries = trip.journalEntries || [];
    const updatedTrip = { ...trip, journalEntries: [...currentEntries, newEntry] };
    setTrip(updatedTrip);
    
    const saved = localStorage.getItem('wanderlust_trips');
    if (saved) {
      const trips: Trip[] = JSON.parse(saved);
      const updatedTrips = trips.map(t => t.id === tripId ? updatedTrip : t);
      localStorage.setItem('wanderlust_trips', JSON.stringify(updatedTrips));
    }
    
    setNewJournalDate('');
    setNewJournalContent('');
  };

  // T021: Update journal entry
  const handleUpdateJournalEntry = (id: string, content: string) => {
    if (!trip) return;
    
    const currentEntries = trip.journalEntries || [];
    const updatedEntries = currentEntries.map(entry => 
      entry.id === id ? { ...entry, content } : entry
    );
    const updatedTrip = { ...trip, journalEntries: updatedEntries };
    setTrip(updatedTrip);
    
    const saved = localStorage.getItem('wanderlust_trips');
    if (saved) {
      const trips: Trip[] = JSON.parse(saved);
      const updatedTrips = trips.map(t => t.id === tripId ? updatedTrip : t);
      localStorage.setItem('wanderlust_trips', JSON.stringify(updatedTrips));
    }
    
    setEditingJournalId(null);
  };

  // T021: Delete journal entry
  const handleDeleteJournalEntry = (id: string) => {
    if (!trip) return;
    
    const currentEntries = trip.journalEntries || [];
    const updatedEntries = currentEntries.filter(entry => entry.id !== id);
    const updatedTrip = { ...trip, journalEntries: updatedEntries };
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

  // AC8: Inject keyframe animations for day add/remove
  useEffect(() => {
    const styleId = 'wanderlust-day-animations';
    if (document.getElementById(styleId)) return; // Already injected
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; transform: scale(0.95); }
        to { opacity: 1; transform: scale(1); }
      }
    `;
    document.head.appendChild(style);
    return () => {
      const el = document.getElementById(styleId);
      if (el) el.remove();
    };
  }, []);

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
        <div style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
          {/* F010 AC4: Export trip as JSON */}
          <button
            onClick={handleExportTrip}
            style={{ 
              background: 'rgba(0,0,0,0.5)', 
              border: 'none', 
              color: 'white', 
              cursor: 'pointer',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              backdropFilter: 'blur(4px)',
            }}
            title="Export trip as JSON"
          >
            📥 Export
          </button>
          {/* F010 AC5: Import trip from JSON */}
          <button
            onClick={() => importInputRef.current?.click()}
            style={{ 
              background: 'rgba(0,0,0,0.5)', 
              border: 'none', 
              color: 'white', 
              cursor: 'pointer',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              backdropFilter: 'blur(4px)',
            }}
            title="Import trip from JSON"
          >
            📤 Import
          </button>
          <input
            ref={importInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleImportTrip}
            style={{ display: 'none' }}
          />
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
            {/* F010 AC2/AC9: Auto-save indicator and quota warning */}
            <span style={{ marginLeft: '0.75rem', fontSize: '0.7rem', opacity: 0.7 }}>
              {saveStatus === 'saving' && '💾 Saving...'}
              {saveStatus === 'saved' && '✓ Saved'}
              {saveStatus === 'error' && '⚠️ Save failed'}
              {saveStatus === 'quota-exceeded' && '⚠️ Storage full'}
            </span>
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
        
        {/* T022: Dark mode toggle */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '8px',
              padding: '0.5rem',
              cursor: 'pointer',
              fontSize: '1.25rem',
            }}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
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

        {/* Notes Panel (T017) */}
        <div style={{ marginTop: '1rem' }}>
          <NotesPanel 
            notes={trip.notes || []} 
            onNotesChange={handleUpdateNotes} 
          />
        </div>

        {/* Journal Section (T021) */}
        {activeTab === 'journal' && (
          <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2 style={{ margin: '0 0 1rem', fontSize: '1.25rem', fontWeight: '600', color: '#1e3a5f' }}>📝 Trip Journal</h2>
            
            {/* Add New Entry */}
            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>Date</label>
                <input
                  type="date"
                  value={newJournalDate}
                  onChange={(e) => setNewJournalDate(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}
                />
              </div>
              <div style={{ marginBottom: '0.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>Entry</label>
                <textarea
                  value={newJournalContent}
                  onChange={(e) => setNewJournalContent(e.target.value)}
                  placeholder="Write about your day..."
                  rows={4}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #e2e8f0', resize: 'vertical', fontFamily: 'inherit' }}
                />
              </div>
              <button
                onClick={handleAddJournalEntry}
                disabled={!newJournalContent.trim() || !newJournalDate}
                style={{
                  background: newJournalContent.trim() && newJournalDate ? '#3b82f6' : '#94a3b8',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: newJournalContent.trim() && newJournalDate ? 'pointer' : 'not-allowed',
                  fontWeight: '600'
                }}
              >
                Add Entry
              </button>
            </div>
            
            {/* Journal Entries List */}
            {trip.journalEntries && trip.journalEntries.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {trip.journalEntries
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map(entry => (
                    <div key={entry.id} style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{ fontWeight: '600', color: '#1e3a5f' }}>
                          {new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => setEditingJournalId(entry.id)}
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: '#3b82f6' }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteJournalEntry(entry.id)}
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: '#dc2626' }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      {editingJournalId === entry.id ? (
                        <div>
                          <textarea
                            defaultValue={entry.content}
                            rows={4}
                            id={`edit-journal-${entry.id}`}
                            style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #e2e8f0', resize: 'vertical', fontFamily: 'inherit', marginBottom: '0.5rem' }}
                          />
                          <button
                            onClick={() => {
                              const content = (document.getElementById(`edit-journal-${entry.id}`) as HTMLTextAreaElement)?.value;
                              if (content) handleUpdateJournalEntry(entry.id, content);
                            }}
                            style={{ background: '#22c55e', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '4px', border: 'none', cursor: 'pointer', marginRight: '0.5rem' }}
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingJournalId(null)}
                            style={{ background: '#64748b', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '4px', border: 'none', cursor: 'pointer' }}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <p style={{ margin: 0, color: '#374151', whiteSpace: 'pre-wrap' }}>{entry.content}</p>
                      )}
                    </div>
                  ))}
              </div>
            ) : (
              <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>
                No journal entries yet. Start writing about your trip!
              </p>
            )}
          </div>
        )}

        {/* Photos Section (T019) */}
        <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ margin: '0 0 1rem', fontSize: '1.25rem', fontWeight: '600', color: '#1e3a5f' }}>📸 Photos</h2>
          
          {/* Photo Upload */}
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handlePhotoUpload}
            style={{ marginBottom: '1rem' }}
          />
          
          {/* Photo Grid */}
          {trip.photos && trip.photos.length > 0 ? (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', 
              gap: '0.75rem',
              marginTop: '1rem'
            }}>
              {trip.photos.map((photo, index) => (
                <div 
                  key={index}
                  onClick={() => setSelectedPhoto(photo)}
                  style={{
                    aspectRatio: '1',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                >
                  <img 
                    src={photo} 
                    alt={`Trip photo ${index + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePhoto(index);
                    }}
                    style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      background: 'rgba(0,0,0,0.6)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0.5rem 0' }}>
              No photos yet. Click "Choose Files" to add photos from your device.
            </p>
          )}
        </div>

        {/* Fullscreen Photo Modal */}
        {selectedPhoto && (
          <div 
            onClick={() => setSelectedPhoto(null)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              cursor: 'pointer'
            }}
          >
            <img 
              src={selectedPhoto} 
              alt="Fullscreen photo"
              style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain' }}
            />
          </div>
        )}

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
              {[...trip.flights].sort((a, b) => {
                const timeA = a.departureTime ? new Date(a.departureTime).getTime() : Infinity;
                const timeB = b.departureTime ? new Date(b.departureTime).getTime() : Infinity;
                return timeA - timeB;
              }).map((flight: any) => (
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
                      <div style={{ fontWeight: '600', color: '#1e3a5f' }}>{getAirlineDisplay(flight.airline)} {flight.flightNumber}</div>
                      <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                        {flight.departureAirport}{flight.departureCity ? ` - ${flight.departureCity}` : ''} → {flight.arrivalAirport}{flight.arrivalCity ? ` - ${flight.arrivalCity}` : ''}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap' }}>
                        <span>{flight.departureTime ? formatTimeInAirportTimezone(flight.departureTime, flight.departureAirport) : 'No time'} → {flight.arrivalTime ? formatTimeInAirportTimezone(flight.arrivalTime, flight.arrivalAirport) : 'No arrival time'}</span>
                        {flight.departureTime && flight.arrivalTime && new Date(flight.departureTime).toDateString() !== new Date(flight.arrivalTime).toDateString() && (
                          <span style={{ padding: '0.125rem 0.375rem', background: '#fef3c7', color: '#92400e', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '500' }}>Multi-day</span>
                        )}
                      </div>
                      {flight.confirmationNumber && (
                        <div style={{
                          display: 'inline-block',
                          marginTop: '0.25rem',
                          padding: '0.125rem 0.5rem',
                          background: '#dbeafe',
                          color: '#1d4ed8',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                        }}>✈ Confirmation: {flight.confirmationNumber}</div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => { setEditingFlight(flight); setShowFlightModal(true); }} style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', background: '#e2e8f0', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Edit</button>
                      <button onClick={() => setDeleteConfirmFlightId(flight.id)} style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', background: '#fee2e2', border: 'none', borderRadius: '4px', cursor: 'pointer', color: '#dc2626' }}>Delete</button>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: '#334155' }}>Hotels</h3>
              <button onClick={() => { setEditingHotel(null); setShowHotelModal(true); }} style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', background: '#3b82f6', border: 'none', borderRadius: '6px', color: 'white', cursor: 'pointer', fontWeight: '500' }}>+ Add Hotel</button>
            </div>
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
                        {formatHotelDateRange(hotel.checkInDate, hotel.checkOutDate)}
                      </div>
                      {(hotel.checkInTime || hotel.checkOutTime) && (
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          {hotel.checkInTime && `Check-in: ${hotel.checkInTime}`}{hotel.checkInTime && hotel.checkOutTime && ' → '}{hotel.checkOutTime && `Check-out: ${hotel.checkOutTime}`}
                        </div>
                      )}
                      {hotel.confirmationNumber && (
                        <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#7c3aed' }}>✦ Confirmation: {hotel.confirmationNumber}</div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => { setEditingHotel(hotel); setShowHotelModal(true); }} style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', background: '#e2e8f0', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Edit</button>
                      <button onClick={() => setDeleteConfirmHotelId(hotel.id)} style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', background: '#fee2e2', border: 'none', borderRadius: '4px', cursor: 'pointer', color: '#dc2626' }}>Delete</button>
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
                  Day {index + 1}{day.location ? ` - ${day.location}` : ''} ({day.activities?.length || 0})
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

        {/* F002 AC2: Add Extra Day button/input */}
        {!isSharedReadOnly && (
          <div style={{ marginBottom: '1.5rem' }}>
            {!showExtraDayInput ? (
              <button
                onClick={() => setShowExtraDayInput(true)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  border: '2px dashed #64748b',
                  background: 'transparent',
                  color: '#64748b',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  width: '100%',
                }}
              >
                + Add Extra Day
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  type="date"
                  value={extraDayDate}
                  onChange={(e) => setExtraDayDate(e.target.value)}
                  style={{
                    padding: '0.5rem',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: '0.875rem',
                    flex: 1,
                  }}
                />
                <button
                  onClick={handleAddExtraDay}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#10B981',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                  }}
                >
                  Add Day
                </button>
                <button
                  onClick={() => { setShowExtraDayInput(false); setExtraDayDate(''); }}
                  style={{
                    padding: '0.5rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    background: 'white',
                    color: '#64748b',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                  }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}

        {/* Itinerary - Collapsible Day Sections (T002) */}
        <div style={{ marginBottom: '1rem' }}>
          {days.map((day, index) => {
            const isExpanded = expandedDays.has(day.id);
            const activityCount = day.activities?.length || 0;
            
            const isDragging = draggedDayId === day.id;
            const isDropTarget = dropTargetIndex === index && draggedDayId !== day.id;
            const isDeleting = day.id === deletingDayId;
            const isNewlyAdded = day.id === newlyAddedDayId;
            
            return (
              <div key={day.id} style={{ 
                background: 'white', 
                borderRadius: '12px', 
                marginBottom: '0.75rem',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                opacity: isDragging ? 0.5 : isDeleting ? 0 : 1,
                border: isDropTarget ? '2px solid #3b82f6' : '2px solid transparent',
                transform: isDropTarget ? 'scale(1.02)' : isDeleting ? 'scale(0.95)' : 'scale(1)',
                transition: isDeleting ? 'all 0.3s ease' : 'all 0.2s ease',
                animation: isNewlyAdded ? 'fadeIn 0.3s ease' : 'none',
              }}
              draggable={!isSharedReadOnly}
              onDragStart={(e) => handleDragStart(e, day.id)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              >
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
                        Day {index + 1}{day.location ? ` - ${day.location}` : ''}
                      </h3>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {day.date}
                        <span style={{
                          background: activityCount > 0 ? '#3b82f6' : '#94a3b8',
                          color: 'white',
                          borderRadius: '9999px',
                          padding: '0.125rem 0.4rem',
                          fontSize: '0.7rem',
                          fontWeight: '600',
                          minWidth: '1.5rem',
                          textAlign: 'center',
                        }}>
                          {activityCount}
                        </span>
                      </p>
                    </div>
                  </div>
                  {/* Quick add button in header - hidden in read-only */}
                  {!isSharedReadOnly && (
                    <>
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
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteDay(day.id); }}
                      title={day.activities?.length > 0 ? `${day.activities.length} activities - click to delete` : 'Delete day'}
                      style={{
                        background: '#ef4444',
                        color: 'white',
                        padding: '0.4rem 0.5rem',
                        borderRadius: '6px',
                        border: 'none',
                        fontSize: '0.7rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        marginLeft: '0.25rem',
                      }}
                    >
                      🗑️
                    </button>
                    </>
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
                    <SortableActivityList
                      tripId={tripId}
                      day={day as any}
                      days={trip.days as any}
                      onReorder={handleReorder}
                      onMoveActivity={handleMoveActivity}
                      onEditActivity={openEditModal}
                      onDeleteActivity={(id) => setDeletingActivityId(id)}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Map - AC1: Shows only when activities have locations */}
        {showMap && markers.length > 0 && (
          <div className="relative min-h-[200px] md:min-h-[250px] bg-white rounded-2xl overflow-hidden mb-4">
            <TripMap 
              className="leaflet-container" 
              markers={[...markers, ...flightMarkers, ...hotelMarkers]}
              route={showRoute ? routePositions : []}
            />
            {/* AC3/AC4: Route summary (distance + duration) */}
            {showRoute && routeSummary && (
              <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-md text-xs z-[1000]">
                <span className="text-gray-600">
                  🚗 {Math.round(routeSummary.distance / 1000 * 10) / 10} km
                </span>
                <span className="mx-2 text-gray-300">·</span>
                <span className="text-gray-600">
                  ⏱ {Math.round(routeSummary.duration / 60)} min
                </span>
              </div>
            )}
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

        {/* AC7: Toggle route visibility on/off - only when map is shown */}
        {showMap && markers.length > 0 && (
          <button
            onClick={() => setShowRoute(!showRoute)}
            style={{
              position: 'fixed',
              bottom: '10.5rem',
              right: '2rem',
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              border: 'none',
              background: showRoute ? '#10b981' : '#64748b',
              color: 'white',
              fontSize: '1.25rem',
              cursor: 'pointer',
              zIndex: 100,
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            }}
            title={showRoute ? 'Hide Route' : 'Show Route'}
          >
            🛤️
          </button>
        )}

        {/* AC8: Route mode toggle (driving/walking) - only when route is shown */}
        {showMap && showRoute && markers.length > 0 && (
          <button
            onClick={() => setRouteMode(routeMode === 'driving' ? 'walking' : 'driving')}
            style={{
              position: 'fixed',
              bottom: '10.5rem',
              right: '5.5rem',
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              border: 'none',
              background: routeMode === 'driving' ? '#3b82f6' : '#8b5cf6',
              color: 'white',
              fontSize: '1rem',
              cursor: 'pointer',
              zIndex: 100,
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            }}
            title={routeMode === 'driving' ? 'Driving route - click for walking' : 'Walking route - click for driving'}
          >
            {routeMode === 'driving' ? '🚗' : '🚶'}
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

        {/* F002 AC3: Delete Day Confirmation Modal */}
        {showDeleteConfirm && dayToDelete && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000,
          }} onClick={() => { setShowDeleteConfirm(false); setDayToDelete(null); }}>
            <div style={{
              background: 'white', borderRadius: '12px', padding: '1.5rem', maxWidth: '400px', width: '90%',
              maxHeight: '90vh', overflow: 'auto',
            }} onClick={e => e.stopPropagation()}>
              <h3 style={{ margin: '0 0 1rem', color: '#1e3a5f' }}>Delete Day?</h3>
              {(() => {
                const day = trip?.days.find(d => d.id === dayToDelete);
                const actCount = day?.activities?.length || 0;
                return actCount > 0 ? (
                  <p style={{ color: '#64748b', marginBottom: '1rem' }}>
                    This day has <strong>{actCount} {actCount === 1 ? 'activity' : 'activities'}</strong>. 
                    Deleting it will remove all these activities. This cannot be undone.
                  </p>
                ) : (
                  <p style={{ color: '#64748b', marginBottom: '1rem' }}>
                    Are you sure you want to delete this day? This cannot be undone.
                  </p>
                );
              })()}
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => { setShowDeleteConfirm(false); setDayToDelete(null); }}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    background: 'white',
                    color: '#64748b',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDeleteDay}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#ef4444',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                  }}
                >
                  Delete Day
                </button>
              </div>
            </div>
          </div>
        )}

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
                flight={editingFlight ?? undefined}
                onClose={() => { setShowFlightModal(false); setEditingFlight(null); }}
              />
            </div>
          </div>
        )}

        {/* Delete Flight Confirmation Modal */}
        {deleteConfirmFlightId && (() => {
          const flightToDelete = trip.flights?.find((f: Flight) => f.id === deleteConfirmFlightId);
          return (
            <div style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 1000,
            }} onClick={() => setDeleteConfirmFlightId(null)}>
              <div style={{
                background: 'white', borderRadius: '12px', padding: '1.5rem', maxWidth: '400px', width: '90%',
              }} onClick={e => e.stopPropagation()}>
                <h3 style={{ margin: '0 0 1rem 0', color: '#1e3a5f' }}>Delete Flight?</h3>
                <p style={{ margin: '0 0 1.5rem 0', color: '#64748b' }}>
                  Are you sure you want to delete flight {flightToDelete ? `${flightToDelete.airline} ${flightToDelete.flightNumber}` : ''}? This cannot be undone.
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => setDeleteConfirmFlightId(null)}
                    style={{ padding: '0.5rem 1rem', background: '#e2e8f0', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.875rem' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => { deleteFlight(tripId, deleteConfirmFlightId); setDeleteConfirmFlightId(null); }}
                    style={{ padding: '0.5rem 1rem', background: '#dc2626', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.875rem' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Delete Hotel Confirmation Modal */}
        {deleteConfirmHotelId && (() => {
          const hotelToDelete = trip.hotels?.find((h: Hotel) => h.id === deleteConfirmHotelId);
          return (
            <div style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 1000,
            }} onClick={() => setDeleteConfirmHotelId(null)}>
              <div style={{
                background: 'white', borderRadius: '12px', padding: '1.5rem', maxWidth: '400px', width: '90%',
              }} onClick={e => e.stopPropagation()}>
                <h3 style={{ margin: '0 0 1rem 0', color: '#1e3a5f' }}>Delete Hotel?</h3>
                <p style={{ margin: '0 0 1.5rem 0', color: '#64748b' }}>
                  Are you sure you want to delete {hotelToDelete ? hotelToDelete.name : 'this hotel'}? This cannot be undone.
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => setDeleteConfirmHotelId(null)}
                    style={{ padding: '0.5rem 1rem', background: '#e2e8f0', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.875rem' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => { deleteHotel(tripId, deleteConfirmHotelId); setDeleteConfirmHotelId(null); }}
                    style={{ padding: '0.5rem 1rem', background: '#dc2626', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.875rem' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

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
                hotel={editingHotel || undefined}
                onClose={() => { setShowHotelModal(false); setEditingHotel(null); }}
                onSave={() => { setShowHotelModal(false); setEditingHotel(null); }}
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
        }} onClick={() => { setShowAddModal(false); setNewActivityLocationName(''); setLocationSearchResults([]); setNewActivityLat(undefined); setNewActivityLng(undefined); }}>
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

            {/* AC5: Location search with geocoding - using LocationSearch component */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.875rem' }}>
                Location (optional)
              </label>
              <LocationSearch
                value={newActivityLocationName ? {
                  name: newActivityLocationName,
                  address: newActivityLocationName,
                  latitude: newActivityLat,
                  longitude: newActivityLng,
                } : undefined}
                onChange={(location) => {
                  if (location) {
                    setNewActivityLocationName(location.name);
                    setNewActivityLat(location.latitude);
                    setNewActivityLng(location.longitude);
                  } else {
                    setNewActivityLocationName('');
                    setNewActivityLat(undefined);
                    setNewActivityLng(undefined);
                  }
                }}
                placeholder="Search for a location..."
                disabled={false}
              />
              {newActivityLat && newActivityLng && (
                <LocationMapPreview
                  latitude={newActivityLat}
                  longitude={newActivityLng}
                  name={newActivityLocationName}
                  height={120}
                />
              )}
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
            
            {/* Notes textarea */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.875rem' }}>
                Notes (optional)
              </label>
              <textarea
                value={newActivityNotes}
                onChange={e => setNewActivityNotes(e.target.value)}
                placeholder="Add notes about this activity..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '2px solid #e2e8f0',
                  fontSize: '0.95rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  resize: 'vertical',
                  fontFamily: 'inherit',
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

            {/* Links input */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.875rem' }}>
                Link (optional)
              </label>
              <input
                type="url"
                value={newActivityLinks}
                onChange={e => setNewActivityLinks(e.target.value)}
                placeholder="https://..."
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '2px solid #e2e8f0',
                  fontSize: '0.95rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
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
                onClick={() => { setShowAddModal(false); setNewActivityLocationName(''); setLocationSearchResults([]); setNewActivityLat(undefined); setNewActivityLng(undefined); }}
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

      {/* AC6: Edit Activity Modal */}
      {editingActivity && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            zIndex: 100,
          }}
          onClick={() => { setEditingActivity(null); setEditActivityName(''); setEditActivityLocationName(''); }}
        >
          <div 
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
            <h3 style={{ margin: '0 0 1rem', color: '#1e3a5f', fontSize: '1.25rem' }}>Edit Activity</h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.875rem' }}>
                Activity Name
              </label>
              <input
                type="text"
                value={editActivityName}
                onChange={e => setEditActivityName(e.target.value)}
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

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.875rem' }}>
                Category
              </label>
              <select
                value={editActivityCategory}
                onChange={e => setEditActivityCategory(e.target.value)}
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

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.875rem' }}>
                Start Time (optional)
              </label>
              <input
                type="datetime-local"
                value={editActivityStartTime}
                onChange={e => setEditActivityStartTime(e.target.value)}
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
                value={editActivityEndTime}
                onChange={e => setEditActivityEndTime(e.target.value)}
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

            {/* Notes textarea */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.875rem' }}>
                Notes (optional)
              </label>
              <textarea
                value={editActivityNotes}
                onChange={e => setEditActivityNotes(e.target.value)}
                placeholder="Add notes about this activity..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '2px solid #e2e8f0',
                  fontSize: '0.95rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                }}
              />
            </div>

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
                  value={editActivityCost}
                  onChange={e => setEditActivityCost(e.target.value)}
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

            {/* Links input */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.875rem' }}>
                Link (optional)
              </label>
              <input
                type="url"
                value={editActivityLinks}
                onChange={e => setEditActivityLinks(e.target.value)}
                placeholder="https://..."
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '2px solid #e2e8f0',
                  fontSize: '0.95rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {editActivityLat && editActivityLng && (
              <LocationMapPreview
                latitude={editActivityLat}
                longitude={editActivityLng}
                name={editActivityLocationName}
                height={120}
              />
            )}
            
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => { setEditingActivity(null); setEditActivityName(''); setEditActivityLocationName(''); setEditActivityLat(undefined); setEditActivityLng(undefined); setEditActivityNotes(''); setEditActivityLinks(''); }}
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
                onClick={handleEditActivity}
                disabled={!editActivityName.trim()}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: editActivityName.trim() 
                    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
                    : '#94a3b8',
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: editActivityName.trim() ? 'pointer' : 'not-allowed',
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AC7: Delete Activity Confirmation Modal */}
      {deletingActivityId && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
          }}
          onClick={() => setDeletingActivityId(null)}
        >
          <div 
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '1.5rem',
              width: '90%',
              maxWidth: '340px',
            }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 0.75rem', color: '#1e3a5f', fontSize: '1.1rem' }}>Delete Activity?</h3>
            <p style={{ margin: '0 0 1.25rem', color: '#64748b', fontSize: '0.9rem' }}>
              This action cannot be undone. The activity will be permanently removed.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setDeletingActivityId(null)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '2px solid #e2e8f0',
                  background: 'white',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteActivity}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  color: 'white',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Delete
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
