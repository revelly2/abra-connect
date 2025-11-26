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

const CATEGORIES = ["Historical", "Nature", "Heritage", "Rivers", "Mountain"] as const;

const spotSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  location: z.string().min(1, "Location is required").max(200),
  description: z.string().min(1, "Description is required").max(1000),
  categories: z.array(z.string()).min(1, "Select at least one category"),
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

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
      categories: [],
    },
  });

  const handleLocationSelect = (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
    setValue("latitude", lat);
    setValue("longitude", lng);
  };

  const handleCategoryToggle = (category: string) => {
    const updated = selectedCategories.includes(category)
      ? selectedCategories.filter(c => c !== category)
      : [...selectedCategories, category];
    setSelectedCategories(updated);
    setValue("categories", updated);
  };

  const onSubmit = async (data: SpotFormData) => {
    setLoading(true);
    try {
      let imageUrl = null;

      // Upload image if selected
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('tourist-spots')
          .upload(filePath, selectedFile);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('tourist-spots')
          .getPublicUrl(filePath);

        imageUrl = publicUrl;
      }

      const { error } = await supabase.from("tourist_spots").insert([
        {
          name: data.name,
          location: data.location,
          description: data.description,
          image_url: imageUrl,
          categories: data.categories,
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
      setSelectedFile(null);
      setSelectedCategories([]);
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
          </div>

          <div className="space-y-2">
            <Label>Categories *</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {CATEGORIES.map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={category}
                    checked={selectedCategories.includes(category)}
                    onChange={() => handleCategoryToggle(category)}
                    className="h-4 w-4 rounded border-input"
                  />
                  <Label htmlFor={category} className="cursor-pointer font-normal">
                    {category}
                  </Label>
                </div>
              ))}
            </div>
            {errors.categories && (
              <p className="text-sm text-destructive">{errors.categories.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea id="description" rows={3} {...register("description")} />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Image *</Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            />
            {selectedFile && (
              <p className="text-sm text-muted-foreground">Selected: {selectedFile.name}</p>
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
