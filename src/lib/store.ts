import { create } from 'zustand';
import { Trip, Day, Activity, Flight, Hotel, PackingItem, TripTemplate, TemplateDay, TemplateActivity } from './types';

interface SyncState {
  cloudSyncEnabled: boolean;
  syncStatus: 'local' | 'syncing' | 'synced' | 'error';
  lastSyncedAt: Date | null;
  pendingSyncQueue: string[]; // trip IDs pending sync
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
  undoQueue: UndoItem[]; // For deleted activities
  templates: TripTemplate[]; // Saved trip templates
}

interface TripActions {
  // Trip actions
  addTrip: (trip: Trip) => void;
  setTrips: (trips: Trip[]) => void;
  updateTrip: (tripId: string, updates: Partial<Trip>) => void;
  deleteTrip: (tripId: string) => void;
  setCurrentTrip: (tripId: string | null) => void;

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

  // Template actions
  saveTripAsTemplate: (tripId: string, name: string, description?: string, includeDates?: boolean) => void;
  createTripFromTemplate: (templateId: string, name: string, startDate: string, endDate: string) => Trip | null;
  deleteTemplate: (templateId: string) => void;
  updateTemplate: (templateId: string, updates: Partial<TripTemplate>) => void;
  loadTemplates: () => void;
}

type TripStore = TripState & TripActions;

