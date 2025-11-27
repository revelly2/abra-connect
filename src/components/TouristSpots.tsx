import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MapPin, QrCode } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

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

const TouristSpots = () => {
  const [spots, setSpots] = useState<TouristSpot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpot, setSelectedSpot] = useState<TouristSpot | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSpots = async () => {
      try {
        const { data, error } = await supabase
          .from("tourist_spots")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(6);

        if (error) throw error;
        setSpots(data || []);
      } catch (error) {
        console.error("Error fetching tourist spots:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSpots();
  }, []);

  const handleViewAllDestinations = () => {
    navigate("/map");
  };

  if (loading) {
    return (
      <section className="py-24 px-4 bg-gradient-to-b from-background to-card">
        <div className="container mx-auto text-center">
          <p className="text-muted-foreground">Loading destinations...</p>
        </div>
      </section>
    );
  }

  return (
    <section id="destinations" className="py-24 px-4 bg-gradient-to-b from-background to-card">
      <div className="container mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">
            Featured <span className="text-transparent bg-clip-text bg-gradient-accent">Destinations</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Discover Abra's most iconic landmarks through our QR-enabled tourist spots
          </p>
        </div>

        {/* Spots Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {spots.map((spot, index) => (
            <Card 
              key={spot.id}
              className="group overflow-hidden bg-card border-border hover:shadow-elegant transition-all duration-500 hover:-translate-y-2"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Image Container */}
              <div className="relative h-64 overflow-hidden">
                {spot.image_url ? (
                  <img 
                    src={spot.image_url} 
                    alt={spot.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <MapPin className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent opacity-60"></div>
                
                {/* Category Badges */}
                {spot.categories && spot.categories.length > 0 && (
                  <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-primary/90 backdrop-blur-sm text-primary-foreground text-xs font-medium">
                    {spot.categories[0]}
                  </div>
                )}

                {/* QR Code Icon */}
                <div className="absolute bottom-4 right-4 w-12 h-12 rounded-full bg-accent/90 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                  <QrCode className="w-6 h-6 text-accent-foreground" />
                </div>
              </div>

              <CardContent className="p-6 space-y-4">
                {/* Title & Location */}
                <div>
                  <h3 className="text-2xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {spot.name}
                  </h3>
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <MapPin className="w-4 h-4" />
                    <span>{spot.location}</span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-muted-foreground leading-relaxed line-clamp-3">
                  {spot.description}
                </p>

                {/* Categories */}
                {spot.categories && spot.categories.length > 0 && (
                  <div className="flex gap-2 flex-wrap pt-2 border-t border-border">
                    {spot.categories.slice(0, 3).map((category) => (
                      <span key={category} className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                        {category}
                      </span>
                    ))}
                  </div>
                )}

                {/* CTA Button */}
                <Button 
                  variant="outline" 
                  className="w-full group-hover:border-primary group-hover:text-primary"
                  onClick={() => setSelectedSpot(spot)}
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Button variant="hero" size="lg" onClick={handleViewAllDestinations}>
            <MapPin className="w-5 h-5" />
            View All Destinations
          </Button>
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedSpot} onOpenChange={(open) => !open && setSelectedSpot(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedSpot && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-foreground">
                  {selectedSpot.name}
                </DialogTitle>
                <div className="flex items-center gap-2 text-muted-foreground text-sm pt-2">
                  <MapPin className="w-4 h-4" />
                  <span>{selectedSpot.location}</span>
                </div>
              </DialogHeader>

              <div className="space-y-6 animate-fade-in">
                {/* Image */}
                {selectedSpot.image_url && (
                  <div className="relative h-64 md:h-80 rounded-lg overflow-hidden">
                    <img
                      src={selectedSpot.image_url}
                      alt={selectedSpot.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-accent/90 backdrop-blur-sm flex items-center justify-center">
                      <QrCode className="w-6 h-6 text-accent-foreground" />
                    </div>
                  </div>
                )}

                {/* Categories */}
                {selectedSpot.categories && selectedSpot.categories.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {selectedSpot.categories.map((category) => (
                      <span
                        key={category}
                        className="text-xs px-3 py-1 bg-primary/10 text-primary rounded-full"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                )}

                {/* Description */}
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-2">About</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {selectedSpot.description}
                  </p>
                </div>

                {/* Detailed Content */}
                {selectedSpot.detailed_content && (
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-2">
                      Full History & Details
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {selectedSpot.detailed_content}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-border">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setSelectedSpot(null)}
                  >
                    Close
                  </Button>
                  <Button 
                    className="flex-1"
                    onClick={() => {
                      setSelectedSpot(null);
                      navigate("/map");
                    }}
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    View on Map
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default TouristSpots;
