/**
 * OpenStreetMap / Nominatim Place Search Provider
 * Uses the free Nominatim API for geocoding and place search
 */

import { PlaceResult, PlaceSearchProvider } from './place-search';

interface NominatimResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  type: string;
  class?: string;
}

export class OpenStreetMapSearch implements PlaceSearchProvider {
  private baseUrl = 'https://nominatim.openstreetmap.org';

  async search(query: string): Promise<PlaceResult[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'Wanderlust-Travel-Planner/1.0',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data: NominatimResult[] = await response.json();

      return data.map((result) => ({
        id: String(result.place_id),
        name: result.display_name.split(',')[0] || result.display_name,
        address: result.display_name,
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
        source: 'osm' as const,
      }));
    } catch (error) {
      console.error('OSM search error:', error);
      return [];
    }
  }

  async getDetails(placeId: string): Promise<PlaceResult> {
    try {
      const response = await fetch(
        `${this.baseUrl}/lookup?format=json&place_ids=${placeId}&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'Wanderlust-Travel-Planner/1.0',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to get place details');
      }

      const data: NominatimResult[] = await response.json();

      if (data.length === 0) {
        throw new Error('Place not found');
      }

      const result = data[0];
      return {
        id: String(result.place_id),
        name: result.display_name.split(',')[0] || result.display_name,
        address: result.display_name,
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
        source: 'osm',
      };
    } catch (error) {
      console.error('OSM getDetails error:', error);
      throw error;
    }
  }
}

// Singleton instance
let osmSearchInstance: OpenStreetMapSearch | null = null;

export function getOSMSearch(): OpenStreetMapSearch {
  if (!osmSearchInstance) {
    osmSearchInstance = new OpenStreetMapSearch();
  }
  return osmSearchInstance;
}
