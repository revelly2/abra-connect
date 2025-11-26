import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Trash2, MapPin, Clock } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface TouristSpot {
  id: string;
  name: string;
  location: string;
  description: string;
  image_url: string | null;
  duration: string | null;
  type: string | null;
  latitude: number;
  longitude: number;
  created_at: string;
}

interface TouristSpotsListProps {
  refresh: number;
}

const TouristSpotsList = ({ refresh }: TouristSpotsListProps) => {
  const [spots, setSpots] = useState<TouristSpot[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSpots = async () => {
    try {
      const { data, error } = await supabase
        .from("tourist_spots")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSpots(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpots();
  }, [refresh]);

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("tourist_spots").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Tourist spot deleted successfully",
      });
      fetchSpots();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Loading tourist spots...
        </CardContent>
      </Card>
    );
  }

  if (spots.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          No tourist spots added yet. Add your first one above!
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Existing Tourist Spots</CardTitle>
        <CardDescription>Manage your tourist destinations</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {spots.map((spot) => (
            <div
              key={spot.id}
              className="flex gap-4 p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
            >
              {spot.image_url && (
                <img
                  src={spot.image_url}
                  alt={spot.name}
                  className="w-24 h-24 object-cover rounded-lg"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate">{spot.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{spot.location}</span>
                    </div>
                    {spot.duration && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Clock className="w-4 h-4 flex-shrink-0" />
                        <span>{spot.duration}</span>
                      </div>
                    )}
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Tourist Spot</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{spot.name}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(spot.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                  {spot.description}
                </p>
                <div className="flex gap-2 mt-2">
                  {spot.type && (
                    <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                      {spot.type}
                    </span>
                  )}
                  <span className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded-full">
                    {spot.latitude.toFixed(4)}, {spot.longitude.toFixed(4)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TouristSpotsList;
