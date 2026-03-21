// Share Trip functionality using URL-based sharing with localStorage permissions

import { loadFromStorage } from './storage';

const SHARED_TRIPS_KEY = 'wanderlust_shared_trips';

export type SharePermission = 'read' | 'write';

export type SharedAccess = {
  tripId: string;
  permission: SharePermission;
  sharedAt: number;
  accessCode: string;
};

export type SharedTripData = {
  tripId: string;
  accessList: {
    accessCode: string;
    permission: SharePermission;
    sharedAt: number;
  }[];
};

// Generate a simple access code
export function generateAccessCode(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

// Get shared trips from localStorage
export function getSharedTrips(): Record<string, SharedTripData> {
  if (typeof window === 'undefined') return {};
  const saved = localStorage.getItem(SHARED_TRIPS_KEY);
  return saved ? JSON.parse(saved) : {};
}

// Save shared trips to localStorage
function saveSharedTrips(data: Record<string, SharedTripData>): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SHARED_TRIPS_KEY, JSON.stringify(data));
}

// Share a trip with a new access code
export function shareTrip(tripId: string, permission: SharePermission = 'read'): string {
  const accessCode = generateAccessCode();
  const sharedTrips = getSharedTrips();
  
  if (!sharedTrips[tripId]) {
    sharedTrips[tripId] = {
      tripId,
      accessList: [],
    };
  }
  
  sharedTrips[tripId].accessList.push({
    accessCode,
    permission,
    sharedAt: Date.now(),
  });
  
  saveSharedTrips(sharedTrips);
  return accessCode;
}

// Get access list for a trip
export function getAccessList(tripId: string): SharedTripData['accessList'] {
  const sharedTrips = getSharedTrips();
  return sharedTrips[tripId]?.accessList || [];
}

// Revoke access for a specific code
export function revokeAccess(tripId: string, accessCode: string): void {
  const sharedTrips = getSharedTrips();
  if (!sharedTrips[tripId]) return;
  
  sharedTrips[tripId].accessList = sharedTrips[tripId].accessList.filter(
    (a) => a.accessCode !== accessCode
  );
  
  saveSharedTrips(sharedTrips);
}

// Validate access code and return permission level
export function validateAccessCode(tripId: string, accessCode: string): SharePermission | null {
  const sharedTrips = getSharedTrips();
  const accessList = sharedTrips[tripId]?.accessList || [];
  const found = accessList.find((a) => a.accessCode === accessCode);
  return found?.permission || null;
}

// Generate shareable URL
export function getShareableUrl(tripId: string, accessCode: string): string {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  return `${baseUrl}/trips/${tripId}?share=${accessCode}`;
}

// Check if user has write access (based on URL or local ownership)
export function hasWriteAccess(tripId: string): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check URL for share code
  const params = new URLSearchParams(window.location.search);
  const shareCode = params.get('share');
  
  if (shareCode) {
    const permission = validateAccessCode(tripId, shareCode);
    return permission === 'write';
  }
  
  // Otherwise, assume owner (localStorage trip exists)
  const trips = loadFromStorage();
  return trips.some((t) => t.id === tripId);
}
