'use client';

import { useTrip, useTripActions } from '@/lib/store';
import Image from 'next/image';
import Link from 'next/link';

export default function TripListPage() {
  const { trips } = useTrip();
  const { setCurrentTrip } = useTripActions();

  const handleTripClick = (tripId: string) => {
    setCurrentTrip(tripId);
  };

  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return `${startDate.toLocaleDateString('en-US', options)} - ${endDate.toLocaleDateString('en-US', options)}, ${endDate.getFullYear()}`;
  };

  const getDayCount = (days: number) => {
    return `${days} day${days !== 1 ? 's' : ''}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Trips</h1>
          <Link
            href="/trips/new"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            + Create Trip
          </Link>
        </div>

        {trips.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">✈️</div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No trips yet</h2>
            <p className="text-gray-500 mb-6">Start planning your next adventure!</p>
            <Link
              href="/trips/new"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Create Your First Trip
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {trips.map((trip) => (
              <Link
                key={trip.id}
                href={`/trips/${trip.id}`}
                onClick={() => handleTripClick(trip.id)}
                className="block bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
              >
                <div className="relative h-48 bg-gradient-to-br from-blue-400 to-blue-600">
                  {trip.coverImage ? (
                    <Image
                      src={trip.coverImage}
                      alt={trip.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white text-6xl opacity-50">
                      🌍
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {trip.name}
                  </h3>
                  <p className="text-gray-600 mt-1">
                    {formatDateRange(trip.startDate, trip.endDate)}
                  </p>
                  <div className="mt-3 flex items-center text-sm text-gray-500">
                    <span className="bg-gray-100 px-2 py-1 rounded">
                      {getDayCount(trip.days.length)}
                    </span>
                    {trip.flights.length > 0 && (
                      <span className="ml-2 bg-blue-50 px-2 py-1 rounded text-blue-600">
                        ✈️ {trip.flights.length}
                      </span>
                    )}
                    {trip.hotels.length > 0 && (
                      <span className="ml-2 bg-purple-50 px-2 py-1 rounded text-purple-600">
                        🏨 {trip.hotels.length}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
