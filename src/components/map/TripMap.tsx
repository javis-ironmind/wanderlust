'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, ZoomControl, AttributionControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

interface TripMapProps {
  center?: [number, number];
  zoom?: number;
  className?: string;
}

export function TripMap({ center = [20, 0], zoom = 2, className = '' }: TripMapProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`} style={{ minHeight: '400px' }}>
        <span style={{ color: '#666' }}>Loading map...</span>
      </div>
    );
  }

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
      <AttributionControl position="bottomleft" prefix={false} />
    </MapContainer>
  );
}
