'use client';

import { useParams, useRouter } from 'next/navigation';

export default function TripDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params.tripId as string;
  
  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui', maxWidth: '800px', margin: '0 auto' }}>
      <button onClick={() => router.back()} style={{ marginBottom: '1rem' }}>← Back</button>
      <h1>Trip: {tripId}</h1>
      <p>Trip detail page - building features...</p>
    </div>
  );
}
