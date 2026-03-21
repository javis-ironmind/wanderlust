'use client';

import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useTripStore } from '@/lib/store';
import { useEffect, useState } from 'react';

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [mounted, setMounted] = useState(false);
  const pendingSyncQueue = useTripStore((state) => state.pendingSyncQueue);
  const syncStatus = useTripStore((state) => state.syncStatus);

  useEffect(() => {
    setMounted(true);
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!mounted) return null;

  // Don't show if everything is fine
  if (isOnline && syncStatus === 'synced' && pendingSyncQueue.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-8 md:w-80 z-50">
      <div
        className={`rounded-xl shadow-lg p-4 flex items-center gap-3 ${
          !isOnline
            ? 'bg-amber-50 border border-amber-200'
            : pendingSyncQueue.length > 0
            ? 'bg-blue-50 border border-blue-200'
            : 'bg-green-50 border border-green-200'
        }`}
      >
        {!isOnline ? (
          <WifiOff className="w-5 h-5 text-amber-600 flex-shrink-0" />
        ) : pendingSyncQueue.length > 0 ? (
          <RefreshCw className="w-5 h-5 text-blue-600 flex-shrink-0 animate-spin" />
        ) : (
          <Wifi className="w-5 h-5 text-green-600 flex-shrink-0" />
        )}

        <div className="flex-1 min-w-0">
          <p className={`font-medium text-sm ${
            !isOnline ? 'text-amber-800' : pendingSyncQueue.length > 0 ? 'text-blue-800' : 'text-green-800'
          }`}>
            {!isOnline
              ? 'You are offline'
              : pendingSyncQueue.length > 0
              ? `Syncing... ${pendingSyncQueue.length} pending`
              : 'Back online'}
          </p>
          {pendingSyncQueue.length > 0 && isOnline && (
            <p className="text-xs text-blue-600 mt-0.5">
              Changes will sync when connection is stable
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
