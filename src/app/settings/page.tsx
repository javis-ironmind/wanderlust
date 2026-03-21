'use client';

import { useState, useEffect, useCallback } from 'react';
import { Navigation } from '@/components/Navigation';
import { BottomNav } from '@/components/BottomNav';
import { useTripStore } from '@/lib/store';
import { clearStorage, getStorageInfo } from '@/lib/storage';
import {
  Cloud, CloudOff, RefreshCw, Trash2, CheckCircle, AlertCircle,
  ArrowLeft, Database, HardDrive, Clock, Settings2
} from 'lucide-react';

export default function SettingsPage() {
  const syncStatus = useTripStore((state) => state.syncStatus);
  const lastSyncedAt = useTripStore((state) => state.lastSyncedAt);
  const pendingSyncQueue = useTripStore((state) => state.pendingSyncQueue);
  const cloudSyncEnabled = useTripStore((state) => state.cloudSyncEnabled);
  const setCloudSyncEnabled = useTripStore((state) => state.setCloudSyncEnabled);
  const fetchTripsFromAPI = useTripStore((state) => state.fetchTripsFromAPI);
  const persistToLocalStorage = useTripStore((state) => state.persistToLocalStorage);

  const [storageInfo, setStorageInfo] = useState({ size: 0, tripCount: 0 });
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setStorageInfo(getStorageInfo());
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

  const handleSync = useCallback(async () => {
    setIsSyncing(true);
    await fetchTripsFromAPI();
    setIsSyncing(false);
  }, [fetchTripsFromAPI]);

  const handleClearCache = useCallback(() => {
    clearStorage();
    setStorageInfo({ size: 0, tripCount: 0 });
    setShowClearConfirm(false);
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatLastSync = (date: Date | null) => {
    if (!date) return 'Never';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#f4faff] flex items-center justify-center">
        <p className="text-secondary">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4faff]">
      <Navigation />

      <main className="pt-28 pb-32 px-6 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <a
            href="/trips"
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </a>
          <div className="flex items-center gap-3">
            <Settings2 className="w-6 h-6 text-[#9b3f25]" />
            <h1 className="font-serif text-3xl text-[#0e1d25]">Settings</h1>
          </div>
        </div>

        {/* Sync Status Section */}
        <section className="bg-white rounded-2xl editorial-shadow border border-[#ddc0b9]/20 p-6 mb-6">
          <h2 className="font-serif text-xl text-[#0e1d25] mb-4 flex items-center gap-2">
            <Cloud className="w-5 h-5 text-[#9b3f25]" />
            Cloud Sync
          </h2>

          {/* Status Indicator */}
          <div className="flex items-center justify-between p-4 bg-[#f4faff] rounded-xl mb-4">
            <div className="flex items-center gap-3">
              {syncStatus === 'synced' ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : syncStatus === 'error' ? (
                <AlertCircle className="w-5 h-5 text-red-600" />
              ) : syncStatus === 'syncing' ? (
                <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
              ) : (
                <CloudOff className="w-5 h-5 text-slate-400" />
              )}
              <div>
                <p className="font-medium text-[#0e1d25]">
                  {syncStatus === 'synced' && 'All changes synced'}
                  {syncStatus === 'syncing' && 'Syncing...'}
                  {syncStatus === 'error' && 'Sync failed'}
                  {syncStatus === 'local' && 'Local only'}
                </p>
                <p className="text-xs text-slate-500">
                  {lastSyncedAt ? `Last synced ${formatLastSync(lastSyncedAt)}` : 'Not yet synced'}
                </p>
              </div>
            </div>

            {!isOnline && (
              <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                Offline
              </span>
            )}
          </div>

          {/* Pending Sync Count */}
          {pendingSyncQueue.length > 0 && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg mb-4">
              <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
              <p className="text-sm text-blue-700">
                {pendingSyncQueue.length} change{pendingSyncQueue.length > 1 ? 's' : ''} pending sync
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleSync}
              disabled={!isOnline || isSyncing}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#9b3f25] text-white rounded-xl font-medium hover:bg-[#8a3620] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </button>
          </div>

          <p className="text-xs text-slate-500 mt-3 text-center">
            Cloud sync uses Supabase to store your trips. Data is encrypted in transit.
          </p>
        </section>

        {/* Storage Section */}
        <section className="bg-white rounded-2xl editorial-shadow border border-[#ddc0b9]/20 p-6 mb-6">
          <h2 className="font-serif text-xl text-[#0e1d25] mb-4 flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-[#9b3f25]" />
            Local Storage
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-[#f4faff] rounded-xl">
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-slate-500" />
                <div>
                  <p className="font-medium text-[#0e1d25]">Cache Size</p>
                  <p className="text-xs text-slate-500">
                    {storageInfo.tripCount} trip{storageInfo.tripCount !== 1 ? 's' : ''} stored
                  </p>
                </div>
              </div>
              <span className="text-sm font-medium text-slate-600">
                {formatBytes(storageInfo.size)}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-[#f4faff] rounded-xl">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-slate-500" />
                <div>
                  <p className="font-medium text-[#0e1d25]">Offline Access</p>
                  <p className="text-xs text-slate-500">
                    {storageInfo.tripCount > 0
                      ? 'Your trips are available offline'
                      : 'No cached data'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Clear Cache */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            <button
              onClick={() => setShowClearConfirm(true)}
              disabled={storageInfo.size === 0}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Clear Local Cache
            </button>
          </div>

          {showClearConfirm && (
            <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-200">
              <p className="text-sm text-red-800 mb-3">
                This will remove cached data from this device. Your trips are still saved in the cloud.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 px-4 py-2 border border-red-200 text-red-700 rounded-lg font-medium hover:bg-red-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearCache}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  Clear Cache
                </button>
              </div>
            </div>
          )}
        </section>

        {/* About Section */}
        <section className="bg-white rounded-2xl editorial-shadow border border-[#ddc0b9]/20 p-6">
          <h2 className="font-serif text-xl text-[#0e1d25] mb-4">About</h2>
          <div className="space-y-2 text-sm text-slate-600">
            <p><strong>Wanderer</strong> - Your Travel Journal</p>
            <p>Version 1.0.0</p>
            <p className="text-xs text-slate-400 mt-4">
              Trips are automatically synced to the cloud when online.
              When offline, changes are stored locally and synced when connection is restored.
            </p>
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
