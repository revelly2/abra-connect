import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Landmark, Users, Palette, Music } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface CulturalHighlight {
  id: string;
  title: string;
  description: string;
  detailed_content: string | null;
  icon_name: string;
  image_url: string | null;
  display_order: number;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Landmark,
  Users,
  Palette,
  Music,
};

const fallbackHighlights = [
  {
    id: "1",
    icon_name: "Landmark",
    title: "Ancient Traditions",
    description: "Experience centuries-old indigenous practices passed down through generations in Abra's mountain communities.",
    detailed_content: null,
    image_url: null,
    display_order: 1,
  },
  {
    id: "2",
    icon_name: "Users",
    title: "Itneg Heritage",
    description: "Discover the rich culture of the Itneg people, one of the Philippines' indigenous groups with unique customs and beliefs.",
    detailed_content: null,
    image_url: null,
    display_order: 2,
  },
  {
    id: "3",
    icon_name: "Palette",
    title: "Traditional Crafts",
    description: "Witness master artisans creating intricate hand-woven textiles, pottery, and traditional bamboo crafts.",
    detailed_content: null,
    image_url: null,
    display_order: 3,
  },
  {
    id: "4",
    icon_name: "Music",
    title: "Folk Music & Dance",
    description: "Immerse yourself in vibrant performances featuring gangsa music and traditional courtship dances.",
    detailed_content: null,
    image_url: null,
    display_order: 4,
  },
];

const CultureSection = () => {
  const [highlights, setHighlights] = useState<CulturalHighlight[]>(fallbackHighlights);
  const [selectedHighlight, setSelectedHighlight] = useState<CulturalHighlight | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const fetchHighlights = async () => {
      const { data, error } = await supabase
        .from("cultural_highlights")
        .select("*")
        .order("display_order", { ascending: true });

      if (!error && data && data.length > 0) {
        setHighlights(data);
      }
    };

    fetchHighlights();
  }, []);

  const handleCardClick = (highlight: CulturalHighlight) => {
    setSelectedHighlight(highlight);
    setDialogOpen(true);
  };

  const getIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName] || Landmark;
    return IconComponent;
  };

  return (
    <section className="py-24 px-4 bg-background">
      <div className="container mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">
            Abra's Living <span className="text-transparent bg-clip-text bg-gradient-accent">Cultural Heritage</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Preserving and celebrating the traditions that make Abra unique
          </p>
        </div>

        {/* Highlights Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {highlights.map((item) => {
            const Icon = getIcon(item.icon_name);
            return (
              <Card 
                key={item.id}
                className="group bg-card border-border hover:shadow-elegant transition-all duration-300 hover:-translate-y-2 text-center cursor-pointer"
                onClick={() => handleCardClick(item)}
              >
                <CardContent className="p-8 space-y-4">
                  {/* Icon */}
                  <div className="w-16 h-16 mx-auto rounded-full bg-gradient-accent flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-glow">
                    <Icon className="w-8 h-8 text-accent-foreground" />
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Featured Story Card */}
        <Card className="bg-gradient-card border-primary/20 overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Left Side - Content */}
            <CardContent className="p-8 md:p-12 flex flex-col justify-center space-y-6">
              <div className="inline-flex w-fit items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium uppercase tracking-wider">
                Featured Story
              </div>
              
              <div className="space-y-4">
                <h3 className="text-3xl md:text-4xl font-bold text-foreground">
                  The Legend of Abra
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Abra's name comes from the Spanish word for "opening" or "gap," referring to the narrow passage 
                  through the mountains. Legend tells of ancient tribes who found refuge in these valleys, 
                  creating a rich tapestry of culture that thrives to this day.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  The province is home to the Tingguian people (Itneg), whose ancestral domain spans the rugged 
                  mountain terrain. Their traditions, from intricate weaving patterns to sacred rituals, 
                  offer a window into pre-colonial Philippine civilization.
                </p>
              </div>

              <div className="pt-4">
                <div className="inline-block px-4 py-2 rounded-lg bg-secondary/50 border border-primary/10">
                  <div className="text-sm text-muted-foreground">Cultural Heritage Since</div>
                  <div className="text-2xl font-bold text-primary">1598</div>
                </div>
              </div>
            </CardContent>

            {/* Right Side - Visual Element */}
            <div className="hidden md:block relative min-h-[400px] bg-gradient-to-br from-primary/20 to-accent/20">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-4 p-8">
                  <Landmark className="w-24 h-24 mx-auto text-primary/40" />
                  <div className="text-6xl font-bold text-primary/30">500+</div>
                  <div className="text-xl text-muted-foreground">Years of History</div>
                </div>
              </div>
              {/* Decorative Elements */}
              <div className="absolute top-10 right-10 w-20 h-20 rounded-full bg-primary/10 blur-2xl"></div>
              <div className="absolute bottom-10 left-10 w-32 h-32 rounded-full bg-accent/10 blur-3xl"></div>
            </div>
          </div>
        </Card>
      </div>

      {/* Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selectedHighlight && (
                <>
                  <div className="w-10 h-10 rounded-full bg-gradient-accent flex items-center justify-center">
                    {(() => {
                      const Icon = getIcon(selectedHighlight.icon_name);
                      return <Icon className="w-5 h-5 text-accent-foreground" />;
                    })()}
                  </div>
                  {selectedHighlight.title}
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          {selectedHighlight && (
            <div className="space-y-4">
              {selectedHighlight.image_url && (
                <img
                  src={selectedHighlight.image_url}
                  alt={selectedHighlight.title}
                  className="w-full h-48 object-cover rounded-lg"
                />
              )}
              <div>
                <h4 className="font-semibold text-foreground mb-2">About</h4>
                <p className="text-muted-foreground">{selectedHighlight.description}</p>
              </div>
              {selectedHighlight.detailed_content && (
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Learn More</h4>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {selectedHighlight.detailed_content}
                  </p>
                </div>
              )}
              {!selectedHighlight.detailed_content && !selectedHighlight.image_url && (
                <p className="text-muted-foreground italic">
                  More detailed content coming soon. Check back later to learn more about {selectedHighlight.title}.
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default CultureSection;
