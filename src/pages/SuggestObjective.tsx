import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { createObjectiveSuggestion } from "@/lib/supabase/mutations/suggestions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ImageUpload from "@/components/admin/ImageUpload";
import { SEO } from "@/components/seo/SEO";
import { toast } from "sonner";
import { Lightbulb, Send } from "lucide-react";
import { useState } from "react";

interface SuggestionFormData {
  title: string;
  location_country: string;
  location_city?: string;
  description: string;
  website_url?: string;
  latitude?: number;
  longitude?: number;
}

export default function SuggestObjective() {
  const navigate = useNavigate();
  const [images, setImages] = useState<string[]>([]);

  const { register, handleSubmit, formState: { errors } } = useForm<SuggestionFormData>();

  const createMutation = useMutation({
    mutationFn: (data: any) => createObjectiveSuggestion(data),
    onSuccess: () => {
      toast.success("Thank you! Your suggestion has been submitted for review.");
      navigate("/");
    },
    onError: () => {
      toast.error("Failed to submit suggestion");
    },
  });

  const onSubmit = (data: SuggestionFormData) => {
    createMutation.mutate({
      ...data,
      images,
    });
  };

  return (
    <>
      <SEO
        title="Suggest New Objective"
        description="Help us grow by suggesting new places to visit"
      />

      <div className="container py-8 max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <Lightbulb className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Suggest New Objective</h1>
            <p className="text-muted-foreground">
              Know a great place? Help us add it to the platform
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Objective Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  {...register("title", { required: "Title is required" })}
                  placeholder="Name of the place"
                />
                {errors.title && (
                  <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location_country">Country *</Label>
                  <Input
                    id="location_country"
                    {...register("location_country", { required: "Country is required" })}
                    placeholder="e.g. Romania"
                  />
                  {errors.location_country && (
                    <p className="text-sm text-destructive mt-1">{errors.location_country.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="location_city">City</Label>
                  <Input
                    id="location_city"
                    {...register("location_city")}
                    placeholder="e.g. Bucharest"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  {...register("description", { required: "Description is required" })}
                  placeholder="Tell us about this place and why it should be added..."
                  rows={6}
                />
                {errors.description && (
                  <p className="text-sm text-destructive mt-1">{errors.description.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    {...register("latitude", { valueAsNumber: true })}
                    placeholder="44.4268"
                  />
                </div>
                <div>
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    {...register("longitude", { valueAsNumber: true })}
                    placeholder="26.1025"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="website_url">Website URL</Label>
                <Input
                  id="website_url"
                  {...register("website_url")}
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <Label>Photos (optional)</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Upload up to 3 photos of this place
                </p>
                <ImageUpload
                  value={images[0] || ""}
                  onChange={(url) => setImages([url, ...images.slice(1)])}
                  bucket="objectives-images"
                />
              </div>

              <Button type="submit" disabled={createMutation.isPending} className="w-full">
                <Send className="mr-2 h-4 w-4" />
                Submit Suggestion
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="mt-6 bg-muted">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> Your suggestion will be reviewed by our team. If approved, it will be added to the platform and you'll be notified. Thank you for helping us grow!
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
