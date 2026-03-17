'use client';

import { useParams } from 'next/navigation';

export default function TripDetailPage() {
  const params = useParams();
  const tripId = params.tripId as string;
  
  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>Trip {tripId}</h1>
      <p>Trip details coming soon...</p>
    </div>
  );
}
