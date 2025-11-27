import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Eye, Pencil, Trash2, Landmark, Users, Palette, Music, FileText, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import EditCulturalHighlightForm from "./EditCulturalHighlightForm";

interface CulturalHighlight {
  id: string;
  title: string;
  description: string;
  detailed_content: string | null;
  icon_name: string;
  image_url: string | null;
  display_order: number;
  content_images: string[] | null;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Landmark,
  Users,
  Palette,
  Music,
};

interface CulturalHighlightsListProps {
  refresh: number;
}

const CulturalHighlightsList = ({ refresh }: CulturalHighlightsListProps) => {
  const [highlights, setHighlights] = useState<CulturalHighlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHighlight, setSelectedHighlight] = useState<CulturalHighlight | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contentDialogOpen, setContentDialogOpen] = useState(false);

  const fetchHighlights = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("cultural_highlights")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) {
      toast.error("Failed to load cultural highlights");
    } else {
      setHighlights(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHighlights();
  }, [refresh]);

  const handleDelete = async () => {
    if (!selectedHighlight) return;

    const { error } = await supabase
      .from("cultural_highlights")
      .delete()
      .eq("id", selectedHighlight.id);

    if (error) {
      toast.error("Failed to delete highlight");
    } else {
      toast.success("Highlight deleted successfully");
      fetchHighlights();
    }
    setDeleteDialogOpen(false);
    setSelectedHighlight(null);
  };

  const getIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName] || Landmark;
    return <IconComponent className="w-6 h-6 text-accent-foreground" />;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Cultural Highlights ({highlights.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {highlights.map((highlight) => (
              <Card key={highlight.id} className="bg-secondary/30 border-border">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-accent flex items-center justify-center shrink-0">
                      {getIcon(highlight.icon_name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{highlight.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {highlight.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        {highlight.detailed_content && (
                          <span className="flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            Has content
                          </span>
                        )}
                        {highlight.content_images && highlight.content_images.length > 0 && (
                          <span className="flex items-center gap-1">
                            <ImageIcon className="w-3 h-3" />
                            {highlight.content_images.length} images
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedHighlight(highlight);
                        setViewDialogOpen(true);
                      }}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedHighlight(highlight);
                        setContentDialogOpen(true);
                      }}
                    >
                      <FileText className="w-4 h-4 mr-1" />
                      Content
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedHighlight(highlight);
                        setEditDialogOpen(true);
                      }}
                    >
                      <Pencil className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setSelectedHighlight(highlight);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-accent flex items-center justify-center">
                {selectedHighlight && getIcon(selectedHighlight.icon_name)}
              </div>
              {selectedHighlight?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedHighlight?.image_url && (
              <img
                src={selectedHighlight.image_url}
                alt={selectedHighlight.title}
                className="w-full h-48 object-cover rounded-lg"
              />
            )}
            <div>
              <h4 className="font-semibold text-foreground mb-2">Description</h4>
              <p className="text-muted-foreground">{selectedHighlight?.description}</p>
            </div>
            {selectedHighlight?.detailed_content && (
              <div>
                <h4 className="font-semibold text-foreground mb-2">Detailed Content</h4>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {selectedHighlight.detailed_content}
                </p>
              </div>
            )}
            {selectedHighlight?.content_images && selectedHighlight.content_images.length > 0 && (
              <div>
                <h4 className="font-semibold text-foreground mb-2">Content Images ({selectedHighlight.content_images.length})</h4>
                <div className="grid grid-cols-2 gap-2">
                  {selectedHighlight.content_images.map((url, index) => (
                    <img
                      key={index}
                      src={url}
                      alt={`Content ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Content Preview Dialog */}
      <Dialog open={contentDialogOpen} onOpenChange={setContentDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-primary" />
              Content Preview: {selectedHighlight?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This is how the content will appear when users click on this cultural highlight.
            </p>
            
            {selectedHighlight?.image_url && (
              <img
                src={selectedHighlight.image_url}
                alt={selectedHighlight.title}
                className="w-full h-56 object-cover rounded-lg"
              />
            )}
            
            <div className="prose prose-sm max-w-none">
              <h3 className="text-lg font-semibold text-foreground">{selectedHighlight?.title}</h3>
              <p className="text-muted-foreground">{selectedHighlight?.description}</p>
            </div>
            
            {selectedHighlight?.detailed_content && (
              <div className="bg-secondary/30 rounded-lg p-4">
                <p className="text-foreground whitespace-pre-wrap">
                  {selectedHighlight.detailed_content}
                </p>
              </div>
            )}
            
            {selectedHighlight?.content_images && selectedHighlight.content_images.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground">Gallery</h4>
                <div className="grid grid-cols-2 gap-3">
                  {selectedHighlight.content_images.map((url, index) => (
                    <img
                      key={index}
                      src={url}
                      alt={`${selectedHighlight.title} - Image ${index + 1}`}
                      className="w-full h-40 object-cover rounded-lg"
                    />
                  ))}
                </div>
              </div>
            )}
            
            {!selectedHighlight?.detailed_content && (!selectedHighlight?.content_images || selectedHighlight.content_images.length === 0) && (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No detailed content or images added yet.</p>
                <p className="text-sm">Click "Edit" to add content and images.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Cultural Highlight</DialogTitle>
          </DialogHeader>
          {selectedHighlight && (
            <EditCulturalHighlightForm
              highlight={selectedHighlight}
              onSuccess={() => {
                setEditDialogOpen(false);
                setSelectedHighlight(null);
                fetchHighlights();
              }}
              onCancel={() => {
                setEditDialogOpen(false);
                setSelectedHighlight(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Cultural Highlight</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Are you sure you want to delete "{selectedHighlight?.title}"? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CulturalHighlightsList;
