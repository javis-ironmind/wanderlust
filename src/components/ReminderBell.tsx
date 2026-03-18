'use client';

import { useState, useEffect } from 'react';
import { getTripReminders, formatReminderTime, requestNotificationPermission, checkReminders, sendNotification } from '@/lib/reminders';

interface ReminderBellProps {
  tripId: string;
}

export function ReminderBell({ tripId }: ReminderBellProps) {
  const [reminders, setReminders] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  
  // Load reminders and check periodically
  useEffect(() => {
    const loadReminders = () => {
      const tripReminders = getTripReminders(tripId);
      setReminders(tripReminders);
    };
    
    // Check notification permission
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setHasPermission(Notification.permission === 'granted');
    }
    
    loadReminders();
    
    // Check for due reminders every minute
    const interval = setInterval(() => {
      const due = checkReminders();
      due.forEach(r => {
        sendNotification(
          '⏰ Trip Reminder',
          `${r.activityTitle} is starting soon!`
        );
      });
      loadReminders();
    }, 60000);
    
    return () => clearInterval(interval);
  }, [tripId]);
  
  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermission();
    setHasPermission(granted);
  };
  
  if (reminders.length === 0) return null;
  
  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
          padding: '0.4rem 0.6rem',
          background: 'rgba(239, 68, 68, 0.2)',
          border: 'none',
          borderRadius: '6px',
          color: '#fca5a5',
          fontSize: '0.8rem',
          cursor: 'pointer',
          position: 'relative',
        }}
        title="Upcoming reminders"
      >
        🔔
        {reminders.length > 0 && (
          <span style={{
            position: 'absolute',
            top: '-4px',
            right: '-4px',
            background: '#ef4444',
            color: 'white',
            borderRadius: '50%',
            width: '16px',
            height: '16px',
            fontSize: '0.65rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {reminders.length}
          </span>
        )}
      </button>
      
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: '0.5rem',
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          minWidth: '200px',
          maxHeight: '250px',
          overflow: 'auto',
          zIndex: 100,
        }}>
          <div style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>
            <span style={{ fontWeight: '600', fontSize: '0.875rem', color: '#1e3a5f' }}>
              Upcoming Reminders
            </span>
          </div>
          
          {!hasPermission && (
            <div style={{ padding: '0.75rem', background: '#fef3c7', borderBottom: '1px solid #fcd34d' }}>
              <button
                onClick={handleRequestPermission}
                style={{
                  background: '#f59e0b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                }}
              >
                Enable Notifications
              </button>
            </div>
          )}
          
          {reminders.length === 0 ? (
            <div style={{ padding: '1rem', textAlign: 'center', color: '#94a3b8' }}>
              No upcoming reminders
            </div>
          ) : (
            reminders.map((r, idx) => (
              <div
                key={r.activityId}
                style={{
                  padding: '0.5rem 0.75rem',
                  borderBottom: idx < reminders.length - 1 ? '1px solid #f1f5f9' : 'none',
                }}
              >
                <div style={{ fontWeight: '500', fontSize: '0.8rem', color: '#1e3a5f' }}>
                  {r.activityTitle}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                  {formatReminderTime(r.reminderTime)}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
