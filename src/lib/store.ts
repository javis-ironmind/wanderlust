import { create } from 'zustand';
import { Trip, Day, Activity, Flight, Hotel } from './types';

interface TripState {
  trips: Trip[];
  currentTripId: string | null;
}

interface TripActions {
  // Trip actions
  addTrip: (trip: Trip) => void;
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
}

type TripStore = TripState & TripActions;

export const useTripStore = create<TripStore>((set) => ({
  // Initial state
  trips: [],
  currentTripId: null,
  
  // Trip actions
  addTrip: (trip) => set((state) => ({ 
    trips: [...state.trips, trip] 
  })),
  
  updateTrip: (tripId, updates) => set((state) => ({
    trips: state.trips.map((trip) =>
      trip.id === tripId ? { ...trip, ...updates } : trip
    )
  })),
  
  deleteTrip: (tripId) => set((state) => ({
    trips: state.trips.filter((trip) => trip.id !== tripId),
    currentTripId: state.currentTripId === tripId ? null : state.currentTripId
  })),
  
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
  addActivity: (tripId, dayId, activity) => set((state) => ({
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
  })),
  
  updateActivity: (tripId, dayId, activityId, updates) => set((state) => ({
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
  })),
  
  deleteActivity: (tripId, dayId, activityId) => set((state) => ({
    trips: state.trips.map((trip) =>
      trip.id === tripId
        ? {
            ...trip,
            days: trip.days.map((day) =>
              day.id === dayId
                ? {
                    ...day,
                    activities: day.activities.filter(
                      (activity) => activity.id !== activityId
                    )
                  }
                : day
            )
          }
        : trip
    )
  })),
  
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
}));