export const useTripStore = create<TripStore>((set, get) => ({
  // Initial state
  trips: [],
  currentTripId: null,

  // Undo queue for deleted activities
  undoQueue: [],

  // Templates
  templates: [],

  // Sync state
  cloudSyncEnabled: false,
  syncStatus: 'local',
  lastSyncedAt: null,
  pendingSyncQueue: [],

  // Trip actions
  addTrip: (trip) => set((state) => {
    // Auto-sync if cloud sync is enabled
    if (state.cloudSyncEnabled) {
      setTimeout(() => {
        useTripStore.getState().syncTripToCloud(trip.id);
      }, 1000);
    }
    return {
      trips: [...state.trips, trip]
    };
  }),

  setTrips: (trips) => set({ trips }),

  updateTrip: (tripId, updates) => set((state) => {
    // Auto-sync if cloud sync is enabled
    if (state.cloudSyncEnabled) {
      setTimeout(() => {
        useTripStore.getState().syncTripToCloud(tripId);
      }, 1000); // Debounce sync
    }
    return {
      trips: state.trips.map((trip) =>
        trip.id === tripId ? { ...trip, ...updates } : trip
      )
    };
  }),

  deleteTrip: (tripId) => set((state) => {
    // Remove from pending queue if present
    if (state.cloudSyncEnabled) {
      // Optionally call delete API - for now just clear from queue
      console.log('Trip deleted, clearing from sync queue:', tripId);
    }
    return {
      trips: state.trips.filter((trip) => trip.id !== tripId),
      currentTripId: state.currentTripId === tripId ? null : state.currentTripId,
      pendingSyncQueue: state.pendingSyncQueue.filter((id) => id !== tripId)
    };
  }),

  setCurrentTrip: (tripId) => set({ currentTripId: tripId }),

  // Day actions
  addDay: (tripId, day) => set((state) => ({
    trips: state.trips.map((trip) =>
      trip.id === tripId
        ? { ...trip, days: [...trip.days, day] }
        : trip
    )
  })),

  updateDay: (tripId, dayId, updates) => set((state) => ({
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
  })),

  deleteDay: (tripId, dayId) => set((state) => ({
    trips: state.trips.map((trip) =>
      trip.id === tripId
        ? { ...trip, days: trip.days.filter((day) => day.id !== dayId) }
        : trip
    )
  })),

  reorderDays: (tripId, dayIds) => set((state) => ({
    trips: state.trips.map((trip) => {
      if (trip.id !== tripId) return trip;
      const dayMap = new Map(trip.days.map((d) => [d.id, d]));
      const reordered = dayIds.map((id) => dayMap.get(id)!).filter(Boolean);
      return { ...trip, days: reordered };
    })
  })),

  // Activity actions
  addActivity: (tripId, dayId, activity) => set((state) => {
    if (state.cloudSyncEnabled) {
      setTimeout(() => useTripStore.getState().syncTripToCloud(tripId), 1000);
    }
    return {
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
    };
  }),

  updateActivity: (tripId, dayId, activityId, updates) => set((state) => {
    if (state.cloudSyncEnabled) {
      setTimeout(() => useTripStore.getState().syncTripToCloud(tripId), 1000);
    }
    return {
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
    };
  }),

  deleteActivity: (tripId, dayId, activityId) => set((state) => {
    // Find the activity before deleting to store for undo
    let deletedActivity: Activity | null = null;
    let originalIndex = 0;
    
    state.trips.forEach((trip) => {
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
    let newUndoQueue = state.undoQueue;
    if (deletedActivity) {
      const undoItem: UndoItem = {
        activity: deletedActivity as Activity,
        tripId,
        dayId,
        originalIndex,
        deletedAt: new Date()
      };
      newUndoQueue = [undoItem, ...state.undoQueue].slice(0, 5);
    }
    
    return {
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
    };
  }),

  reorderActivities: (tripId, dayId, activityIds) => set((state) => ({
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
  })),

  moveActivityToDay: (tripId, sourceDayId, destDayId, activityId, destIndex) => set((state) => {
    // If moving to same day, just reorder
    if (sourceDayId === destDayId) {
      return state;
    }

    return {
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
    };
  }),

  // Flight actions
  addFlight: (tripId, flight) => set((state) => ({
    trips: state.trips.map((trip) =>
      trip.id === tripId
        ? { ...trip, flights: [...trip.flights, flight] }
        : trip
    )
  })),

  updateFlight: (tripId, flightId, updates) => set((state) => ({
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
  })),

  deleteFlight: (tripId, flightId) => set((state) => ({
    trips: state.trips.map((trip) =>
      trip.id === tripId
        ? { ...trip, flights: trip.flights.filter((f) => f.id !== flightId) }
        : trip
    )
  })),

  // Hotel actions
  addHotel: (tripId, hotel) => set((state) => ({
    trips: state.trips.map((trip) =>
      trip.id === tripId
        ? { ...trip, hotels: [...trip.hotels, hotel] }
        : trip
    )
  })),

  updateHotel: (tripId, hotelId, updates) => set((state) => ({
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
  })),

  deleteHotel: (tripId, hotelId) => set((state) => ({
    trips: state.trips.map((trip) =>
      trip.id === tripId
        ? { ...trip, hotels: trip.hotels.filter((h) => h.id !== hotelId) }
        : trip
    )
  })),

  // Packing list actions
  addPackingItem: (tripId, item) => set((state) => ({
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
  })),

  updatePackingItem: (tripId, itemId, updates) => set((state) => ({
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
  })),

  deletePackingItem: (tripId, itemId) => set((state) => ({
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
  })),

  togglePackingItem: (tripId, itemId) => set((state) => ({
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
  })),

  initializePackingList: (tripId) => set((state) => ({
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
  })),

  // Cloud sync actions
  setCloudSyncEnabled: (enabled) => set({ cloudSyncEnabled: enabled }),

  setSyncStatus: (status) => set({ syncStatus: status }),

  syncTripToCloud: async (tripId) => {
    const state = useTripStore.getState();
    const trip = state.trips.find((t) => t.id === tripId);
    if (!trip || !state.cloudSyncEnabled) return;

    set({ syncStatus: 'syncing' });

    try {
      const response = await fetch(`/api/trips/${tripId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trip),
      });

      if (!response.ok) throw new Error('Sync failed');

      set({
        syncStatus: 'synced',
        lastSyncedAt: new Date(),
        pendingSyncQueue: state.pendingSyncQueue.filter((id) => id !== tripId)
      });
    } catch (error) {
      console.error('Sync error:', error);
      set({ syncStatus: 'error' });
    }
  },

  queueForSync: (tripId) => set((state) => ({
    pendingSyncQueue: state.pendingSyncQueue.includes(tripId)
      ? state.pendingSyncQueue
      : [...state.pendingSyncQueue, tripId]
  })),

  // Undo actions
  undoDeleteActivity: (activity, tripId, dayId, originalIndex) => set((state) => {
    // Remove from undo queue
    const newUndoQueue = state.undoQueue.filter(
      (item) => !(item.activity.id === activity.id && item.tripId === tripId)
    );
    
    return {
      trips: state.trips.map((trip) =>
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
    };
  }),

  clearExpiredUndoItems: () => set((state) => {
    const fiveSecondsAgo = new Date(Date.now() - 5000);
    return {
      undoQueue: state.undoQueue.filter((item) => item.deletedAt > fiveSecondsAgo)
    };
  }),

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

  deleteTemplate: (templateId) => set((state) => {
    const newTemplates = state.templates.filter((t) => t.id !== templateId);
    localStorage.setItem('wanderlust_templates', JSON.stringify(newTemplates));
    return { templates: newTemplates };
  }),

  updateTemplate: (templateId, updates) => set((state) => {
    const newTemplates = state.templates.map((t) =>
      t.id === templateId ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
    );
    localStorage.setItem('wanderlust_templates', JSON.stringify(newTemplates));
    return { templates: newTemplates };
  }),

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

export const useTripActions = () => useTripStore((state) => ({
  addTrip: state.addTrip,
  updateTrip: state.updateTrip,
  deleteTrip: state.deleteTrip,
  setCurrentTrip: state.setCurrentTrip,
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
}));
