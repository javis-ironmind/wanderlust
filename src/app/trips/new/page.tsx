'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NewTripPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to trips page since we now use a modal for creating trips
    router.replace('/trips');
  }, [router]);

  return null;
}
