'use client';

import { useEffect, useCallback } from 'react';
import { useTripStore } from '@/lib/store';
import { 
  loadFromStorage, 
  saveToStorage, 
  setupCrossTabSync,
  importTrips,
  Trip 
} from '@/lib/storage';

export function usePersistence() {
  const trips = useTripStore((state) => state.trips);
  const setTrips = useTripStore((state) => state.setTrips);
  const addTrip = useTripStore((state) => state.addTrip);
  
  // Load trips from localStorage on mount
  useEffect(() => {
    const loadedTrips = loadFromStorage();
    if (loadedTrips.length > 0) {
      setTrips(loadedTrips);
    }
  }, [setTrips]);
  
  // Save trips to localStorage whenever they change
  useEffect(() => {
    if (trips.length > 0) {
      saveToStorage(trips);
    }
  }, [trips]);
  
  // Setup cross-tab synchronization
  useEffect(() => {
    const cleanup = setupCrossTabSync((newTrips) => {
      // Only update if the data actually changed
      const currentTripIds = new Set(trips.map(t => t.id));
      const newTripIds = new Set(newTrips.map(t => t.id));
      
      let hasChanges = false;
      for (const id of newTripIds) {
        if (!currentTripIds.has(id)) {
          hasChanges = true;
          break;
        }
      }
      
      if (hasChanges || newTrips.length !== trips.length) {
        setTrips(newTrips);
      }
    });
    
    return cleanup;
  }, [trips, setTrips]);
  
  // Import trips (merge with existing)
  const importAndMerge = useCallback(async (file: File) => {
    const importedTrips = await importTrips(file);
    const existingIds = new Set(trips.map(t => t.id));
    
    // Only add trips that don't already exist
    const newTrips = importedTrips.filter(t => !existingIds.has(t.id));
    
    newTrips.forEach(trip => addTrip(trip));
    
    return newTrips.length;
  }, [trips, addTrip]);
  
  // Replace all trips (for import with merge option)
  const replaceAllTrips = useCallback((newTrips: Trip[]) => {
    setTrips(newTrips);
  }, [setTrips]);
  
  return {
    importAndMerge,
    replaceAllTrips,
  };
}
