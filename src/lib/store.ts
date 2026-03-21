import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import { Trip, Day, Activity, Flight, Hotel, PackingItem, TripTemplate, TemplateDay, TemplateActivity } from './types';
import { saveToStorage, loadFromStorage } from './storage';

interface SyncState {
  cloudSyncEnabled: boolean;
  syncStatus: 'local' | 'syncing' | 'synced' | 'error';
  lastSyncedAt: Date | null;
  pendingSyncQueue: string[]; // trip IDs pending sync
  isInitialized: boolean; // Track if store has been initialized from API
  isOnline: boolean;
}

interface OfflineQueueItem {
  id: string;
  action: 'create' | 'update' | 'delete';
  data?: unknown;
  timestamp: Date;
}

interface UndoItem {
  activity: Activity;
  tripId: string;
  dayId: string;
  originalIndex: number;
  deletedAt: Date;
}

interface TripState extends SyncState {
  trips: Trip[];
  currentTripId: string | null;
  undoQueue: UndoItem[];
  templates: TripTemplate[];
  offlineQueue: OfflineQueueItem[];
}

interface TripActions {
  // Trip actions
  addTrip: (trip: Trip) => Promise<void>;
  setTrips: (trips: Trip[]) => void;
  updateTrip: (tripId: string, updates: Partial<Trip>) => void;
  deleteTrip: (tripId: string) => void;
  setCurrentTrip: (tripId: string | null) => void;
  archiveTrip: (tripId: string) => void;
  unarchiveTrip: (tripId: string) => void;

  // Day actions
  addDay: (tripId: string, day: Day) => void;
  updateDay: (tripId: string, dayId: string, updates: Partial<Day>) => void;
  deleteDay: (tripId: string, dayId: string) => void;
  reorderDays: (tripId: string, dayIds: string[]) => void;

  // Activity actions
  addActivity: (tripId: string, dayId: string, activity: Activity) => void;
  updateActivity: (tripId: string, dayId: string, activityId: string, updates: Partial<Activity>) => void;
  deleteActivity: (tripId: string, dayId: string, activityId: string) => void;
  reorderActivities: (tripId: string, dayId: string, activityIds: string[]) => void;
  moveActivityToDay: (tripId: string, sourceDayId: string, destDayId: string, activityId: string, destIndex?: number) => void;

  // Flight actions
  addFlight: (tripId: string, flight: Flight) => void;
  updateFlight: (tripId: string, flightId: string, updates: Partial<Flight>) => void;
  deleteFlight: (tripId: string, flightId: string) => void;

  // Hotel actions
  addHotel: (tripId: string, hotel: Hotel) => void;
  updateHotel: (tripId: string, hotelId: string, updates: Partial<Hotel>) => void;
  deleteHotel: (tripId: string, hotelId: string) => void;

  // Packing list actions
  addPackingItem: (tripId: string, item: PackingItem) => void;
  updatePackingItem: (tripId: string, itemId: string, updates: Partial<PackingItem>) => void;
  deletePackingItem: (tripId: string, itemId: string) => void;
  togglePackingItem: (tripId: string, itemId: string) => void;
  initializePackingList: (tripId: string) => void;

  // Undo actions
  undoDeleteActivity: (activity: Activity, tripId: string, dayId: string, originalIndex: number) => void;
  clearExpiredUndoItems: () => void;
  clearUndoQueue: () => void;

  // Cloud sync actions
  setCloudSyncEnabled: (enabled: boolean) => void;
  setSyncStatus: (status: 'local' | 'syncing' | 'synced' | 'error') => void;
  syncTripToCloud: (tripId: string) => Promise<void>;
  queueForSync: (tripId: string) => void;
  fetchTripsFromAPI: () => Promise<void>;
  persistToLocalStorage: () => void;
  processOfflineQueue: () => Promise<void>;

  // Template actions
  saveTripAsTemplate: (tripId: string, name: string, description?: string, includeDates?: boolean) => void;
  createTripFromTemplate: (templateId: string, name: string, startDate: string, endDate: string) => Trip | null;
  deleteTemplate: (templateId: string) => void;
  updateTemplate: (templateId: string, updates: Partial<TripTemplate>) => void;
  loadTemplates: () => void;
}

type TripStore = TripState & TripActions;

