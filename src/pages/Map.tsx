import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Navigation, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Fix default marker icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

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
  const map = useRef<L.Map | null>(null);
  const routeLayer = useRef<L.Polyline | null>(null);
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
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error('Error getting location:', error);
          toast({
            title: 'Location Access',
            description: 'Could not access your location. Showing default view.',
          });
          // Default to Abra, Philippines (lat, lng for Leaflet)
          setUserLocation([17.5947, 120.7913]);
        }
      );
    } else {
      setUserLocation([17.5947, 120.7913]);
    }
  }, [toast]);

  useEffect(() => {
    if (!mapContainer.current || map.current || !userLocation || loading) return;

    // Initialize Leaflet map
    map.current = L.map(mapContainer.current).setView(userLocation, 10);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map.current);

    // Add user location marker (blue)
    const userIcon = L.divIcon({
      html: `<div style="background-color: #3b82f6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
      className: 'user-marker',
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });

    L.marker(userLocation, { icon: userIcon })
      .addTo(map.current)
      .bindPopup('<p class="font-semibold">Your Location</p>');

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [userLocation, loading]);

  useEffect(() => {
    if (!map.current || spots.length === 0) return;

    // Add markers for each tourist spot
    spots.forEach((spot) => {
      const spotIcon = L.divIcon({
        html: `<div style="background-color: #ef4444; width: 24px; height: 24px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
        className: 'spot-marker',
        iconSize: [24, 24],
        iconAnchor: [12, 24],
      });

      const marker = L.marker([spot.latitude, spot.longitude], { icon: spotIcon })
        .addTo(map.current!);

      marker.on('click', () => {
        setSelectedSpot(spot);
        setShowFullDetails(false);
        map.current?.flyTo([spot.latitude, spot.longitude], 14);
      });
    });
  }, [spots]);

  const handleViewDetails = () => {
    setShowFullDetails(!showFullDetails);
  };

  const clearRoute = () => {
    if (routeLayer.current && map.current) {
      map.current.removeLayer(routeLayer.current);
      routeLayer.current = null;
    }
    setShowingRoute(false);
  };

  const handleGetDirections = async () => {
    if (!selectedSpot || !userLocation || !map.current) return;

    clearRoute();
    setShowingRoute(true);

    try {
      // Note: OSRM uses lng,lat format
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${userLocation[1]},${userLocation[0]};${selectedSpot.longitude},${selectedSpot.latitude}?overview=full&geometries=geojson`
      );
      const data = await response.json();

      console.log('OSRM Response:', data);

      if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
        throw new Error('No route found - the destination may not be accessible by road');
      }

      const route = data.routes[0];
      // Convert GeoJSON coordinates [lng, lat] to Leaflet format [lat, lng]
      const coordinates: L.LatLngExpression[] = route.geometry.coordinates.map(
        (coord: [number, number]) => [coord[1], coord[0]] as L.LatLngExpression
      );

      // Add route polyline
      routeLayer.current = L.polyline(coordinates, {
        color: '#3b82f6',
        weight: 6,
        opacity: 1,
      }).addTo(map.current);

      // Add outline effect
      const outlineLayer = L.polyline(coordinates, {
        color: '#1e40af',
        weight: 10,
        opacity: 0.5,
      }).addTo(map.current);
      outlineLayer.bringToBack();

      // Fit map to show entire route
      map.current.fitBounds(routeLayer.current.getBounds(), {
        padding: [50, 50],
      });

      toast({
        title: 'Route displayed',
        description: `Distance: ${(route.distance / 1000).toFixed(1)} km • ${Math.round(route.duration / 60)} min drive`,
      });
    } catch (error) {
      console.error('Error fetching route:', error);
      toast({
        title: 'Route unavailable',
        description: error instanceof Error ? error.message : 'Could not calculate route.',
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
      <div className="absolute top-0 left-0 right-0 z-[1000] bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-xl font-bold">All Destinations</h1>
          <div className="w-20" />
        </div>
      </div>

      {/* Map */}
      <div ref={mapContainer} className="absolute inset-0" style={{ zIndex: 1 }} />

      {/* Selected Spot Card */}
      {selectedSpot && (
        <Card className={`absolute left-4 right-4 md:left-auto md:right-4 z-[1001] shadow-lg transition-all duration-300 ${
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
