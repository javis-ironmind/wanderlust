'use client';

import { MapContainer, TileLayer, ZoomControl, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState, useMemo } from 'react';
import L from 'leaflet';

// Fix for default marker icons in Leaflet with Next.js
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = defaultIcon;

// Category colors for pins
const CATEGORY_COLORS: Record<string, string> = {
  flight: '#3B82F6',      // blue
  hotel: '#8B5CF6',       // purple
  restaurant: '#F59E0B',  // amber
  attraction: '#EF4444',  // red
  activity: '#10B981',    // green
  transport: '#06B6D4',   // cyan
  shopping: '#EC4899',    // pink
  entertainment: '#F97316', // orange
  other: '#6B7280'        // gray
};

// Custom icon creator with category color
const createCategoryIcon = (category: string) => {
  const color = CATEGORY_COLORS[category] || CATEGORY_COLORS.other;
  
  const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42">
      <path fill="${color}" stroke="#ffffff" stroke-width="2" d="M16 0C7.163 0 0 7.163 0 16c0 12 16 26 16 26s16-14 16-26c0-8.837-7.163-16-16-16z"/>
      <circle fill="#ffffff" cx="16" cy="16" r="8"/>
    </svg>
  `;
  
  return L.divIcon({
    className: 'custom-marker',
    html: svgIcon,
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -42]
  });
};

// Hotel icon (star marker)
const createHotelIcon = () => {
  const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42">
      <path fill="#8B5CF6" stroke="#ffffff" stroke-width="2" d="M16 0C7.163 0 0 7.163 0 16c0 12 16 26 16 26s16-14 16-26c0-8.837-7.163-16-16-16z"/>
      <text x="16" y="20" font-size="14" text-anchor="middle" fill="#ffffff">★</text>
    </svg>
  `;
  
  return L.divIcon({
    className: 'custom-marker hotel-marker',
    html: svgIcon,
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -42]
  });
};

import { Activity, Hotel } from '@/lib/types';

interface ActivityWithCoords extends Activity {
  latitude: number;
  longitude: number;
}

interface HotelWithCoords extends Hotel {
  latitude: number;
  longitude: number;
}

interface MapProps {
  center?: [number, number];
  zoom?: number;
  activities?: Activity[];
  hotels?: Hotel[];
  onActivityClick?: (activityId: string) => void;
  onHotelClick?: (hotelId: string) => void;
}

// Component to auto-fit bounds to markers
function FitBounds({ activities, hotels }: { activities: ActivityWithCoords[], hotels: HotelWithCoords[] }) {
  const map = useMap();
  
  useEffect(() => {
    const allPoints = [
      ...activities.filter(a => a.latitude && a.longitude).map(a => [a.latitude, a.longitude] as [number, number]),
      ...hotels.filter(h => h.latitude && h.longitude).map(h => [h.latitude, h.longitude] as [number, number])
    ];
    
    if (allPoints.length > 0) {
      const bounds = L.latLngBounds(allPoints);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [activities, hotels, map]);
  
  return null;
}

export default function MapView({ 
  center = [20, 0], 
  zoom = 2,
  activities = [],
  hotels = [],
  onActivityClick,
  onHotelClick
}: MapProps) {
  const [mounted, setMounted] = useState(false);
  const [animateMarkers, setAnimateMarkers] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    // Enable smooth animations after initial render
    setTimeout(() => setAnimateMarkers(true), 100);
  }, []);
  
  // Filter activities for selected day and those with coordinates
  const validActivities: ActivityWithCoords[] = useMemo(() => {
    if (!activities || activities.length === 0) return [];
    
    return activities
      .filter(activity => 
        activity.location?.latitude && 
        activity.location?.longitude
      )
      .map(activity => ({
        ...activity,
        latitude: activity.location!.latitude!,
        longitude: activity.location!.longitude!
      }));
  }, [activities]);
  
  // Filter hotels with coordinates
  const validHotels: HotelWithCoords[] = useMemo(() => {
    if (!hotels || hotels.length === 0) return [];
    
    return hotels
      .filter(hotel => hotel.latitude && hotel.longitude)
      .map(hotel => ({
        ...hotel,
        latitude: hotel.latitude!,
        longitude: hotel.longitude!
      }));
  }, [hotels]);
  
  // Calculate center if activities/hotels exist
  const computedCenter = useMemo(() => {
    const allPoints = [
      ...validActivities.map(a => [a.latitude, a.longitude] as [number, number]),
      ...validHotels.map(h => [h.latitude, h.longitude] as [number, number])
    ];
    
    if (allPoints.length > 0) {
      const bounds = L.latLngBounds(allPoints);
      return bounds.getCenter();
    }
    return center;
  }, [validActivities, validHotels, center]);

  if (!mounted) {
    return (
      <div style={{
        height: '100%',
        minHeight: '400px',
        background: '#f3f4f6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '12px',
        color: '#6b7280'
      }}>
        Loading map...
      </div>
    );
  }

  return (
    <MapContainer
      center={computedCenter}
      zoom={zoom}
      style={{ height: '100%', minHeight: '400px', width: '100%', borderRadius: '12px' }}
      zoomControl={true}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ZoomControl position="topright" />
      
      {/* Auto-fit bounds component */}
      <FitBounds activities={validActivities} hotels={validHotels} />
      
      {/* Activity markers */}
      {validActivities.map((activity) => (
        <Marker
          key={`activity-${activity.id}`}
          position={[activity.latitude, activity.longitude]}
          icon={createCategoryIcon(activity.category)}
          opacity={animateMarkers ? 1 : 0}
          eventHandlers={{
            click: () => {
              if (onActivityClick) {
                onActivityClick(activity.id);
              }
            }
          }}
        >
          <Popup>
            <div style={{ minWidth: '150px' }}>
              <strong style={{ color: CATEGORY_COLORS[activity.category] }}>
                {activity.category.charAt(0).toUpperCase() + activity.category.slice(1)}
              </strong>
              <h4 style={{ margin: '4px 0 0 0' }}>{activity.title}</h4>
              {activity.location?.name && (
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#666' }}>
                  {activity.location.name}
                </p>
              )}
              {activity.startTime && (
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#888' }}>
                  {activity.startTime}
                  {activity.endTime && ` - ${activity.endTime}`}
                </p>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
      
      {/* Hotel markers */}
      {validHotels.map((hotel) => (
        <Marker
          key={`hotel-${hotel.id}`}
          position={[hotel.latitude, hotel.longitude]}
          icon={createHotelIcon()}
          opacity={animateMarkers ? 1 : 0}
          eventHandlers={{
            click: () => {
              if (onHotelClick) {
                onHotelClick(hotel.id);
              }
            }
          }}
        >
          <Popup>
            <div style={{ minWidth: '150px' }}>
              <strong style={{ color: '#8B5CF6' }}>🏨 Hotel</strong>
              <h4 style={{ margin: '4px 0 0 0' }}>{hotel.name}</h4>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#666' }}>
                {hotel.address}
              </p>
              {hotel.checkInDate && (
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#888' }}>
                  Check-in: {hotel.checkInDate}
                </p>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
