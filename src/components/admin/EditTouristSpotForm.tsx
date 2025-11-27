import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import LocationMap from "./LocationMap";
import { Loader2 } from "lucide-react";

const CATEGORIES = ["Historical", "Nature", "Heritage", "Rivers", "Mountain"] as const;

const spotSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  location: z.string().min(1, "Location is required").max(200),
  description: z.string().min(1, "Description is required").max(1000),
  detailed_content: z.string().optional(),
  categories: z.array(z.string()).min(1, "Select at least one category"),
  latitude: z.number(),
  longitude: z.number(),
});

type SpotFormData = z.infer<typeof spotSchema>;

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

interface EditTouristSpotFormProps {
  spot: TouristSpot;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const EditTouristSpotForm = ({ spot, onSuccess, onCancel }: EditTouristSpotFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [latitude, setLatitude] = useState(spot.latitude);
  const [longitude, setLongitude] = useState(spot.longitude);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(spot.categories || []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<SpotFormData>({
    resolver: zodResolver(spotSchema),
    defaultValues: {
      name: spot.name,
      location: spot.location,
      description: spot.description,
      detailed_content: spot.detailed_content || "",
      latitude: spot.latitude,
      longitude: spot.longitude,
      categories: spot.categories || [],
    },
  });

  useEffect(() => {
    setValue("categories", selectedCategories);
  }, [selectedCategories, setValue]);

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
      let imageUrl = spot.image_url;

      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('tourist-spots')
          .upload(filePath, selectedFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('tourist-spots')
          .getPublicUrl(filePath);

        imageUrl = publicUrl;
      }

      const { error } = await supabase
        .from("tourist_spots")
        .update({
          name: data.name,
          location: data.location,
          description: data.description,
          detailed_content: data.detailed_content,
          image_url: imageUrl,
          categories: data.categories,
          latitude: data.latitude,
          longitude: data.longitude,
        })
        .eq("id", spot.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Tourist spot updated successfully",
      });
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="edit-name">Name *</Label>
          <Input id="edit-name" {...register("name")} />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-location">Location *</Label>
          <Input id="edit-location" placeholder="e.g., Bangued, Abra" {...register("location")} />
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
                id={`edit-${category}`}
                checked={selectedCategories.includes(category)}
                onChange={() => handleCategoryToggle(category)}
                className="h-4 w-4 rounded border-input"
              />
              <Label htmlFor={`edit-${category}`} className="cursor-pointer font-normal">
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
        <Label htmlFor="edit-description">Short Description *</Label>
        <Textarea id="edit-description" rows={3} placeholder="Brief overview for the card" {...register("description")} />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-detailed_content">Full History / Detailed Content</Label>
        <Textarea 
          id="edit-detailed_content" 
          rows={6} 
          placeholder="Complete history, detailed information, and interesting facts"
          {...register("detailed_content")} 
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-image">Change Image (optional)</Label>
        <Input
          id="edit-image"
          type="file"
          accept="image/*"
          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
        />
        {spot.image_url && !selectedFile && (
          <p className="text-sm text-muted-foreground">Current image will be kept</p>
        )}
        {selectedFile && (
          <p className="text-sm text-muted-foreground">New image: {selectedFile.name}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Location on Map *</Label>
        <LocationMap
          latitude={latitude}
          longitude={longitude}
          onLocationSelect={handleLocationSelect}
        />
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Save Changes
        </Button>
      </div>
    </form>
  );
};

export default EditTouristSpotForm;
