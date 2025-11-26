import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

interface LocationMapProps {
  latitude?: number;
  longitude?: number;
  onLocationSelect?: (lat: number, lng: number) => void;
  height?: string;
}

const LocationMap: React.FC<LocationMapProps> = ({ 
  latitude = 17.5947, 
  longitude = 120.7913, 
  onLocationSelect,
  height = "400px"
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const marker = useRef<maplibregl.Marker | null>(null);
  const [currentLat, setCurrentLat] = useState(latitude);
  const [currentLng, setCurrentLng] = useState(longitude);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://tiles.openfreemap.org/styles/liberty',
      center: [longitude, latitude],
      zoom: 12,
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    // Add initial marker
    marker.current = new maplibregl.Marker({ draggable: true })
      .setLngLat([longitude, latitude])
      .addTo(map.current);

    // Update on marker drag
    marker.current.on('dragend', () => {
      if (!marker.current) return;
      const lngLat = marker.current.getLngLat();
      setCurrentLat(lngLat.lat);
      setCurrentLng(lngLat.lng);
      onLocationSelect?.(lngLat.lat, lngLat.lng);
    });

    // Add marker on map click
    map.current.on('click', (e) => {
      const { lng, lat } = e.lngLat;
      if (marker.current) {
        marker.current.setLngLat([lng, lat]);
      }
      setCurrentLat(lat);
      setCurrentLng(lng);
      onLocationSelect?.(lat, lng);
    });

    return () => {
      marker.current?.remove();
      map.current?.remove();
    };
  }, []);

  // Update marker position when props change
  useEffect(() => {
    if (marker.current && (latitude !== currentLat || longitude !== currentLng)) {
      marker.current.setLngLat([longitude, latitude]);
      map.current?.flyTo({ center: [longitude, latitude], zoom: 12 });
      setCurrentLat(latitude);
      setCurrentLng(longitude);
    }
  }, [latitude, longitude]);

  return (
    <div className="space-y-2">
      <div 
        ref={mapContainer} 
        style={{ height }} 
        className="rounded-lg border border-border"
      />
      <p className="text-sm text-muted-foreground">
        Click on the map or drag the marker to set the location: {currentLat.toFixed(6)}, {currentLng.toFixed(6)}
      </p>
    </div>
  );
};

export default LocationMap;
