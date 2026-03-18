// Reminder utilities for trip activities

export interface StoredReminder {
  tripId: string;
  activityId: string;
  activityTitle: string;
  reminderTime: number; // Unix timestamp
  triggered: boolean;
}

const REMINDERS_KEY = 'wanderlust_reminders';

// Get all reminders
export function getReminders(): StoredReminder[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(REMINDERS_KEY);
  return stored ? JSON.parse(stored) : [];
}

// Save reminders
function saveReminders(reminders: StoredReminder[]): void {
  localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
}

// Add a reminder for an activity
export function addReminder(
  tripId: string,
  activityId: string,
  activityTitle: string,
  activityTime: string, // ISO datetime
  minutesBefore: number
): void {
  const activityDate = new Date(activityTime).getTime();
  const reminderTime = activityDate - minutesBefore * 60 * 1000;
  
  // Don't add if already in the past
  if (reminderTime <= Date.now()) return;
  
  const reminders = getReminders();
  
  // Remove existing reminder for this activity
  const filtered = reminders.filter(r => r.activityId !== activityId);
  
  // Add new reminder
  filtered.push({
    tripId,
    activityId,
    activityTitle,
    reminderTime,
    triggered: false,
  });
  
  saveReminders(filtered);
}

// Remove reminder for an activity
export function removeReminder(activityId: string): void {
  const reminders = getReminders();
  const filtered = reminders.filter(r => r.activityId !== activityId);
  saveReminders(filtered);
}

// Get pending reminders for a trip
export function getTripReminders(tripId: string): StoredReminder[] {
  return getReminders()
    .filter(r => r.tripId === tripId && !r.triggered && r.reminderTime > Date.now())
    .sort((a, b) => a.reminderTime - b.reminderTime);
}

// Check and trigger due reminders
export function checkReminders(): StoredReminder[] {
  const reminders = getReminders();
  const now = Date.now();
  const due = reminders.filter(r => !r.triggered && r.reminderTime <= now);
  
  // Mark as triggered
  due.forEach(r => {
    const idx = reminders.findIndex(rem => rem.activityId === r.activityId);
    if (idx >= 0) {
      reminders[idx].triggered = true;
    }
  });
  saveReminders(reminders);
  
  return due;
}

// Request notification permission
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  
  if (Notification.permission === 'granted') {
    return true;
  }
  
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  
  return false;
}

// Send browser notification
export function sendNotification(title: string, body: string): void {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return;
  }
  
  if (Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: '/icon.png',
      badge: '/badge.png',
    });
  }
}

// Format reminder time for display
export function formatReminderTime(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  
  if (diff < 60 * 60 * 1000) {
    // Less than 1 hour - show minutes
    const mins = Math.round(diff / (60 * 1000));
    return mins <= 0 ? 'Now' : `In ${mins} min`;
  }
  
  if (diff < 24 * 60 * 60 * 1000) {
    // Less than 1 day - show hours
    const hours = Math.round(diff / (60 * 60 * 1000));
    return `In ${hours} hour${hours > 1 ? 's' : ''}`;
  }
  
  // Show date/time
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}
