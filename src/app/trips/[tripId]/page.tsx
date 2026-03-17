'use client';

import { useState, useEffect } from 'react';
import { useTrip, useTripActions } from '@/lib/store';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';

// Loading skeleton component
function DaySkeleton() {
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-32 mb-3"></div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>
    </div>
  );
}

function ActivitySkeleton() {
  return (
    <div className="bg-gray-50 rounded-lg p-3 animate-pulse">
      <div className="h-5 bg-gray-200 rounded w-48 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-32"></div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <DaySkeleton />
      <DaySkeleton />
      <ActivitySkeleton />
      <ActivitySkeleton />
    </div>
  );
}

export default function TripDetailPage() {
  const params = useParams();
  const tripId = params.tripId as string;
  
  const { trips, currentTripId } = useTrip();
  const { setCurrentTrip, addDay } = useTripActions();
  
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);
  
  // Set current trip on mount
  useEffect(() => {
    if (tripId) {
      setCurrentTrip(tripId);
    }
  }, [tripId, setCurrentTrip]);
  
  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);
  
  const trip = trips.find(t => t.id === tripId);
  
  // Set first day as selected when trip loads
  useEffect(() => {
    if (trip && trip.days.length > 0 && !selectedDayId) {
      setSelectedDayId(trip.days[0].id);
    }
  }, [trip, selectedDayId]);
  
  if (!trip) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Trip not found</h1>
          <Link href="/trips" className="text-blue-600 hover:underline">
            Back to My Trips
          </Link>
        </div>
      </div>
    );
  }
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };
  
  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return `${startDate.toLocaleDateString('en-US', options)} - ${endDate.toLocaleDateString('en-US', options)}, ${endDate.getFullYear()}`;
  };
  
  const handleAddDay = () => {
    const newDayNumber = trip.days.length + 1;
    const newDayDate = new Date(trip.startDate);
    newDayDate.setDate(newDayDate.getDate() + (newDayNumber - 1));
    
    addDay(trip.id, {
      id: `day-${Date.now()}`,
      date: newDayDate.toISOString().split('T')[0],
      activities: [],
    });
  };
  
  const getCategoryEmoji = (category: string) => {
    const emojis: Record<string, string> = {
      flight: '✈️',
      hotel: '🏨',
      restaurant: '🍽️',
      attraction: '🎭',
      activity: '🎯',
      transport: '🚗',
      shopping: '🛍️',
      entertainment: '🎬',
      other: '📌',
    };
    return emojis[category] || '📌';
  };
  
  const selectedDay = trip.days.find(d => d.id === selectedDayId);
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="relative h-64 bg-gradient-to-br from-blue-400 to-blue-600">
        {trip.coverImage && (
          <Image
            src={trip.coverImage}
            alt={trip.name}
            fill
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute top-4 left-4">
          <Link
            href="/trips"
            className="inline-flex items-center text-white/90 hover:text-white bg-black/20 hover:bg-black/40 px-3 py-2 rounded-lg transition-colors"
          >
            ← Back to Trips
          </Link>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h1 className="text-4xl font-bold mb-2">{trip.name}</h1>
          <p className="text-lg text-white/90">{formatDateRange(trip.startDate, trip.endDate)}</p>
        </div>
      </div>
      
      {/* Main Content - Two Column Layout */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Itinerary (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Day Navigation Tabs */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Itinerary</h2>
                <button
                  onClick={handleAddDay}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                >
                  + Add Day
                </button>
              </div>
              
              {isLoading ? (
                <LoadingSkeleton />
              ) : trip.days.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No days added yet.</p>
                  <button
                    onClick={handleAddDay}
                    className="mt-2 text-blue-600 hover:underline"
                  >
                    Add your first day
                  </button>
                </div>
              ) : (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {trip.days.map((day, index) => (
                    <button
                      key={day.id}
                      onClick={() => setSelectedDayId(day.id)}
                      className={`flex-shrink-0 px-4 py-2 rounded-lg font-medium transition-colors ${
                        selectedDayId === day.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <span className="block text-sm">Day {index + 1}</span>
                      <span className="block text-xs opacity-75">{formatDate(day.date)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Selected Day Activities */}
            {selectedDay && (
              <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Day {trip.days.indexOf(selectedDay) + 1}
                    </h3>
                    <p className="text-sm text-gray-500">{formatDate(selectedDay.date)}</p>
                  </div>
                  <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors text-sm">
                    + Add Activity
                  </button>
                </div>
                
                {isLoading ? (
                  <div className="space-y-2">
                    <ActivitySkeleton />
                    <ActivitySkeleton />
                  </div>
                ) : selectedDay.activities.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    <p>No activities for this day yet.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedDay.activities
                      .sort((a, b) => a.order - b.order)
                      .map((activity) => (
                        <div
                          key={activity.id}
                          className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                        >
                          <span className="text-xl">{getCategoryEmoji(activity.category)}</span>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 truncate">
                              {activity.title}
                            </h4>
                            {activity.startTime && (
                              <p className="text-sm text-gray-500">
                                {activity.startTime}
                                {activity.endTime && ` - ${activity.endTime}`}
                              </p>
                            )}
                            {activity.location && (
                              <p className="text-sm text-gray-500 truncate">
                                📍 {activity.location.name}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}
            
            {/* Flights Section */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">✈️ Flights</h2>
                <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors text-sm">
                  + Add Flight
                </button>
              </div>
              
              {trip.flights.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No flights added yet.</p>
              ) : (
                <div className="space-y-3">
                  {trip.flights.map((flight) => (
                    <div
                      key={flight.id}
                      className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg"
                    >
                      <span className="text-2xl">✈️</span>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {flight.airline} {flight.flightNumber}
                        </p>
                        <p className="text-sm text-gray-600">
                          {flight.departureCity} ({flight.departureAirport}) → {flight.arrivalCity} ({flight.arrivalAirport})
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(flight.departureTime).toLocaleString()}
                        </p>
                      </div>
                      {flight.confirmationNumber && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {flight.confirmationNumber}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Hotels Section */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">🏨 Hotels</h2>
                <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors text-sm">
                  + Add Hotel
                </button>
              </div>
              
              {trip.hotels.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No hotels added yet.</p>
              ) : (
                <div className="space-y-3">
                  {trip.hotels.map((hotel) => (
                    <div
                      key={hotel.id}
                      className="flex items-center gap-4 p-3 bg-purple-50 rounded-lg"
                    >
                      <span className="text-2xl">🏨</span>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{hotel.name}</p>
                        <p className="text-sm text-gray-600">{hotel.address}</p>
                        <p className="text-sm text-gray-500">
                          Check-in: {hotel.checkInDate} → Check-out: {hotel.checkOutDate}
                        </p>
                      </div>
                      {hotel.confirmationNumber && (
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                          {hotel.confirmationNumber}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Right Column - Map (1/3) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-4 sticky top-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">🗺️ Map</h2>
              <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <span className="text-4xl block mb-2">🗺️</span>
                  <p>Map view coming soon</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
