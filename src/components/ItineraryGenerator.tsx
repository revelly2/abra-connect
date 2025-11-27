import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, Loader2, MapPin, Clock, Lightbulb, 
  Utensils, Mountain, Bus, Hotel, Landmark, TreePine,
  Info
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Activity {
  name: string;
  category: string;
  description: string;
  time: string;
  duration: string;
  tips?: string;
  isTouristSpot?: boolean;
  spotName?: string;
}

interface Day {
  dayNumber: number;
  title: string;
  activities: Activity[];
}

interface Itinerary {
  title: string;
  days: Day[];
  travelNotes?: string;
  travelTips: string[];
}

interface TouristSpot {
  id: string;
  name: string;
  location: string;
  description: string;
  image_url: string | null;
  categories: string[];
}

const INTERESTS = [
  { id: "foods", label: "Foods" },
  { id: "nature", label: "Nature" },
  { id: "mountains", label: "Mountains" },
  { id: "rivers", label: "Rivers" },
  { id: "historical", label: "Historical" },
  { id: "culture", label: "Culture" },
];

const DURATIONS = [
  { value: "1-day", label: "1 Day" },
  { value: "2-3-days", label: "2-3 Days" },
  { value: "4-5-days", label: "4-5 Days" },
  { value: "1-week", label: "1 Week" },
  { value: "2-weeks", label: "2 Weeks" },
];

const TRAVEL_STYLES = [
  { value: "adventure", label: "Adventure" },
  { value: "relaxation", label: "Relaxation" },
  { value: "cultural", label: "Cultural Immersion" },
  { value: "photography", label: "Photography" },
  { value: "backpacking", label: "Backpacking" },
];

const GROUP_TYPES = [
  { value: "solo", label: "Solo" },
  { value: "couple", label: "Couple" },
  { value: "family", label: "Family" },
  { value: "friends", label: "Friends" },
  { value: "group", label: "Large Group" },
];

const BUDGETS = [
  { value: "budget", label: "Budget-friendly" },
  { value: "moderate", label: "Moderate" },
  { value: "comfortable", label: "Comfortable" },
  { value: "luxury", label: "Luxury" },
];

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "Food & Dining": return <Utensils className="h-5 w-5" />;
    case "Heritage Site": return <Landmark className="h-5 w-5" />;
    case "Nature": return <TreePine className="h-5 w-5" />;
    case "Transportation": return <Bus className="h-5 w-5" />;
    case "Accommodation": return <Hotel className="h-5 w-5" />;
    case "Activity": return <Mountain className="h-5 w-5" />;
    default: return <MapPin className="h-5 w-5" />;
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case "Food & Dining": return "bg-orange-500";
    case "Heritage Site": return "bg-amber-600";
    case "Nature": return "bg-green-500";
    case "Transportation": return "bg-blue-500";
    case "Accommodation": return "bg-purple-500";
    case "Activity": return "bg-red-500";
    default: return "bg-gray-500";
  }
};

