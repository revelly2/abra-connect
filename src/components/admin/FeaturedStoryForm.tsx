import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import { Loader2, Save } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description_1: z.string().min(1, "First paragraph is required"),
  description_2: z.string().min(1, "Second paragraph is required"),
  heritage_since: z.string().min(1, "Heritage year is required"),
  years_of_history: z.string().min(1, "Years of history is required"),
});

type FormData = z.infer<typeof formSchema>;

interface FeaturedStory {
  id: string;
  title: string;
  description_1: string;
  description_2: string;
  heritage_since: string;
  years_of_history: string;
}

const FeaturedStoryForm = () => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [storyId, setStoryId] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description_1: "",
      description_2: "",
      heritage_since: "",
      years_of_history: "",
    },
  });

  useEffect(() => {
    const fetchStory = async () => {
      const { data, error } = await supabase
        .from("featured_story")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        setStoryId(data.id);
        form.reset({
          title: data.title,
          description_1: data.description_1,
          description_2: data.description_2,
          heritage_since: data.heritage_since,
          years_of_history: data.years_of_history,
        });
      }
      setFetching(false);
    };

    fetchStory();
  }, [form]);

  const onSubmit = async (values: FormData) => {
    setLoading(true);
    try {
      if (storyId) {
        const { error } = await supabase
          .from("featured_story")
          .update(values)
          .eq("id", storyId);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("featured_story")
          .insert(values)
          .select()
          .single();

        if (error) throw error;
        setStoryId(data.id);
      }

      toast({
        title: "Success",
        description: "Featured story updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update featured story",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <Card>
        <CardContent className="py-12 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Featured Story</CardTitle>
        <CardDescription>
          Edit the "Legend of Abra" featured story section shown on the homepage
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="The Legend of Abra" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description_1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Paragraph</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter the first paragraph..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description_2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Second Paragraph</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter the second paragraph..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="heritage_since"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cultural Heritage Since</FormLabel>
                    <FormControl>
                      <Input placeholder="1598" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="years_of_history"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Years of History</FormLabel>
                    <FormControl>
                      <Input placeholder="500+" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default FeaturedStoryForm;
