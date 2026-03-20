/**
 * Wanderlust Type Definitions
 * All data models for the travel planning application
 */

// Activity Categories
export type ActivityCategory = 
  | 'flight'
  | 'hotel'
  | 'restaurant'
  | 'attraction'
  | 'activity'
  | 'transport'
  | 'shopping'
  | 'entertainment'
  | 'other';

// Location type for activities
export interface Location {
  id: string;
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
  placeId?: string; // Google Maps place ID
}

// Activity within a day
export interface Activity {
  id: string;
  title: string;
  description?: string;
  category: ActivityCategory;
  startTime?: string; // HH:mm format
  endTime?: string; // HH:mm format
  location?: Location;
  notes?: string;
  cost?: number;
  currency?: string;
  confirmationNumber?: string;
  url?: string;
  imageUrl?: string; // Thumbnail image URL
  reminder?: number; // minutes before (15, 30, 60, 120, 1440)
  order: number;
}

// Day within a trip
export interface Day {
  id: string;
  date: string; // ISO date string YYYY-MM-DD
  activities: Activity[];
  notes?: string;
  location?: string; // City/location for the day (shown in day header as "Day X - Location")
}

// Flight details
export interface Flight {
  id: string;
  airline: string;
  flightNumber: string;
  departureAirport: string;
  departureCity: string;
  departureTime: string; // ISO datetime
  arrivalAirport: string;
  arrivalCity: string;
  arrivalTime: string; // ISO datetime
  confirmationNumber?: string;
  terminal?: string;
  gate?: string;
  seat?: string;
  notes?: string;
  cost?: number;
  currency?: string;
}

// Hotel details
export interface Hotel {
  id: string;
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
  checkInDate: string; // ISO date
  checkInTime?: string;
  checkOutDate: string; // ISO date
  checkOutTime?: string;
  confirmationNumber?: string;
  phone?: string;
  email?: string;
  website?: string;
  notes?: string;
  cost?: number;
  currency?: string;
  roomType?: string;
}

// Note type for trip notes
export interface TripNote {
  id: string;
  content: string;
  createdAt: number;
  updatedAt?: number;
}

// Trip - the main container
export interface Trip {
  id: string;
  name: string;
  description?: string;
  coverImage?: string;
  startDate: string; // ISO date
  endDate: string; // ISO date
  days: Day[];
  flights: Flight[];
  hotels: Hotel[];
  packingList?: PackingList;
  notes?: TripNote[]; // Array of trip notes (replaces simple notes string)
  categories?: string[]; // Trip categories: Business, Vacation, Adventure, etc.
  photos?: string[]; // Base64 encoded photos
  createdAt: string; // ISO datetime
  updatedAt: string; // ISO datetime
  budgetTotal?: number;
  copiedFrom?: string; // Track original trip if duplicated
  archived?: boolean; // T024: Archive feature
}

// For creating a new trip
export interface CreateTripInput {
  name: string;
  description?: string;
  coverImage?: string;
  startDate: string;
  endDate: string;
}

// For creating a new day
export interface CreateDayInput {
  date: string;
  notes?: string;
}

// For creating a new activity
export interface CreateActivityInput {
  title: string;
  description?: string;
  category: ActivityCategory;
  startTime?: string;
  endTime?: string;
  location?: Omit<Location, 'id'>;
  notes?: string;
  cost?: number;
  currency?: string;
  confirmationNumber?: string;
  url?: string;
  imageUrl?: string;
  order: number;
}

// Drag and drop types
export interface DragItem {
  type: 'activity';
  id: string;
  dayId: string;
  index: number;
}

export interface DropResult {
  draggableId: string;
  type: 'activity';
  source: {
    droppableId: string; // dayId
    index: number;
  };
  destination: {
    droppableId: string; // dayId
    index: number;
  } | null;
}

// Map types
export interface MapViewport {
  latitude: number;
  longitude: number;
  zoom: number;
  bearing?: number;
  pitch?: number;
}

export interface RoutePoint {
  latitude: number;
  longitude: number;
  name?: string;
}

export interface DayRoute {
  dayId: string;
  points: RoutePoint[];
  geometry?: GeoJSON.LineString;
}

// Filter types
export interface TripFilters {
  category?: ActivityCategory;
  dateRange?: {
    start: string;
    end: string;
  };
  searchQuery?: string;
}

// Storage types
export interface StorageData {
  trips: Trip[];
  lastSync?: string;
  version: string;
}

// UI State types
export interface UIState {
  selectedTripId: string | null;
  selectedDayId: string | null;
  selectedActivityId: string | null;
  isCreatingTrip: boolean;
  isCreatingActivity: boolean;
  mapViewport: MapViewport | null;
  isMapOpen: boolean;
  isSidebarOpen: boolean;
}

// Packing list types
export interface PackingItem {
  id: string;
  name: string;
  category: string;
  packed: boolean;
}

export interface PackingList {
  items: PackingItem[];
}

// Template types
export interface TemplateActivity {
  title: string;
  category: ActivityCategory;
  startTime?: string;
  endTime?: string;
  location?: Omit<Location, 'id'>;
  notes?: string;
  duration?: number; // minutes
}

export interface TemplateDay {
  activities: TemplateActivity[];
  notes?: string;
}

export interface TripTemplate {
  id: string;
  name: string;
  description?: string;
  days: TemplateDay[];
  includeDates: boolean;
  createdAt: string;
  updatedAt: string;
}
