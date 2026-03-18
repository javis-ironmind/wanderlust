'use client';

import { useState } from 'react';

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

  const handleToggle = (enabled: boolean) => {
    setIsEnabled(enabled);
    if (!enabled) {
      onChange(undefined);
    } else if (!reminder) {
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
