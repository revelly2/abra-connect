import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Trash2, MapPin, Tag, Eye, Pencil, QrCode, Download, Globe } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import EditTouristSpotForm from "./EditTouristSpotForm";

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
  created_at: string;
}

interface TouristSpotsListProps {
  refresh: number;
}

const TouristSpotsList = ({ refresh }: TouristSpotsListProps) => {
  const [spots, setSpots] = useState<TouristSpot[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSpot, setEditingSpot] = useState<TouristSpot | null>(null);
  const [qrSpot, setQrSpot] = useState<TouristSpot | null>(null);
  const [baseUrl, setBaseUrl] = useState<string>(() => {
    return localStorage.getItem("qr_base_url") || window.location.origin;
  });
  const qrRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleBaseUrlChange = (url: string) => {
    const cleanUrl = url.replace(/\/$/, ""); // Remove trailing slash
    setBaseUrl(cleanUrl);
    localStorage.setItem("qr_base_url", cleanUrl);
  };

  const getSpotUrl = (spotId: string) => {
    return `${baseUrl}/spot/${spotId}`;
  };

  const handleDownloadQR = (spotName: string) => {
    if (!qrRef.current) return;
    
    const svg = qrRef.current.querySelector("svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = 300;
      canvas.height = 300;
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, 300, 300);
        
        const link = document.createElement("a");
        link.download = `qr-${spotName.toLowerCase().replace(/\s+/g, "-")}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      }
    };

    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

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
                    {spot.categories && spot.categories.length > 0 && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Tag className="w-4 h-4 flex-shrink-0" />
                        <span>{spot.categories.join(", ")}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {/* QR Code Dialog */}
                    <Dialog open={qrSpot?.id === spot.id} onOpenChange={(open) => !open && setQrSpot(null)}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setQrSpot(spot)} title="Generate QR Code">
                          <QrCode className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>QR Code for {spot.name}</DialogTitle>
                          <DialogDescription>
                            Scan this code to visit the spot's landing page
                          </DialogDescription>
                        </DialogHeader>
                        <div className="flex flex-col space-y-4 py-4">
                          {/* Base URL Setting */}
                          <div className="space-y-2">
                            <Label htmlFor="base-url" className="flex items-center gap-2 text-sm">
                              <Globe className="w-4 h-4" />
                              Website Base URL
                            </Label>
                            <Input
                              id="base-url"
                              placeholder="https://your-domain.com"
                              value={baseUrl}
                              onChange={(e) => handleBaseUrlChange(e.target.value)}
                              className="text-sm"
                            />
                            <p className="text-xs text-muted-foreground">
                              Set your custom domain so QR codes point to your hosted site
                            </p>
                          </div>
                          
                          {/* QR Code Display */}
                          <div className="flex flex-col items-center space-y-3">
                            <div ref={qrRef} className="bg-white p-4 rounded-lg">
                              <QRCodeSVG
                                value={getSpotUrl(spot.id)}
                                size={180}
                                level="H"
                                includeMargin
                              />
                            </div>
                            <p className="text-xs text-muted-foreground text-center break-all max-w-full px-2">
                              {getSpotUrl(spot.id)}
                            </p>
                          </div>
                          
                          <Button onClick={() => handleDownloadQR(spot.name)} className="w-full">
                            <Download className="w-4 h-4 mr-2" />
                            Download QR Code
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    {/* View Details Dialog */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="text-2xl">{spot.name}</DialogTitle>
                          <DialogDescription className="flex items-center gap-2 text-base">
                            <MapPin className="w-4 h-4" />
                            {spot.location}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          {spot.image_url && (
                            <img
                              src={spot.image_url}
                              alt={spot.name}
                              className="w-full h-64 object-cover rounded-lg"
                            />
                          )}
                          <div>
                            <h3 className="font-semibold mb-2">Categories</h3>
                            <div className="flex gap-2 flex-wrap">
                              {spot.categories?.map((category) => (
                                <span key={category} className="text-sm px-3 py-1 bg-primary/10 text-primary rounded-full">
                                  {category}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h3 className="font-semibold mb-2">Short Description</h3>
                            <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                              {spot.description}
                            </p>
                          </div>
                          {spot.detailed_content && (
                            <div>
                              <h3 className="font-semibold mb-2">Full History & Details</h3>
                              <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                                {spot.detailed_content}
                              </p>
                            </div>
                          )}
                          <div>
                            <h3 className="font-semibold mb-2">Location Coordinates</h3>
                            <p className="text-sm text-muted-foreground">
                              Latitude: {spot.latitude.toFixed(6)}, Longitude: {spot.longitude.toFixed(6)}
                            </p>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Dialog open={editingSpot?.id === spot.id} onOpenChange={(open) => !open && setEditingSpot(null)}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setEditingSpot(spot)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Edit Tourist Spot</DialogTitle>
                          <DialogDescription>
                            Update the details for {spot.name}
                          </DialogDescription>
                        </DialogHeader>
                        {editingSpot?.id === spot.id && (
                          <EditTouristSpotForm
                            spot={editingSpot}
                            onSuccess={() => {
                              setEditingSpot(null);
                              fetchSpots();
                            }}
                            onCancel={() => setEditingSpot(null)}
                          />
                        )}
                      </DialogContent>
                    </Dialog>
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
                </div>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                  {spot.description}
                </p>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {spot.categories?.map((category) => (
                    <span key={category} className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                      {category}
                    </span>
                  ))}
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