function ActivityCard({ activity, touristSpots }: { activity: Activity; touristSpots: TouristSpot[] }) {
  const matchingSpot = touristSpots.find(
    spot => activity.spotName?.toLowerCase().includes(spot.name.toLowerCase()) ||
            spot.name.toLowerCase().includes(activity.name.toLowerCase()) ||
            activity.name.toLowerCase().includes(spot.name.toLowerCase())
  );

  const content = (
    <Card className="p-4 bg-card border-border hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-muted">
          {getCategoryIcon(activity.category)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h4 className={`font-semibold text-foreground ${matchingSpot ? 'cursor-pointer hover:text-primary underline decoration-dotted' : ''}`}>
              {activity.name}
            </h4>
            <Badge className={`${getCategoryColor(activity.category)} text-white text-xs`}>
              {activity.category}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-2">{activity.description}</p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {activity.time}
            </span>
            <span>{activity.duration}</span>
          </div>
        </div>
      </div>
      {activity.tips && (
        <div className="mt-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
          <div className="flex gap-2">
            <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 dark:text-amber-200">{activity.tips}</p>
          </div>
        </div>
      )}
    </Card>
  );

  if (matchingSpot) {
    return (
      <HoverCard>
        <HoverCardTrigger asChild>
          {content}
        </HoverCardTrigger>
        <HoverCardContent className="w-80" side="right">
          <div className="space-y-2">
            {matchingSpot.image_url && (
              <img
                src={matchingSpot.image_url}
                alt={matchingSpot.name}
                className="w-full h-32 object-cover rounded-lg"
              />
            )}
            <h4 className="font-semibold text-foreground">{matchingSpot.name}</h4>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {matchingSpot.location}
            </p>
            <p className="text-sm text-muted-foreground">{matchingSpot.description}</p>
            {matchingSpot.categories?.length > 0 && (
              <div className="flex gap-1 flex-wrap">
                {matchingSpot.categories.map(cat => (
                  <Badge key={cat} variant="secondary" className="text-xs">{cat}</Badge>
                ))}
              </div>
            )}
          </div>
        </HoverCardContent>
      </HoverCard>
    );
  }

  return content;
}

function ItineraryDisplay({ itinerary, touristSpots }: { itinerary: Itinerary; touristSpots: TouristSpot[] }) {
  return (
    <div className="space-y-6">
      {itinerary.days.map((day) => (
        <div key={day.dayNumber} className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
              {day.dayNumber}
            </div>
            <h3 className="text-lg font-bold text-foreground">
              Day {day.dayNumber}: {day.title}
            </h3>
          </div>
          <div className="space-y-3 ml-4 border-l-2 border-primary/20 pl-6">
            {day.activities.map((activity, idx) => (
              <ActivityCard key={idx} activity={activity} touristSpots={touristSpots} />
            ))}
          </div>
        </div>
      ))}

      {itinerary.travelNotes && (
        <Card className="p-4 bg-muted/50">
          <div className="flex gap-2">
            <Info className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-foreground mb-1">Travel Notes</h4>
              <p className="text-sm text-muted-foreground">{itinerary.travelNotes}</p>
            </div>
          </div>
        </Card>
      )}

      {itinerary.travelTips?.length > 0 && (
        <Card className="p-4 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
          <div className="flex gap-2">
            <Lightbulb className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">Travel Tips</h4>
              <ul className="space-y-1">
                {itinerary.travelTips.map((tip, idx) => (
                  <li key={idx} className="text-sm text-amber-700 dark:text-amber-300 flex items-start gap-2">
                    <span className="text-amber-500">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

export default function ItineraryGenerator() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [touristSpots, setTouristSpots] = useState<TouristSpot[]>([]);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    gender: "",
    age: "",
    location: "",
    interests: [] as string[],
    duration: "",
    travelStyle: "",
    groupType: "",
    budget: "",
  });

  useEffect(() => {
    const fetchSpots = async () => {
      const { data } = await supabase.from('tourist_spots').select('*');
      if (data) setTouristSpots(data);
    };
    fetchSpots();
  }, []);

  const handleInterestChange = (interest: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      interests: checked
        ? [...prev.interests, interest]
        : prev.interests.filter((i) => i !== interest),
    }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setItinerary(null);
    setShowResult(true);

    try {
      const response = await fetch(
        "https://hcfhaqbypdhbcdiztgip.supabase.co/functions/v1/generate-itinerary",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjZmhhcWJ5cGRoYmNkaXp0Z2lwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNjg0MDQsImV4cCI6MjA3OTc0NDQwNH0.4W8p2AnrAN-Gfv2RsuBR5TPgNDNpM9SXSi4k5S0a-mY`,
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate itinerary");
      }

      if (data.itinerary) {
        setItinerary(data.itinerary);
        
        // Save itinerary log to database
        await supabase.from('itinerary_logs').insert({
          gender: formData.gender || null,
          age: formData.age || null,
          location: formData.location || null,
          interests: formData.interests.length > 0 ? formData.interests : null,
          duration: formData.duration || null,
          travel_style: formData.travelStyle || null,
          group_type: formData.groupType || null,
          budget: formData.budget || null,
          itinerary_title: data.itinerary.title || null,
          itinerary_data: data.itinerary,
        });
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate itinerary",
        variant: "destructive",
      });
      setShowResult(false);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setShowResult(false);
    setItinerary(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="hero" size="lg" className="gap-2">
          <Sparkles className="h-5 w-5" />
          Generate AI Itinerary
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {showResult && itinerary ? itinerary.title : showResult ? "Generating..." : "Welcome! Help us personalize your experience"}
          </DialogTitle>
        </DialogHeader>

        {!showResult ? (
          <ScrollArea className="max-h-[70vh] pr-4">
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, gender: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer-not">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Age</Label>
                <Input
                  type="number"
                  placeholder="Enter your age"
                  value={formData.age}
                  onChange={(e) => setFormData((prev) => ({ ...prev, age: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Location (Where are you from?)</Label>
                <Input
                  placeholder="City, Province/State, Country"
                  value={formData.location}
                  onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>What interests you about visiting Abra? (Select all that apply)</Label>
                <div className="space-y-2">
                  {INTERESTS.map((interest) => (
                    <div key={interest.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={interest.id}
                        checked={formData.interests.includes(interest.label)}
                        onCheckedChange={(checked) =>
                          handleInterestChange(interest.label, checked as boolean)
                        }
                      />
                      <label
                        htmlFor={interest.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {interest.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>How long will you stay?</Label>
                <Select
                  value={formData.duration}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, duration: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    {DURATIONS.map((d) => (
                      <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>What is your travel style?</Label>
                <Select
                  value={formData.travelStyle}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, travelStyle: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select travel style" />
                  </SelectTrigger>
                  <SelectContent>
                    {TRAVEL_STYLES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Who are you traveling with?</Label>
                <Select
                  value={formData.groupType}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, groupType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select group type" />
                  </SelectTrigger>
                  <SelectContent>
                    {GROUP_TYPES.map((g) => (
                      <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>What is your budget preference?</Label>
                <Select
                  value={formData.budget}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, budget: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select budget" />
                  </SelectTrigger>
                  <SelectContent>
                    {BUDGETS.map((b) => (
                      <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate My Itinerary"
                )}
              </Button>
            </div>
          </ScrollArea>
        ) : (
          <div className="space-y-4">
            <ScrollArea className="h-[60vh] pr-4">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  <p className="text-muted-foreground">Creating your personalized itinerary...</p>
                </div>
              ) : itinerary ? (
                <ItineraryDisplay itinerary={itinerary} touristSpots={touristSpots} />
              ) : null}
            </ScrollArea>
            {!isLoading && (
              <Button onClick={resetForm} variant="outline" className="w-full">
                Generate Another Itinerary
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
