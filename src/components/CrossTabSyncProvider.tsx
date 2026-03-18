'use client';

import { useEffect } from 'react';
import { useTripStore } from '@/lib/store';
import { setupCrossTabSync } from '@/lib/storage';

export function CrossTabSyncProvider() {
  useEffect(() => {
    const unsubscribe = setupCrossTabSync((trips) => {
      useTripStore.getState().setTrips(trips);
    });
    return unsubscribe;
  }, []);

  return null;
}
