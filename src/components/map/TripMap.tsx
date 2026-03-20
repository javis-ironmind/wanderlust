'use client';

import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, ZoomControl, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CATEGORY_COLORS } from '@/lib/map-colors';

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
  route?: [number, number][]; // AC3: Route line positions
  className?: string;
}

// Component to handle smooth flyTo when markers/center changes
function MapAnimator({ markers, route }: { markers: MapMarker[], route?: [number, number][] }) {
  const map = useMap();
  const prevCenterRef = useRef<[number, number] | null>(null);
  
  useEffect(() => {
    if (markers && markers.length > 0) {
      const validMarkers = markers.filter(m => m.position[0] && m.position[1]);
      if (validMarkers.length > 0) {
        const avgLat = validMarkers.reduce((sum, m) => sum + m.position[0], 0) / validMarkers.length;
        const avgLng = validMarkers.reduce((sum, m) => sum + m.position[1], 0) / validMarkers.length;
        const newCenter: [number, number] = [avgLat, avgLng];
        
        // AC7: Smooth transition - only fly if center actually changed significantly
        if (!prevCenterRef.current || 
            Math.abs(prevCenterRef.current[0] - newCenter[0]) > 0.001 ||
            Math.abs(prevCenterRef.current[1] - newCenter[1]) > 0.001) {
          map.flyTo(newCenter, map.getZoom(), {
            animate: true,
            duration: 0.5,
          });
          prevCenterRef.current = newCenter;
        }
      }
    }
  }, [markers, map]);
  
  return null;
}

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

export function TripMap({ center = [20, 0], zoom = 2, markers = [], route, className = '' }: TripMapProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>(center);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // AC6: Auto-calculate center when markers change
  useEffect(() => {
    if (markers && markers.length > 0) {
      const validMarkers = markers.filter(m => m.position[0] && m.position[1]);
      if (validMarkers.length > 0) {
        // Calculate center from markers
        const avgLat = validMarkers.reduce((sum, m) => sum + m.position[0], 0) / validMarkers.length;
        const avgLng = validMarkers.reduce((sum, m) => sum + m.position[1], 0) / validMarkers.length;
        setMapCenter([avgLat, avgLng]);
      }
    }
  }, [markers]);

  const getMarkerIcon = (category?: string) => {
    const color = category ? CATEGORY_COLORS[category] || CATEGORY_COLORS.other : CATEGORY_COLORS.other;
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
      center={mapCenter}
      zoom={zoom}
      className={className}
      style={{ minHeight: '400px', height: '100%', width: '100%' }}
      zoomControl={false}
    >
      <MapAnimator markers={validMarkers} route={route} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ZoomControl position="bottomright" />
      
      {/* AC3: Route line drawn between activities in order */}
      {route && route.length > 1 && (
        <Polyline 
          positions={route} 
          color="#3b82f6" 
          weight={3} 
          opacity={0.7} 
          dashArray="10, 10"
        />
      )}
      
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
