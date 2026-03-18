// components/SyncStatus.tsx - Cloud sync status indicator
'use client';

import { useState, useEffect } from 'react';
import { Cloud, CloudOff, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

type SyncStatus = 'local' | 'syncing' | 'synced' | 'error';

interface SyncStatusIndicatorProps {
  status: SyncStatus;
  lastSyncedAt?: Date | string | null;
  onToggleSync?: (enabled: boolean) => void;
  isCloudSyncEnabled?: boolean;
}

export default function SyncStatusIndicator({
  status,
  lastSyncedAt,
  onToggleSync,
  isCloudSyncEnabled = false
}: SyncStatusIndicatorProps) {
  const [isOnline, setIsOnline] = useState(true);
  
  useEffect(() => {
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
  
  const getStatusConfig = () => {
    switch (status) {
      case 'synced':
        return {
          icon: <CheckCircle className="w-4 h-4 text-green-500" />,
          label: 'Synced',
          color: 'text-green-600 bg-green-50'
        };
      case 'syncing':
        return {
          icon: <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />,
          label: 'Syncing...',
          color: 'text-blue-600 bg-blue-50'
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-4 h-4 text-red-500" />,
          label: 'Sync Error',
          color: 'text-red-600 bg-red-50'
        };
      default:
        return {
          icon: <CloudOff className="w-4 h-4 text-gray-400" />,
          label: 'Local Only',
          color: 'text-gray-500 bg-gray-50'
        };
    }
  };
  
  const config = getStatusConfig();
  
  const formatLastSynced = () => {
    if (!lastSyncedAt) return null;
    const date = new Date(lastSyncedAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };
  
  return (
    <div className="flex items-center gap-2">
      {/* Status Badge */}
      <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.icon}
        <span>{config.label}</span>
      </div>
      
      {/* Offline Indicator */}
      {!isOnline && (
        <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-orange-600 bg-orange-50">
          <CloudOff className="w-3 h-3" />
          <span>Offline</span>
        </div>
      )}
      
      {/* Last Synced Time */}
      {status === 'synced' && lastSyncedAt && (
        <span className="text-xs text-gray-400">
          {formatLastSynced()}
        </span>
      )}
      
      {/* Toggle Switch */}
      {onToggleSync && (
        <button
          onClick={() => onToggleSync(!isCloudSyncEnabled)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            isCloudSyncEnabled ? 'bg-blue-600' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isCloudSyncEnabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      )}
    </div>
  );
}
