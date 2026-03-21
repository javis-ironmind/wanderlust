/**
 * Place Search Provider Interface
 * Abstraction for location search providers (OSM, Google Places, Yelp, etc.)
 */

export interface PlaceResult {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  placeId?: string; // For Google Places
  source: 'osm' | 'google' | 'yelp';
}

export interface PlaceSearchProvider {
  search(query: string): Promise<PlaceResult[]>;
  getDetails(placeId: string): Promise<PlaceResult>;
}
