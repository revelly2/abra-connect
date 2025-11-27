import { useState } from "react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";

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

export default function ItineraryGenerator() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [itinerary, setItinerary] = useState("");
  const [showResult, setShowResult] = useState(false);
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
    setItinerary("");
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

      if (!response.ok || !response.body) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to generate itinerary");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              fullContent += content;
              setItinerary(fullContent);
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
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
    setItinerary("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="hero" size="lg" className="gap-2">
          <Sparkles className="h-5 w-5" />
          Generate AI Itinerary
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {showResult ? "Your Personalized Itinerary" : "Welcome! Help us personalize your experience"}
          </DialogTitle>
        </DialogHeader>

        {!showResult ? (
          <ScrollArea className="max-h-[70vh] pr-4">
            <div className="space-y-4 py-4">
              {/* Gender */}
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

              {/* Age */}
              <div className="space-y-2">
                <Label>Age</Label>
                <Input
                  type="number"
                  placeholder="Enter your age"
                  value={formData.age}
                  onChange={(e) => setFormData((prev) => ({ ...prev, age: e.target.value }))}
                />
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label>Location (Where are you from?)</Label>
                <Input
                  placeholder="City, Province/State, Country"
                  value={formData.location}
                  onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                />
              </div>

              {/* Interests */}
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

              {/* Duration */}
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
                      <SelectItem key={d.value} value={d.value}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Travel Style */}
              <div className="space-y-2">
                <Label>What's your travel style?</Label>
                <Select
                  value={formData.travelStyle}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, travelStyle: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select travel style" />
                  </SelectTrigger>
                  <SelectContent>
                    {TRAVEL_STYLES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Group Type */}
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
                      <SelectItem key={g.value} value={g.value}>
                        {g.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Budget */}
              <div className="space-y-2">
                <Label>What's your budget preference?</Label>
                <Select
                  value={formData.budget}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, budget: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select budget" />
                  </SelectTrigger>
                  <SelectContent>
                    {BUDGETS.map((b) => (
                      <SelectItem key={b.value} value={b.value}>
                        {b.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary/90"
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
              {isLoading && !itinerary ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-li:text-muted-foreground prose-hr:border-border">
                  <ReactMarkdown>{itinerary}</ReactMarkdown>
                </div>
              )}
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
