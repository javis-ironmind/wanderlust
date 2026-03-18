'use client';

import { Calendar } from 'lucide-react';
import { useState } from 'react';

type Activity = {
  id: string;
  title: string;
  category?: string;
  startTime?: string;
  endTime?: string;
  location?: {
    name?: string;
  };
  notes?: string;
};

type Day = {
  id: string;
  date: string;
  activities: Activity[];
};

type Trip = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  days: Day[];
  flights: any[];
  hotels: any[];
};

function formatDateForICal(dateStr: string, timeStr?: string): string {
  if (timeStr) {
    const combined = `${dateStr}T${timeStr}:00`;
    return combined.replace(/[-:]/g, '').replace('T', 'T');
  }
  return dateStr.replace(/-/g, '');
}

function generateICS(trip: Trip): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Wanderlust//Travel Planner//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'TZID:UTC',
  ];

  // Add activities as events
  trip.days.forEach((day) => {
    day.activities.forEach((activity) => {
      const startDate = activity.startTime 
        ? formatDateForICal(day.date, activity.startTime)
        : formatDateForICal(day.date);
      const endDate = activity.endTime 
        ? formatDateForICal(day.date, activity.endTime)
        : formatDateForICal(day.date);

      lines.push('BEGIN:VEVENT');
      lines.push(`UID:${activity.id}@wanderlust`);
      lines.push(`DTSTART:${startDate}`);
      lines.push(`DTEND:${endDate}`);
      lines.push(`SUMMARY:${activity.title}`);
      if (activity.location?.name) {
        lines.push(`LOCATION:${activity.location.name}`);
      }
      if (activity.notes) {
        lines.push(`DESCRIPTION:${activity.notes.replace(/\n/g, '\\n')}`);
      }
      lines.push('END:VEVENT');
    });
  });

  // Add flights as events
  trip.flights?.forEach((flight) => {
    if (flight.departure?.time && flight.arrival?.time) {
      const depTime = new Date(flight.departure.time).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      const arrTime = new Date(flight.arrival.time).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      
      lines.push('BEGIN:VEVENT');
      lines.push(`UID:flight-${flight.id}@wanderlust`);
      lines.push(`DTSTART:${depTime}`);
      lines.push(`DTEND:${arrTime}`);
      lines.push(`SUMMARY:✈️ ${flight.airline} ${flight.flightNumber}`);
      if (flight.departure?.airport) {
        lines.push(`LOCATION:${flight.departure.airport}`);
      }
      if (flight.confirmationNumber) {
        lines.push(`DESCRIPTION:Confirmation: ${flight.confirmationNumber}`);
      }
      lines.push('END:VEVENT');
    }
  });

  // Add hotels as events
  trip.hotels?.forEach((hotel) => {
    if (hotel.checkIn && hotel.checkOut) {
      const checkIn = hotel.checkIn.split('T')[0].replace(/-/g, '');
      const checkOut = hotel.checkOut.split('T')[0].replace(/-/g, '');
      
      lines.push('BEGIN:VEVENT');
      lines.push(`UID:hotel-${hotel.id}@wanderlust`);
      lines.push(`DTSTART;VALUE=DATE:${checkIn}`);
      lines.push(`DTEND;VALUE=DATE:${checkOut}`);
      lines.push(`SUMMARY:🏨 Hotel Check-in: ${hotel.name}`);
      if (hotel.address) {
        lines.push(`LOCATION:${hotel.address}`);
      }
      if (hotel.confirmationNumber) {
        lines.push(`DESCRIPTION:Confirmation: ${hotel.confirmationNumber}`);
      }
      lines.push('END:VEVENT');
    }
  });

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

function generateGoogleCalendarUrl(trip: Trip): string {
  const baseUrl = 'https://calendar.google.com/calendar/render?action=TEMPLATE';
  
  // Use trip dates for the calendar
  const startDate = trip.startDate?.replace(/-/g, '') || '';
  const endDate = trip.endDate?.replace(/-/g, '') || '';
  
  const params = new URLSearchParams({
    text: `🗺️ ${trip.name}`,
    dates: `${startDate}/${endDate}`,
    details: `Travel trip planned with Wanderlust\n${trip.days?.length || 0} days\n${trip.days?.reduce((acc, d) => acc + d.activities.length, 0) || 0} activities`,
  });

  return `${baseUrl}&${params.toString()}`;
}

export default function CalendarExport({ trip }: { trip: Trip }) {
  const [showDropdown, setShowDropdown] = useState(false);

  const handleExportICS = () => {
    const icsContent = generateICS(trip);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${trip.name.replace(/\s+/g, '_')}_itinerary.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setShowDropdown(false);
  };

  const handleGoogleCalendar = () => {
    const url = generateGoogleCalendarUrl(trip);
    window.open(url, '_blank');
    setShowDropdown(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
      >
        <Calendar className="w-4 h-4" />
        Export Calendar
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <button
            onClick={handleExportICS}
            className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center gap-3 rounded-t-lg"
          >
            <span className="text-lg">📅</span>
            <div>
              <div className="font-medium">Download .ics</div>
              <div className="text-xs text-gray-500">Apple Calendar, Outlook</div>
            </div>
          </button>
          <button
            onClick={handleGoogleCalendar}
            className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center gap-3 rounded-b-lg"
          >
            <span className="text-lg">🗓️</span>
            <div>
              <div className="font-medium">Google Calendar</div>
              <div className="text-xs text-gray-500">Open in browser</div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
