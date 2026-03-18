interface OSRMRoute {
  distance: number; // meters
  duration: number; // seconds
  geometry: {
    coordinates: [number, number][];
  };
}

interface RouteResult {
  route: OSRMRoute | null;
  error?: string;
}

export async function getRoute(
  waypoints: [number, number][],
  profile: 'driving' | 'walking' | 'cycling' = 'driving'
): Promise<RouteResult> {
  if (waypoints.length < 2) {
    return { route: null, error: 'At least 2 waypoints required' };
  }

  // OSRM API expects: lon,lat format
  const coordinates = waypoints
    .map(([lat, lng]) => `${lng},${lat}`)
    .join(';');

  try {
    const response = await fetch(
      `https://router.project-osrm.org/route/v1/${profile}/${coordinates}?overview=full&geometries=geojson`
    );

    if (!response.ok) {
      throw new Error(`OSRM error: ${response.status}`);
    }

    const data = await response.json();

    if (data.code !== 'Ok' || !data.routes?.[0]) {
      return { route: null, error: data.message || 'No route found' };
    }

    return { route: data.routes[0] };
  } catch (error) {
    return {
      route: null,
      error: error instanceof Error ? error.message : 'Route calculation failed'
    };
  }
}

export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${Math.round(seconds)} sec`;
  }
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}
