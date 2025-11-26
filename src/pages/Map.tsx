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
        map.current?.flyTo({
          center: [spot.longitude, spot.latitude],
          zoom: 14,
        });
      });

      markers.current.push(marker);
    });
  }, [spots]);

  const handleGetDirections = () => {
    if (!selectedSpot || !userLocation) return;

    // Open directions in Google Maps or default map app
    const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation[1]},${userLocation[0]}&destination=${selectedSpot.latitude},${selectedSpot.longitude}`;
    window.open(url, '_blank');
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
        <Card className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-10 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-foreground">{selectedSpot.name}</h3>
                <p className="text-sm text-muted-foreground">{selectedSpot.location}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedSpot(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {selectedSpot.image_url && (
              <img
                src={selectedSpot.image_url}
                alt={selectedSpot.name}
                className="w-full h-32 object-cover rounded-lg mb-3"
              />
            )}

            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {selectedSpot.description}
            </p>

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

            <Button
              onClick={handleGetDirections}
              className="w-full"
              disabled={!userLocation}
            >
              <Navigation className="w-4 h-4 mr-2" />
              Get Directions
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Map;
