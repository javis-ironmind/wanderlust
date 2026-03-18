'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, ZoomControl, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapMarker {
  id: string;
  position: [number, number];
  title: string;
  category?: string;
}

interface TripMapProps {
  center?: [number, number];
  zoom?: number;
  markers?: MapMarker[];
  className?: string;
}

// Custom marker colors by category
const categoryColors: Record<string, string> = {
  restaurant: '#f97316',
  attraction: '#8b5cf6',
  activity: '#06b6d4',
  transport: '#3b82f6',
  hotel: '#ec4899',
  shopping: '#84cc16',
  entertainment: '#f43f5e',
  other: '#6b7280',
};

function createMarkerIcon(color: string = '#3b82f6') {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background-color: ${color};
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
}

export function TripMap({ center = [20, 0], zoom = 2, markers = [], className = '' }: TripMapProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const getMarkerIcon = (category?: string) => {
    const color = category ? categoryColors[category] || categoryColors.other : categoryColors.other;
    return createMarkerIcon(color);
  };

  if (!isMounted) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`} style={{ minHeight: '400px' }}>
        <span style={{ color: '#666' }}>Loading map...</span>
      </div>
    );
  }

  const validMarkers = markers.filter(m => m.position[0] && m.position[1]);
  
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className={className}
      style={{ minHeight: '400px', height: '100%', width: '100%' }}
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ZoomControl position="bottomright" />
      
      {validMarkers.map((marker) => (
        <Marker
          key={marker.id}
          position={marker.position}
          icon={getMarkerIcon(marker.category)}
        >
          <Popup>
            <div style={{ minWidth: '100px' }}>
              <strong>{marker.title}</strong>
              {marker.category && (
                <span style={{ display: 'block', fontSize: '12px', color: '#666', marginTop: '4px' }}>
                  {marker.category}
                </span>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
