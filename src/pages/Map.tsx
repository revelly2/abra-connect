import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import maplibregl from 'maplibre-gl/dist/maplibre-gl.js';
import 'maplibre-gl/dist/maplibre-gl.css';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Navigation, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TouristSpot {
  id: string;
  name: string;
  location: string;
  description: string;
  detailed_content?: string | null;
  image_url: string | null;
  categories: string[];
  latitude: number;
  longitude: number;
}

const Map = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markers = useRef<maplibregl.Marker[]>([]);
  const [spots, setSpots] = useState<TouristSpot[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [selectedSpot, setSelectedSpot] = useState<TouristSpot | null>(null);
  const [loading, setLoading] = useState(true);
  const [showingRoute, setShowingRoute] = useState(false);
  const [showFullDetails, setShowFullDetails] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchSpots = async () => {
      try {
        const { data, error } = await supabase
          .from('tourist_spots')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setSpots(data || []);
      } catch (error) {
        console.error('Error fetching tourist spots:', error);
        toast({
          title: 'Error',
          description: 'Failed to load tourist spots',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSpots();
  }, [toast]);

  useEffect(() => {
    // Request geolocation permission
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.longitude, position.coords.latitude]);
        },
        (error) => {
          console.error('Error getting location:', error);
          toast({
            title: 'Location Access',
            description: 'Could not access your location. Showing default view.',
          });
          // Default to Abra, Philippines
          setUserLocation([120.7913, 17.5947]);
        }
      );
    } else {
      setUserLocation([120.7913, 17.5947]);
    }
  }, [toast]);

  useEffect(() => {
    if (!mapContainer.current || map.current || !userLocation || loading) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '&copy; OpenStreetMap Contributors',
            maxzoom: 19,
          },
        },
        layers: [
          {
            id: 'osm',
            type: 'raster',
            source: 'osm',
          },
        ],
      },
      center: userLocation,
      zoom: 10,
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    // Add user location marker
    new maplibregl.Marker({ color: '#3b82f6' })
      .setLngLat(userLocation)
      .setPopup(new maplibregl.Popup().setHTML('<p class="font-semibold">Your Location</p>'))
      .addTo(map.current);

    return () => {
      map.current?.remove();
    };
  }, [userLocation, loading]);

  useEffect(() => {
    if (!map.current || spots.length === 0) return;

    // Clear existing markers
    markers.current.forEach((marker) => marker.remove());
    markers.current = [];

    // Add markers for each tourist spot
    spots.forEach((spot) => {
      const el = document.createElement('div');
      el.className = 'marker';
      el.style.backgroundImage = 'url(https://docs.mapbox.com/mapbox-gl-js/assets/custom_marker.png)';
      el.style.width = '32px';
      el.style.height = '40px';
      el.style.backgroundSize = '100%';
      el.style.cursor = 'pointer';

      const marker = new maplibregl.Marker({ element: el, color: '#ef4444' })
        .setLngLat([spot.longitude, spot.latitude])
        .addTo(map.current!);

      el.addEventListener('click', () => {
        setSelectedSpot(spot);
        setShowFullDetails(false);
        map.current?.flyTo({
          center: [spot.longitude, spot.latitude],
          zoom: 14,
        });
      });

      markers.current.push(marker);
    });
  }, [spots]);

  const handleViewDetails = () => {
    setShowFullDetails(!showFullDetails);
  };

  const clearRoute = () => {
    if (!map.current) return;
    
    // Remove route layers
    if (map.current.getLayer('route-outline')) {
      map.current.removeLayer('route-outline');
    }
    if (map.current.getLayer('route')) {
      map.current.removeLayer('route');
    }
    if (map.current.getSource('route')) {
      map.current.removeSource('route');
    }
    
    // Remove destination marker
    const existingDestMarker = document.getElementById('destination-marker');
    if (existingDestMarker) {
      existingDestMarker.remove();
    }
    
    setShowingRoute(false);
  };

  const handleGetDirections = async () => {
    if (!selectedSpot || !userLocation || !map.current) return;

    // Clear any existing route first
    clearRoute();
    setShowingRoute(true);

    try {
      // Fetch route from OSRM (Open Source Routing Machine)
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${userLocation[0]},${userLocation[1]};${selectedSpot.longitude},${selectedSpot.latitude}?overview=full&geometries=geojson`
      );
      const data = await response.json();

      if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
        throw new Error('No route found');
      }

      const route = data.routes[0];
      const coordinates = route.geometry.coordinates;

      // Add route as a line on the map with outline for better visibility
      map.current.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: coordinates,
          },
        },
      });

      // Add outline layer first (darker border)
      map.current.addLayer({
        id: 'route-outline',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#1d4ed8',
          'line-width': 8,
          'line-opacity': 0.6,
        },
      });

      // Add main route layer
      map.current.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#3b82f6',
          'line-width': 5,
          'line-opacity': 1,
        },
      });

      // Add prominent destination marker
      const destMarkerEl = document.createElement('div');
      destMarkerEl.id = 'destination-marker';
      destMarkerEl.innerHTML = `
        <svg width="32" height="44" viewBox="0 0 32 44" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 0C7.16 0 0 7.16 0 16C0 28 16 44 16 44C16 44 32 28 32 16C32 7.16 24.84 0 16 0Z" fill="#ef4444"/>
          <circle cx="16" cy="16" r="8" fill="white"/>
          <circle cx="16" cy="16" r="4" fill="#ef4444"/>
        </svg>
      `;
      destMarkerEl.style.cursor = 'pointer';

      new maplibregl.Marker({ element: destMarkerEl, anchor: 'bottom' })
        .setLngLat([selectedSpot.longitude, selectedSpot.latitude])
        .addTo(map.current);

      // Fit map to show entire route
      const bounds = coordinates.reduce(
        (bounds: maplibregl.LngLatBounds, coord: [number, number]) => {
          return bounds.extend(coord as [number, number]);
        },
        new maplibregl.LngLatBounds(coordinates[0], coordinates[0])
      );

      map.current.fitBounds(bounds, {
        padding: { top: 120, bottom: 200, left: 50, right: 50 },
      });

      toast({
        title: 'Route displayed',
        description: `Distance: ${(route.distance / 1000).toFixed(1)} km • ${Math.round(route.duration / 60)} min drive`,
      });
    } catch (error) {
      console.error('Error fetching route:', error);
      toast({
        title: 'Error',
        description: 'Could not calculate route. Please try again.',
        variant: 'destructive',
      });
      setShowingRoute(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading map...</p>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-xl font-bold">All Destinations</h1>
          <div className="w-20" /> {/* Spacer */}
        </div>
      </div>

      {/* Map */}
      <div ref={mapContainer} className="absolute inset-0" />

      {/* Selected Spot Card */}
      {selectedSpot && (
        <Card className={`absolute left-4 right-4 md:left-auto md:right-4 z-10 shadow-lg transition-all duration-300 ${
          showFullDetails 
            ? 'bottom-4 top-24 md:w-[500px] overflow-y-auto' 
            : 'bottom-4 md:w-96'
        }`}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-foreground">{selectedSpot.name}</h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <span>📍</span> {selectedSpot.location}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedSpot(null);
                  setShowFullDetails(false);
                  clearRoute();
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {selectedSpot.image_url && (
              <img
                src={selectedSpot.image_url}
                alt={selectedSpot.name}
                className={`w-full object-cover rounded-lg mb-3 transition-all duration-300 ${
                  showFullDetails ? 'h-48' : 'h-32'
                }`}
              />
            )}

            {!showFullDetails && (
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {selectedSpot.description}
              </p>
            )}

            {showFullDetails && (
              <div className="space-y-4 mb-4 animate-fade-in">
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-2">About</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {selectedSpot.description}
                  </p>
                </div>
                
                {selectedSpot.detailed_content && (
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-2">Full History & Details</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {selectedSpot.detailed_content}
                    </p>
                  </div>
                )}
              </div>
            )}

            {selectedSpot.categories && selectedSpot.categories.length > 0 && (
              <div className="flex gap-2 mb-3 flex-wrap">
                {selectedSpot.categories.map((category) => (
                  <span
                    key={category}
                    className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full"
                  >
                    {category}
                  </span>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleViewDetails}
                variant="outline"
                className="flex-1"
              >
                {showFullDetails ? 'Show Less' : 'View Details'}
              </Button>
              {showingRoute ? (
                <Button
                  onClick={clearRoute}
                  variant="secondary"
                  className="flex-1"
                >
                  Clear Route
                </Button>
              ) : (
                <Button
                  onClick={handleGetDirections}
                  className="flex-1"
                  disabled={!userLocation}
                >
                  <Navigation className="w-4 h-4 mr-2" />
                  Get Directions
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Map;
