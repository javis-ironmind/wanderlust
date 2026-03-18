/**
 * LocalStorage Persistence Layer for Wanderlust
 * Handles saving, loading, import/export of trip data
 */

import { Trip } from './types';

const STORAGE_KEY = 'wanderlust_trips';
const STORAGE_VERSION = '1.0';
const DEBOUNCE_MS = 500;

interface StorageData {
  trips: Trip[];
  lastSync: string;
  version: string;
}

// Save status state
export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

let saveStatusCallback: ((status: SaveStatus) => void) | null = null;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

// Register callback for save status updates
export function onSaveStatusChange(callback: (status: SaveStatus) => void) {
  saveStatusCallback = callback;
  return () => {
    saveStatusCallback = null;
  };
}

function setSaveStatus(status: SaveStatus) {
  if (saveStatusCallback) {
    saveStatusCallback(status);
  }
}

// Validate trip data structure
function validateTrips(data: unknown): data is Trip[] {
  if (!Array.isArray(data)) return false;
  
  return data.every((trip) => {
    return (
      typeof trip === 'object' &&
      trip !== null &&
      typeof trip.id === 'string' &&
      typeof trip.name === 'string' &&
      Array.isArray(trip.days)
    );
  });
}

// Generate storage data
function createStorageData(trips: Trip[]): StorageData {
  return {
    trips,
    lastSync: new Date().toISOString(),
    version: STORAGE_VERSION,
  };
}

// Debounced save function
export function saveToStorage(trips: Trip[]): void {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }
  
  setSaveStatus('saving');
  
  debounceTimer = setTimeout(() => {
    try {
      const data = createStorageData(trips);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setSaveStatus('saved');
      
      // Reset to idle after 2 seconds
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
      setSaveStatus('error');
    }
  }, DEBOUNCE_MS);
}

// Load trips from localStorage
export function loadFromStorage(): Trip[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    
    const data = JSON.parse(raw) as StorageData;
    
    // Handle version migrations if needed
    if (data.version && data.version !== STORAGE_VERSION) {
      console.warn(`Storage version mismatch: ${data.version} vs ${STORAGE_VERSION}`);
    }
    
    if (!validateTrips(data.trips)) {
      console.error('Invalid trip data in localStorage');
      return [];
    }
    
    return data.trips;
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return [];
  }
}

// Export trips as JSON file
export function exportTrips(trips: Trip[]): void {
  try {
    const data = createStorageData(trips);
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `wanderlust-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to export trips:', error);
    throw error;
  }
}

// Import trips from JSON file
export async function importTrips(file: File): Promise<Trip[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content) as StorageData;
        
        // Validate structure
        if (!data.trips || !validateTrips(data.trips)) {
          reject(new Error('Invalid JSON structure. Expected trip data.'));
          return;
        }
        
        resolve(data.trips);
      } catch {
        reject(new Error('Failed to parse JSON file. File may be corrupted.'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file.'));
    };
    
    reader.readAsText(file);
  });
}

// Setup cross-tab synchronization
export function setupCrossTabSync(onTripsChange: (trips: Trip[]) => void): () => void {
  const handleStorageChange = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    
    // If data was deleted, clear trips
    if (event.newValue === null) {
      onTripsChange([]);
      return;
    }
    
    try {
      const data = JSON.parse(event.newValue) as StorageData;
      if (validateTrips(data.trips)) {
        onTripsChange(data.trips);
      }
    } catch (error) {
      console.error('Failed to sync from cross-tab:', error);
    }
  };
  
  window.addEventListener('storage', handleStorageChange);
  
  return () => {
    window.removeEventListener('storage', handleStorageChange);
  };
}

// Clear all storage
export function clearStorage(): void {
  localStorage.removeItem(STORAGE_KEY);
  setSaveStatus('idle');
}

// Get storage info
export function getStorageInfo(): { size: number; tripCount: number } {
  const raw = localStorage.getItem(STORAGE_KEY);
  const size = raw ? new Blob([raw]).size : 0;
  const trips = loadFromStorage();
  return {
    size,
    tripCount: trips.length,
  };
}