// API call helper
async function apiCall(endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE', body?: unknown): Promise<Response> {
  const config: RequestInit = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) {
    config.body = JSON.stringify(body);
  }
  return fetch(endpoint, config);
}

export const useTripStore = create<TripStore>((set, get) => ({
  // Initial state
  trips: [],
  currentTripId: null,
  undoQueue: [],
  templates: [],
  offlineQueue: [],

  // Sync state - API-first by default
  cloudSyncEnabled: true, // Default to enabled for API-first
  syncStatus: 'local',
  lastSyncedAt: null,
  pendingSyncQueue: [],
  isInitialized: false,
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,

  // Trip actions
  addTrip: async (trip) => {
    // 1. Optimistic update to local state
    set((state) => ({
      trips: [...state.trips, trip]
    }));

    // 2. Save to localStorage cache
    saveToStorage(get().trips);

    // 3. Call API
    try {
      const response = await apiCall('/api/trips', 'POST', trip);
      if (!response.ok) throw new Error('Failed to create trip');

      const createdTrip = await response.json();
      // Update with server response (which has the correct ID from DB)
      set((state) => ({
        trips: state.trips.map((t) => t.id === trip.id ? createdTrip : t),
        lastSyncedAt: new Date(),
      }));
      saveToStorage(get().trips);
    } catch (error) {
      console.error('Failed to create trip in cloud, queueing for later:', error);
      // Queue for later sync if offline
      set((state) => ({
        offlineQueue: [...state.offlineQueue, {
          id: `${trip.id}-${Date.now()}`,
          action: 'create',
          data: trip,
          timestamp: new Date(),
        }],
      }));
      get().queueForSync(trip.id);
    }
  },

  setTrips: (trips) => set({ trips }),

  updateTrip: (tripId, updates) => {
    // Optimistic update
    set((state) => ({
      trips: state.trips.map((trip) =>
        trip.id === tripId ? { ...trip, ...updates, updatedAt: new Date().toISOString() } : trip
      )
    }));

    // Persist to localStorage cache
    saveToStorage(get().trips);

    // Call API (non-blocking)
    const trip = get().trips.find((t) => t.id === tripId);
    if (trip) {
      apiCall(`/api/trips/${tripId}`, 'PUT', trip).catch((error) => {
        console.error('Failed to update trip in cloud:', error);
        set((state) => ({
          offlineQueue: [...state.offlineQueue, {
            id: `${tripId}-${Date.now()}`,
            action: 'update',
            data: trip,
            timestamp: new Date(),
          }],
        }));
        get().queueForSync(tripId);
      });
    }
  },

  deleteTrip: async (tripId) => {
    // Optimistic update
    set((state) => ({
      trips: state.trips.filter((trip) => trip.id !== tripId),
      currentTripId: state.currentTripId === tripId ? null : state.currentTripId,
      pendingSyncQueue: state.pendingSyncQueue.filter((id) => id !== tripId)
    }));

    // Persist to localStorage cache
    saveToStorage(get().trips);

    // Call API
    try {
      await apiCall(`/api/trips/${tripId}`, 'DELETE');
    } catch (error) {
      console.error('Failed to delete trip from cloud:', error);
      set((state) => ({
        offlineQueue: [...state.offlineQueue, {
          id: `${tripId}-${Date.now()}`,
          action: 'delete',
          timestamp: new Date(),
        }],
      }));
    }
  },

  setCurrentTrip: (tripId) => set({ currentTripId: tripId }),

  // T024: Archive actions
  archiveTrip: (tripId) => {
    const updatedTrips = get().trips.map((trip) =>
      trip.id === tripId ? { ...trip, archived: true } : trip
    );
    set({ trips: updatedTrips });
    saveToStorage(updatedTrips);

    // Sync to cloud
    apiCall(`/api/trips/${tripId}`, 'PUT', updatedTrips.find((t) => t.id === tripId)).catch((error) => {
      console.error('Failed to archive trip in cloud:', error);
    });
  },

  unarchiveTrip: (tripId) => {
    const updatedTrips = get().trips.map((trip) =>
      trip.id === tripId ? { ...trip, archived: false } : trip
    );
    set({ trips: updatedTrips });
    saveToStorage(updatedTrips);

    // Sync to cloud
    apiCall(`/api/trips/${tripId}`, 'PUT', updatedTrips.find((t) => t.id === tripId)).catch((error) => {
      console.error('Failed to unarchive trip in cloud:', error);
    });
  },

  // Day actions
  addDay: (tripId, day) => {
    set((state) => ({
      trips: state.trips.map((trip) =>
        trip.id === tripId
          ? { ...trip, days: [...trip.days, day] }
          : trip
      )
    }));
    saveToStorage(get().trips);
  },

  updateDay: (tripId, dayId, updates) => {
    set((state) => ({
      trips: state.trips.map((trip) =>
        trip.id === tripId
          ? {
              ...trip,
              days: trip.days.map((day) =>
                day.id === dayId ? { ...day, ...updates } : day
              )
            }
          : trip
      )
    }));
    saveToStorage(get().trips);
  },

  deleteDay: (tripId, dayId) => {
    set((state) => ({
      trips: state.trips.map((trip) =>
        trip.id === tripId
          ? { ...trip, days: trip.days.filter((day) => day.id !== dayId) }
          : trip
      )
    }));
    saveToStorage(get().trips);
  },

  reorderDays: (tripId, dayIds) => {
    set((state) => ({
      trips: state.trips.map((trip) => {
        if (trip.id !== tripId) return trip;
        const dayMap = new Map(trip.days.map((d) => [d.id, d]));
        const reordered = dayIds.map((id) => dayMap.get(id)!).filter(Boolean);
        return { ...trip, days: reordered };
      })
    }));
    saveToStorage(get().trips);
  },

  // Activity actions
  addActivity: (tripId, dayId, activity) => {
    set((state) => ({
      trips: state.trips.map((trip) =>
        trip.id === tripId
          ? {
              ...trip,
              days: trip.days.map((day) =>
                day.id === dayId
                  ? { ...day, activities: [...day.activities, activity] }
                  : day
              )
            }
          : trip
      )
    }));
    saveToStorage(get().trips);
  },

  updateActivity: (tripId, dayId, activityId, updates) => {
    set((state) => ({
      trips: state.trips.map((trip) =>
        trip.id === tripId
          ? {
              ...trip,
              days: trip.days.map((day) =>
                day.id === dayId
                  ? {
                      ...day,
                      activities: day.activities.map((activity) =>
                        activity.id === activityId
                          ? { ...activity, ...updates }
                          : activity
                      )
                    }
                  : day
              )
            }
          : trip
      )
    }));
    saveToStorage(get().trips);
  },

  deleteActivity: (tripId, dayId, activityId) => {
    // Find the activity before deleting to store for undo
    let deletedActivity: Activity | null = null;
    let originalIndex = 0;

    get().trips.forEach((trip) => {
      if (trip.id === tripId) {
        trip.days.forEach((day) => {
          if (day.id === dayId) {
            const idx = day.activities.findIndex((a) => a.id === activityId);
            if (idx !== -1) {
              deletedActivity = day.activities[idx];
              originalIndex = idx;
            }
          }
        });
      }
    });

    // Only add to undo queue if we found the activity
    let newUndoQueue = get().undoQueue;
    if (deletedActivity) {
      const undoItem: UndoItem = {
        activity: deletedActivity as Activity,
        tripId,
        dayId,
        originalIndex,
        deletedAt: new Date()
      };
      newUndoQueue = [undoItem, ...get().undoQueue].slice(0, 5);
    }

    set((state) => ({
      trips: state.trips.map((trip) =>
        trip.id === tripId
          ? { ...trip, days: trip.days.map((day) =>
              day.id === dayId
                ? { ...day, activities: day.activities.filter((activity) => activity.id !== activityId) }
                : day
            ) }
          : trip
      ),
      undoQueue: newUndoQueue
    }));
    saveToStorage(get().trips);
  },

  reorderActivities: (tripId, dayId, activityIds) => {
    set((state) => ({
      trips: state.trips.map((trip) => {
        if (trip.id !== tripId) return trip;
        return {
          ...trip,
          days: trip.days.map((day) => {
            if (day.id !== dayId) return day;
            const activityMap = new Map(day.activities.map((a) => [a.id, a]));
            const reordered = activityIds.map((id) => activityMap.get(id)!).filter(Boolean);
            return { ...day, activities: reordered };
          })
        };
      })
    }));
    saveToStorage(get().trips);
  },

  moveActivityToDay: (tripId, sourceDayId, destDayId, activityId, destIndex) => {
    // If moving to same day, just reorder
    if (sourceDayId === destDayId) {
      return;
    }

    set((state) => ({
      trips: state.trips.map((trip) => {
        if (trip.id !== tripId) return trip;

        let movedActivity: Activity | null = null;

        // Find and remove activity from source day
        const updatedDays = trip.days.map((day) => {
          if (day.id === sourceDayId) {
            const activityIndex = day.activities.findIndex((a) => a.id === activityId);
            if (activityIndex !== -1) {
              movedActivity = { ...day.activities[activityIndex] };
              const newActivities = [...day.activities];
              newActivities.splice(activityIndex, 1);
              return { ...day, activities: newActivities };
            }
          }
          return day;
        });

        if (!movedActivity) return trip;

        // Add activity to destination day
        return {
          ...trip,
          days: updatedDays.map((day) => {
            if (day.id === destDayId) {
              const insertIndex = destIndex !== undefined
                ? Math.min(destIndex, day.activities.length)
                : day.activities.length;
              const newActivities = [...day.activities];
              newActivities.splice(insertIndex, 0, movedActivity!);
              // Reindex orders
              return {
                ...day,
                activities: newActivities.map((a, i) => ({ ...a, order: i }))
              };
            }
            return day;
          })
        };
      })
    }));
    saveToStorage(get().trips);
  },

  // Flight actions
  addFlight: (tripId, flight) => {
    set((state) => ({
      trips: state.trips.map((trip) =>
        trip.id === tripId
          ? { ...trip, flights: [...trip.flights, flight] }
          : trip
      )
    }));
    saveToStorage(get().trips);
  },

  updateFlight: (tripId, flightId, updates) => {
    set((state) => ({
      trips: state.trips.map((trip) =>
        trip.id === tripId
          ? {
              ...trip,
              flights: trip.flights.map((flight) =>
                flight.id === flightId ? { ...flight, ...updates } : flight
              )
            }
          : trip
      )
    }));
    saveToStorage(get().trips);
  },

  deleteFlight: (tripId, flightId) => {
    set((state) => ({
      trips: state.trips.map((trip) =>
        trip.id === tripId
          ? { ...trip, flights: trip.flights.filter((f) => f.id !== flightId) }
          : trip
      )
    }));
    saveToStorage(get().trips);
  },

  // Hotel actions
  addHotel: (tripId, hotel) => {
    set((state) => ({
      trips: state.trips.map((trip) =>
        trip.id === tripId
          ? { ...trip, hotels: [...trip.hotels, hotel] }
          : trip
      )
    }));
    saveToStorage(get().trips);
  },

  updateHotel: (tripId, hotelId, updates) => {
    set((state) => ({
      trips: state.trips.map((trip) =>
        trip.id === tripId
          ? {
              ...trip,
              hotels: trip.hotels.map((hotel) =>
                hotel.id === hotelId ? { ...hotel, ...updates } : hotel
              )
            }
          : trip
      )
    }));
    saveToStorage(get().trips);
  },

  deleteHotel: (tripId, hotelId) => {
    set((state) => ({
      trips: state.trips.map((trip) =>
        trip.id === tripId
          ? { ...trip, hotels: trip.hotels.filter((h) => h.id !== hotelId) }
          : trip
      )
    }));
    saveToStorage(get().trips);
  },

  // Packing list actions
  addPackingItem: (tripId, item) => {
    set((state) => ({
      trips: state.trips.map((trip) =>
        trip.id === tripId
          ? {
              ...trip,
              packingList: {
                items: [...(trip.packingList?.items || []), item]
              }
            }
          : trip
      )
    }));
    saveToStorage(get().trips);
  },

  updatePackingItem: (tripId, itemId, updates) => {
    set((state) => ({
      trips: state.trips.map((trip) =>
        trip.id === tripId
          ? {
              ...trip,
              packingList: {
                items: (trip.packingList?.items || []).map((item) =>
                  item.id === itemId ? { ...item, ...updates } : item
                )
              }
            }
          : trip
      )
    }));
    saveToStorage(get().trips);
  },

  deletePackingItem: (tripId, itemId) => {
    set((state) => ({
      trips: state.trips.map((trip) =>
        trip.id === tripId
          ? {
              ...trip,
              packingList: {
                items: (trip.packingList?.items || []).filter((item) => item.id !== itemId)
              }
            }
          : trip
      )
    }));
    saveToStorage(get().trips);
  },

  togglePackingItem: (tripId, itemId) => {
    set((state) => ({
      trips: state.trips.map((trip) =>
        trip.id === tripId
          ? {
              ...trip,
              packingList: {
                items: (trip.packingList?.items || []).map((item) =>
                  item.id === itemId ? { ...item, packed: !item.packed } : item
                )
              }
            }
          : trip
      )
    }));
    saveToStorage(get().trips);
  },

  initializePackingList: (tripId) => {
    set((state) => ({
      trips: state.trips.map((trip) =>
        trip.id === tripId
          ? {
              ...trip,
              packingList: {
                items: [
                  { id: crypto.randomUUID(), name: 'Passport', category: 'Documents', packed: false },
                  { id: crypto.randomUUID(), name: 'Phone charger', category: 'Electronics', packed: false },
                  { id: crypto.randomUUID(), name: 'Laptop', category: 'Electronics', packed: false },
                  { id: crypto.randomUUID(), name: 'Camera', category: 'Electronics', packed: false },
                  { id: crypto.randomUUID(), name: 'T-shirts', category: 'Clothes', packed: false },
                  { id: crypto.randomUUID(), name: 'Pants', category: 'Clothes', packed: false },
                  { id: crypto.randomUUID(), name: 'Underwear', category: 'Clothes', packed: false },
                  { id: crypto.randomUUID(), name: 'Socks', category: 'Clothes', packed: false },
                  { id: crypto.randomUUID(), name: 'Jacket', category: 'Clothes', packed: false },
                  { id: crypto.randomUUID(), name: 'Toothbrush', category: 'Toiletries', packed: false },
                  { id: crypto.randomUUID(), name: 'Toothpaste', category: 'Toiletries', packed: false },
                  { id: crypto.randomUUID(), name: 'Shampoo', category: 'Toiletries', packed: false },
                  { id: crypto.randomUUID(), name: 'Sunscreen', category: 'Toiletries', packed: false },
                  { id: crypto.randomUUID(), name: 'Wallet', category: 'Documents', packed: false },
                  { id: crypto.randomUUID(), name: 'Travel insurance', category: 'Documents', packed: false },
                  { id: crypto.randomUUID(), name: 'Medications', category: 'Toiletries', packed: false },
                  { id: crypto.randomUUID(), name: 'Sunglasses', category: 'Misc', packed: false },
                  { id: crypto.randomUUID(), name: 'Headphones', category: 'Electronics', packed: false },
                  { id: crypto.randomUUID(), name: 'Power bank', category: 'Electronics', packed: false },
                  { id: crypto.randomUUID(), name: 'Adapter/Converter', category: 'Electronics', packed: false },
                ]
              }
            }
          : trip
      )
    }));
    saveToStorage(get().trips);
  },

  // Cloud sync actions
  setCloudSyncEnabled: (enabled) => set({ cloudSyncEnabled: enabled }),

  setSyncStatus: (status) => set({ syncStatus: status }),

  syncTripToCloud: async (tripId) => {
    const trip = get().trips.find((t) => t.id === tripId);
    if (!trip) return;

    set({ syncStatus: 'syncing' });

    try {
      const response = await apiCall(`/api/trips/${tripId}`, 'PUT', trip);
      if (!response.ok) throw new Error('Sync failed');

      set({
        syncStatus: 'synced',
        lastSyncedAt: new Date(),
        pendingSyncQueue: get().pendingSyncQueue.filter((id) => id !== tripId)
      });
    } catch (error) {
      console.error('Sync error:', error);
      set({ syncStatus: 'error' });
      get().queueForSync(tripId);
    }
  },

  queueForSync: (tripId) => {
    const queue = get().pendingSyncQueue;
    if (!queue.includes(tripId)) {
      set({ pendingSyncQueue: [...queue, tripId] });
    }
  },

  // Fetch trips from API - PRIMARY load method
  fetchTripsFromAPI: async () => {
    set({ syncStatus: 'syncing' });
    try {
      const response = await apiCall('/api/trips', 'GET');
      if (!response.ok) throw new Error('Failed to fetch trips');

      const trips: Trip[] = await response.json();
      set({
        trips,
        syncStatus: 'synced',
        lastSyncedAt: new Date(),
        isInitialized: true
      });

      // Persist to localStorage as offline cache
      saveToStorage(trips);
    } catch (error) {
      console.error('Failed to fetch trips from API, falling back to localStorage:', error);

      // Fallback to localStorage cache
      const localTrips = loadFromStorage();
      set({
        trips: localTrips,
        syncStatus: 'error',
        isInitialized: true
      });

      if (localTrips.length === 0) {
        // If both API and localStorage fail, show error state
        console.error('No trips available - both API and localStorage failed');
      }
    }
  },

  // Persist current trips to localStorage (offline backup)
  persistToLocalStorage: () => {
    saveToStorage(get().trips);
  },

  // Process offline queue when back online
  processOfflineQueue: async () => {
    const { offlineQueue } = get();
    if (offlineQueue.length === 0) return;

    set({ syncStatus: 'syncing' });

    for (const item of offlineQueue) {
      try {
        switch (item.action) {
          case 'create':
            await apiCall('/api/trips', 'POST', item.data);
            break;
          case 'update':
            await apiCall(`/api/trips/${item.id}`, 'PUT', item.data);
            break;
          case 'delete':
            await apiCall(`/api/trips/${item.id}`, 'DELETE');
            break;
        }
      } catch (error) {
        console.error(`Failed to process offline action ${item.action} for trip ${item.id}:`, error);
        // Keep in queue for retry
        return;
      }
    }

    // Clear queue on success
    set({
      offlineQueue: [],
      syncStatus: 'synced',
      lastSyncedAt: new Date()
    });
  },

  // Undo actions
  undoDeleteActivity: (activity, tripId, dayId, originalIndex) => {
    // Remove from undo queue
    const newUndoQueue = get().undoQueue.filter(
      (item) => !(item.activity.id === activity.id && item.tripId === tripId)
    );

    set({
      trips: get().trips.map((trip) =>
        trip.id === tripId
          ? {
              ...trip,
              days: trip.days.map((day) => {
                if (day.id !== dayId) return day;
                const newActivities = [...day.activities];
                newActivities.splice(originalIndex, 0, activity);
                // Reindex orders
                return {
                  ...day,
                  activities: newActivities.map((a, i) => ({ ...a, order: i }))
                };
              })
            }
          : trip
      ),
      undoQueue: newUndoQueue
    });
    saveToStorage(get().trips);
  },

  clearExpiredUndoItems: () => {
    const fiveMinutesAgo = new Date(Date.now() - 300000);
    set({
      undoQueue: get().undoQueue.filter((item) => item.deletedAt > fiveMinutesAgo)
    });
  },

  clearUndoQueue: () => set({ undoQueue: [] }),

  // Template actions
  saveTripAsTemplate: (tripId, name, description, includeDates = false) => {
    const { trips, templates } = get();
    const trip = trips.find((t) => t.id === tripId);
    if (!trip) return;

    // Convert trip days to template format (strip IDs and dates)
    const templateDays: TemplateDay[] = trip.days.map((day) => ({
      activities: day.activities.map((activity) => ({
        title: activity.title,
        category: activity.category,
        startTime: activity.startTime,
        endTime: activity.endTime,
        location: activity.location ? {
          name: activity.location.name,
          address: activity.location.address,
          latitude: activity.location.latitude,
          longitude: activity.location.longitude,
          placeId: activity.location.placeId,
        } : undefined,
        notes: activity.notes,
      })),
      notes: day.notes,
    }));

    const newTemplate: TripTemplate = {
      id: crypto.randomUUID(),
      name,
      description,
      days: templateDays,
      includeDates,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newTemplates = [...templates, newTemplate];
    set({ templates: newTemplates });

    // Persist to localStorage
    localStorage.setItem('wanderlust_templates', JSON.stringify(newTemplates));
  },

  createTripFromTemplate: (templateId, name, startDate, endDate) => {
    const { templates, addTrip } = get();
    const template = templates.find((t) => t.id === templateId);
    if (!template) return null;

    // Calculate number of days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const dayCount = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // Generate days from template
    const days: Day[] = [];
    for (let i = 0; i < dayCount; i++) {
      const currentDate = new Date(start);
      currentDate.setDate(start.getDate() + i);
      const dateStr = currentDate.toISOString().split('T')[0];

      // Use template day structure (cycle through if template has fewer days)
      const templateDay = template.days[i % template.days.length];

      const activities: Activity[] = (templateDay?.activities || []).map((templateActivity, idx) => ({
        id: crypto.randomUUID(),
        title: templateActivity.title,
        category: templateActivity.category,
        startTime: templateActivity.startTime,
        endTime: templateActivity.endTime,
        location: templateActivity.location ? {
          id: crypto.randomUUID(),
          ...templateActivity.location,
        } : undefined,
        notes: templateActivity.notes,
        order: idx,
      }));

      days.push({
        id: crypto.randomUUID(),
        date: dateStr,
        activities,
        notes: templateDay?.notes,
      });
    }

    const newTrip: Trip = {
      id: crypto.randomUUID(),
      name,
      description: template.description,
      startDate,
      endDate,
      days,
      flights: [],
      hotels: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addTrip(newTrip);
    return newTrip;
  },

  deleteTemplate: (templateId) => {
    const newTemplates = get().templates.filter((t) => t.id !== templateId);
    set({ templates: newTemplates });
    localStorage.setItem('wanderlust_templates', JSON.stringify(newTemplates));
  },

  updateTemplate: (templateId, updates) => {
    const newTemplates = get().templates.map((t) =>
      t.id === templateId ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
    );
    set({ templates: newTemplates });
    localStorage.setItem('wanderlust_templates', JSON.stringify(newTemplates));
  },

  loadTemplates: () => {
    const stored = localStorage.getItem('wanderlust_templates');
    if (stored) {
      try {
        const templates = JSON.parse(stored) as TripTemplate[];
        set({ templates });
      } catch (e) {
        console.error('Failed to load templates:', e);
      }
    }
  },
}));

// Convenience hooks
export const useTrip = () => useTripStore((state) => ({
  trips: state.trips,
  currentTripId: state.currentTripId,
  currentTrip: state.trips.find((t) => t.id === state.currentTripId) || null,
}));

export const useTripActions = () => useTripStore(useShallow((state) => ({
  addTrip: state.addTrip,
  updateTrip: state.updateTrip,
  deleteTrip: state.deleteTrip,
  setCurrentTrip: state.setCurrentTrip,
  archiveTrip: state.archiveTrip,
  unarchiveTrip: state.unarchiveTrip,
  addDay: state.addDay,
  updateDay: state.updateDay,
  deleteDay: state.deleteDay,
  reorderDays: state.reorderDays,
  addActivity: state.addActivity,
  updateActivity: state.updateActivity,
  deleteActivity: state.deleteActivity,
  reorderActivities: state.reorderActivities,
  moveActivityToDay: state.moveActivityToDay,
  addFlight: state.addFlight,
  updateFlight: state.updateFlight,
  deleteFlight: state.deleteFlight,
  addHotel: state.addHotel,
  updateHotel: state.updateHotel,
  deleteHotel: state.deleteHotel,
  addPackingItem: state.addPackingItem,
  updatePackingItem: state.updatePackingItem,
  deletePackingItem: state.deletePackingItem,
  togglePackingItem: state.togglePackingItem,
  initializePackingList: state.initializePackingList,
  setCloudSyncEnabled: state.setCloudSyncEnabled,
  setSyncStatus: state.setSyncStatus,
  syncTripToCloud: state.syncTripToCloud,
  queueForSync: state.queueForSync,
  undoDeleteActivity: state.undoDeleteActivity,
  clearExpiredUndoItems: state.clearExpiredUndoItems,
  clearUndoQueue: state.clearUndoQueue,
  saveTripAsTemplate: state.saveTripAsTemplate,
  createTripFromTemplate: state.createTripFromTemplate,
  deleteTemplate: state.deleteTemplate,
  updateTemplate: state.updateTemplate,
  loadTemplates: state.loadTemplates,
})));
