'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface LocationMapPreviewProps {
  latitude: number;
  longitude: number;
  name?: string;
  height?: number;
}

function createMarkerIcon() {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background-color: #3b82f6;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

export function LocationMapPreview({ 
  latitude, 
  longitude, 
  name,
  height = 150 
}: LocationMapPreviewProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div 
        style={{ 
          height: `${height}px`, 
          background: '#f1f5f9', 
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#64748b',
          fontSize: '0.875rem'
        }}
      >
        Loading map...
      </div>
    );
  }

  return (
    <div style={{ borderRadius: '8px', overflow: 'hidden', border: '2px solid #e2e8f0', marginBottom: '1rem' }}>
      <MapContainer
        center={[latitude, longitude]}
        zoom={13}
        style={{ height: `${height}px`, width: '100%' }}
        zoomControl={false}
        dragging={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker 
          position={[latitude, longitude]} 
          icon={createMarkerIcon()}
        />
      </MapContainer>
      {name && (
        <div style={{ 
          padding: '0.5rem 0.75rem', 
          fontSize: '0.75rem', 
          color: '#64748b',
          background: '#f8fafc',
          borderTop: '1px solid #e2e8f0'
        }}>
          📍 {name}
        </div>
      )}
    </div>
  );
}
