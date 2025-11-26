import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import LocationMap from "./LocationMap";
import { Loader2 } from "lucide-react";

const spotSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  location: z.string().min(1, "Location is required").max(200),
  description: z.string().min(1, "Description is required").max(1000),
  image_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  duration: z.string().max(100).optional(),
  type: z.string().max(100).optional(),
  latitude: z.number(),
  longitude: z.number(),
});

type SpotFormData = z.infer<typeof spotSchema>;

interface TouristSpotFormProps {
  onSuccess?: () => void;
}

const TouristSpotForm = ({ onSuccess }: TouristSpotFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [latitude, setLatitude] = useState(17.5947);
  const [longitude, setLongitude] = useState(120.7913);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<SpotFormData>({
    resolver: zodResolver(spotSchema),
    defaultValues: {
      latitude: 17.5947,
      longitude: 120.7913,
    },
  });

  const handleLocationSelect = (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
    setValue("latitude", lat);
    setValue("longitude", lng);
  };

  const onSubmit = async (data: SpotFormData) => {
    setLoading(true);
    try {
      const { error } = await supabase.from("tourist_spots").insert([
        {
          name: data.name,
          location: data.location,
          description: data.description,
          image_url: data.image_url || null,
          duration: data.duration || null,
          type: data.type || null,
          latitude: data.latitude,
          longitude: data.longitude,
        },
      ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Tourist spot added successfully",
      });
      reset();
      setLatitude(17.5947);
      setLongitude(120.7913);
      onSuccess?.();
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Tourist Spot</CardTitle>
        <CardDescription>Fill in the details and pin the location on the map</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" {...register("name")} />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input id="location" placeholder="e.g., Bangued, Abra" {...register("location")} />
              {errors.location && (
                <p className="text-sm text-destructive">{errors.location.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Input id="type" placeholder="e.g., Natural, Historical" {...register("type")} />
              {errors.type && (
                <p className="text-sm text-destructive">{errors.type.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Input id="duration" placeholder="e.g., 2-3 hours" {...register("duration")} />
              {errors.duration && (
                <p className="text-sm text-destructive">{errors.duration.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea id="description" rows={3} {...register("description")} />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url">Image URL</Label>
            <Input id="image_url" type="url" placeholder="https://..." {...register("image_url")} />
            {errors.image_url && (
              <p className="text-sm text-destructive">{errors.image_url.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Location on Map *</Label>
            <LocationMap
              latitude={latitude}
              longitude={longitude}
              onLocationSelect={handleLocationSelect}
            />
            {errors.latitude && (
              <p className="text-sm text-destructive">Please select a location on the map</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Add Tourist Spot
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default TouristSpotForm;
