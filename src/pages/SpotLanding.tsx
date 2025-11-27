import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, Compass, ArrowLeft, ExternalLink } from "lucide-react";

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

const SpotLanding = () => {
  const { spotId } = useParams<{ spotId: string }>();
  const navigate = useNavigate();
  const [spot, setSpot] = useState<TouristSpot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSpot = async () => {
      if (!spotId) {
        setError("No spot ID provided");
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from("tourist_spots")
          .select("*")
          .eq("id", spotId)
          .maybeSingle();

        if (fetchError) throw fetchError;

        if (!data) {
          setError("Tourist spot not found");
        } else {
          setSpot(data);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load spot");
      } finally {
        setLoading(false);
      }
    };

    fetchSpot();
  }, [spotId]);

  const handleGetDirections = () => {
    if (spot) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${spot.latitude},${spot.longitude}`;
      window.open(url, "_blank");
    }
  };

  const handleViewOnMap = () => {
    if (spot) {
      navigate(`/map?spot=${spot.id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading destination...</p>
        </div>
      </div>
    );
  }

  if (error || !spot) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
              <MapPin className="w-8 h-8 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold">Spot Not Found</h2>
            <p className="text-muted-foreground">{error || "The tourist spot you're looking for doesn't exist."}</p>
            <Button onClick={() => navigate("/")} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Welcome Header */}
      <div className="bg-gradient-to-b from-primary/10 to-background pt-8 pb-12 px-4">
        <div className="max-w-2xl mx-auto text-center space-y-4 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/20 rounded-full mb-2">
            <MapPin className="w-8 h-8 text-primary" />
          </div>
          <p className="text-muted-foreground text-lg">You are currently at</p>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">{spot.name}</h1>
          <Badge variant="secondary" className="text-base px-4 py-1">
            <MapPin className="w-4 h-4 mr-1" />
            {spot.location}
          </Badge>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 pb-8 -mt-4">
        <Card className="overflow-hidden shadow-lg">
          {/* Hero Image */}
          {spot.image_url && (
            <div className="relative h-56 md:h-72">
              <img
                src={spot.image_url}
                alt={spot.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex gap-2 flex-wrap">
                  {spot.categories?.map((category) => (
                    <Badge key={category} variant="secondary" className="bg-white/90 text-foreground">
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          <CardContent className="p-6 space-y-6">
            {/* Description */}
            <div>
              <h2 className="text-lg font-semibold mb-2">About this Place</h2>
              <p className="text-muted-foreground leading-relaxed">{spot.description}</p>
            </div>

            {/* Detailed Content */}
            {spot.detailed_content && (
              <div>
                <h2 className="text-lg font-semibold mb-2">History & Details</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {spot.detailed_content}
                </p>
              </div>
            )}

            {/* Coordinates */}
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Compass className="w-4 h-4" />
                <span>
                  Coordinates: {spot.latitude.toFixed(6)}, {spot.longitude.toFixed(6)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <Button onClick={handleViewOnMap} variant="outline" className="w-full">
                <MapPin className="w-4 h-4 mr-2" />
                View on Map
              </Button>
              <Button onClick={handleGetDirections} className="w-full">
                <Navigation className="w-4 h-4 mr-2" />
                Get Directions
                <ExternalLink className="w-3 h-3 ml-1" />
              </Button>
            </div>

            {/* Explore More */}
            <div className="pt-4 border-t border-border">
              <Button 
                variant="ghost" 
                className="w-full text-muted-foreground hover:text-foreground"
                onClick={() => navigate("/#destinations")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Explore More Tourist Spots in Abra
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SpotLanding;
