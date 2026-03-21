'use client';

import { useState, useEffect } from 'react';

const REMINDER_OPTIONS = [
  { value: 15, label: '15 minutes before' },
  { value: 30, label: '30 minutes before' },
  { value: 60, label: '1 hour before' },
  { value: 120, label: '2 hours before' },
  { value: 1440, label: '1 day before' },
];

interface ReminderSettingsProps {
  reminder?: number;
  onChange: (minutes: number | undefined) => void;
}

export function ReminderSettings({ reminder, onChange }: ReminderSettingsProps) {
  const [isEnabled, setIsEnabled] = useState(!!reminder);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission | 'unknown'>('unknown');

  useEffect(() => {
    // Check current permission status on mount
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermissionStatus(Notification.permission);
    }
  }, []);

  const handleToggle = async (enabled: boolean) => {
    setIsEnabled(enabled);
    
    if (!enabled) {
      onChange(undefined);
      return;
    }
    
    // AC7: Request notification permission on first reminder set
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default' || Notification.permission === 'denied') {
        try {
          const permission = await Notification.requestPermission();
          setPermissionStatus(permission);
          
          if (permission !== 'granted') {
            // Permission denied - don't enable reminder
            setIsEnabled(false);
            alert('Please enable notifications in your browser settings to receive reminders.');
            return;
          }
        } catch (error) {
          console.error('Error requesting notification permission:', error);
          setIsEnabled(false);
          return;
        }
      }
    }
    
    // If we get here, permission is granted (or not available but we continue)
    if (!reminder) {
      onChange(30); // Default to 30 minutes
    }
  };

  const handleSelect = (value: number) => {
    onChange(value);
  };

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <input
          type="checkbox"
          checked={isEnabled}
          onChange={(e) => handleToggle(e.target.checked)}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        Set Reminder
        {permissionStatus === 'granted' && (
          <span className="text-xs text-green-600">🔔 Notifications enabled</span>
        )}
      </label>
      
      {isEnabled && (
        <select
          value={reminder || 30}
          onChange={(e) => handleSelect(Number(e.target.value))}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {REMINDER_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

export { REMINDER_OPTIONS };
