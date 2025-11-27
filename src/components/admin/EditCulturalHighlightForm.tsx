import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, X, Plus, ImageIcon } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  description: z.string().min(1, "Description is required").max(500, "Description must be less than 500 characters"),
  detailed_content: z.string().max(5000, "Detailed content must be less than 5000 characters").optional(),
  icon_name: z.string().min(1, "Icon is required"),
  image_url: z.string().url("Invalid URL").optional().or(z.literal("")),
  display_order: z.number().min(0),
});

type FormData = z.infer<typeof formSchema>;

interface EditCulturalHighlightFormProps {
  highlight: {
    id: string;
    title: string;
    description: string;
    detailed_content: string | null;
    icon_name: string;
    image_url: string | null;
    display_order: number;
    content_images: string[] | null;
  };
  onSuccess: () => void;
  onCancel: () => void;
}

const iconOptions = [
  { value: "Landmark", label: "Landmark (Ancient Traditions)" },
  { value: "Users", label: "Users (Heritage)" },
  { value: "Palette", label: "Palette (Crafts)" },
  { value: "Music", label: "Music (Folk Music & Dance)" },
];

const EditCulturalHighlightForm = ({ highlight, onSuccess, onCancel }: EditCulturalHighlightFormProps) => {
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(highlight.image_url);
  const [contentImages, setContentImages] = useState<string[]>(highlight.content_images || []);
  const [uploadingContentImage, setUploadingContentImage] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: highlight.title,
      description: highlight.description,
      detailed_content: highlight.detailed_content || "",
      icon_name: highlight.icon_name,
      image_url: highlight.image_url || "",
      display_order: highlight.display_order,
    },
  });

  const selectedIcon = watch("icon_name");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File, prefix: string = "cultural"): Promise<string | null> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${prefix}-${highlight.id}-${Date.now()}.${fileExt}`;
    const filePath = `cultural/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("tourist-spots")
      .upload(filePath, file);

    if (uploadError) {
      toast.error("Failed to upload image");
      return null;
    }

    const { data } = supabase.storage.from("tourist-spots").getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleContentImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingContentImage(true);
    const uploadedUrl = await uploadImage(file, "content");
    setUploadingContentImage(false);

    if (uploadedUrl) {
      setContentImages([...contentImages, uploadedUrl]);
      toast.success("Content image added");
    }
    
    // Reset the input
    e.target.value = "";
  };

  const removeContentImage = (index: number) => {
    setContentImages(contentImages.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);

    let imageUrl = data.image_url || null;

    if (imageFile) {
      const uploadedUrl = await uploadImage(imageFile);
      if (uploadedUrl) {
        imageUrl = uploadedUrl;
      }
    }

    const { error } = await supabase
      .from("cultural_highlights")
      .update({
        title: data.title,
        description: data.description,
        detailed_content: data.detailed_content || null,
        icon_name: data.icon_name,
        image_url: imageUrl,
        display_order: data.display_order,
        content_images: contentImages,
      })
      .eq("id", highlight.id);

    setLoading(false);

    if (error) {
      toast.error("Failed to update cultural highlight");
    } else {
      toast.success("Cultural highlight updated successfully");
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" {...register("title")} placeholder="Enter title" />
        {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Short Description</Label>
        <Textarea
          id="description"
          {...register("description")}
          placeholder="Brief description shown on the card"
          rows={3}
        />
        {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="detailed_content">Detailed Content</Label>
        <Textarea
          id="detailed_content"
          {...register("detailed_content")}
          placeholder="Full content shown when users click to view details"
          rows={6}
        />
        {errors.detailed_content && <p className="text-sm text-destructive">{errors.detailed_content.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="icon_name">Icon</Label>
        <Select value={selectedIcon} onValueChange={(value) => setValue("icon_name", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select an icon" />
          </SelectTrigger>
          <SelectContent>
            {iconOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.icon_name && <p className="text-sm text-destructive">{errors.icon_name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="display_order">Display Order</Label>
        <Input
          id="display_order"
          type="number"
          {...register("display_order", { valueAsNumber: true })}
          placeholder="Order in which to display (1, 2, 3, etc.)"
        />
        {errors.display_order && <p className="text-sm text-destructive">{errors.display_order.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="image">Card Image (Thumbnail)</Label>
        <Input id="image" type="file" accept="image/*" onChange={handleImageChange} />
        {imagePreview && (
          <div className="mt-2">
            <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover rounded-md" />
          </div>
        )}
      </div>

      {/* Content Images Section */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4" />
          Content Images (shown in popup)
        </Label>
        <p className="text-xs text-muted-foreground">Add multiple images to display within the detailed content</p>
        
        {contentImages.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mt-2">
            {contentImages.map((url, index) => (
              <div key={index} className="relative group">
                <img
                  src={url}
                  alt={`Content ${index + 1}`}
                  className="w-full h-20 object-cover rounded-md"
                />
                <button
                  type="button"
                  onClick={() => removeContentImage(index)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <Input
            id="content-image"
            type="file"
            accept="image/*"
            onChange={handleContentImageUpload}
            disabled={uploadingContentImage}
            className="flex-1"
          />
          {uploadingContentImage && <Loader2 className="w-4 h-4 animate-spin" />}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
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

export default EditCulturalHighlightForm;
