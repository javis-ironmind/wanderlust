// components/CloudSyncSettings.tsx - Cloud sync toggle and status
'use client';

import { useTripStore } from '@/lib/store';
import SyncStatusIndicator from './SyncStatus';

export default function CloudSyncSettings() {
  const { 
    cloudSyncEnabled, 
    syncStatus, 
    lastSyncedAt, 
    setCloudSyncEnabled, 
    pendingSyncQueue 
  } = useTripStore();
  
  const handleToggle = (enabled: boolean) => {
    setCloudSyncEnabled(enabled);
    if (enabled && pendingSyncQueue.length > 0) {
      // Trigger sync for pending items when enabling
      console.log('Syncing pending items:', pendingSyncQueue);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">Cloud Sync</h3>
          <p className="text-sm text-gray-500">
            {cloudSyncEnabled 
              ? 'Your trips are synced to the cloud' 
              : 'Your trips are stored locally only'}
          </p>
        </div>
        
        <SyncStatusIndicator
          status={cloudSyncEnabled ? syncStatus : 'local'}
          lastSyncedAt={lastSyncedAt}
          isCloudSyncEnabled={cloudSyncEnabled}
          onToggleSync={handleToggle}
        />
      </div>
      
      {pendingSyncQueue.length > 0 && cloudSyncEnabled && (
        <div className="mt-3 p-2 bg-amber-50 rounded text-sm text-amber-700">
          {pendingSyncQueue.length} trip(s) pending sync
        </div>
      )}
    </div>
  );
}
