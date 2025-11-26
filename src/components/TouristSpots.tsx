import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, QrCode } from "lucide-react";
import kaparkanFalls from "@/assets/kaparkan-falls.jpg";
import tangadanTunnel from "@/assets/tangadan-tunnel.jpg";
import tayumChurch from "@/assets/tayum-church.jpg";

const spots = [
  {
    id: 1,
    name: "Kaparkan Falls",
    location: "Tineg, Abra",
    description: "A majestic three-tiered waterfall surrounded by lush forest. The turquoise waters and scenic trek make it a must-visit natural wonder.",
    image: kaparkanFalls,
    duration: "3-4 hours trek",
    type: "Natural Wonder"
  },
  {
    id: 2,
    name: "Tangadan Tunnel",
    location: "Bangued, Abra",
    description: "A historic Japanese tunnel built during World War II. Now a heritage site showcasing Abra's wartime history and resilience.",
    image: tangadanTunnel,
    duration: "30 minutes",
    type: "Historical Landmark"
  },
  {
    id: 3,
    name: "Tayum Church",
    location: "Tayum, Abra",
    description: "A beautiful Spanish colonial church featuring baroque architecture. One of Abra's oldest religious landmarks dating back centuries.",
    image: tayumChurch,
    duration: "1 hour",
    type: "Cultural Heritage"
  }
];

const TouristSpots = () => {
  return (
    <section className="py-24 px-4 bg-gradient-to-b from-background to-card">
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
                <img 
                  src={spot.image} 
                  alt={spot.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent opacity-60"></div>
                
                {/* Type Badge */}
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-primary/90 backdrop-blur-sm text-primary-foreground text-xs font-medium">
                  {spot.type}
                </div>

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
                <p className="text-muted-foreground leading-relaxed">
                  {spot.description}
                </p>

                {/* Duration */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t border-border">
                  <Clock className="w-4 h-4" />
                  <span>{spot.duration}</span>
                </div>

                {/* CTA Button */}
                <Button variant="outline" className="w-full group-hover:border-primary group-hover:text-primary">
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Button variant="hero" size="lg">
            <MapPin className="w-5 h-5" />
            View All Destinations
          </Button>
        </div>
      </div>
    </section>
  );
};

export default TouristSpots;
