import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { createJournal } from "@/lib/supabase/mutations/journals";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RichTextEditor from "@/components/admin/RichTextEditor";
import ImageUpload from "@/components/admin/ImageUpload";
import { SEO } from "@/components/seo/SEO";
import { toast } from "sonner";
import { BookOpen, Save, Eye } from "lucide-react";

const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-')      // Replace spaces with -
    .replace(/-+/g, '-')       // Replace multiple - with single -
    .substring(0, 100);        // Limit length
};

interface JournalFormData {
  title: string;
  excerpt: string;
  content: string;
  cover_image: string;
  gallery_images: string[];
  trip_start_date?: string;
  trip_end_date?: string;
}

export default function CreateJournal() {
  const navigate = useNavigate();
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [galleryImages, setGalleryImages] = useState<string[]>([]);

  const { register, handleSubmit, formState: { errors } } = useForm<JournalFormData>();

  const createMutation = useMutation({
    mutationFn: (data: any) => createJournal(data),
    onSuccess: (data) => {
      toast.success("Journal created successfully!");
      navigate(`/journals/${data.slug}`);
    },
    onError: () => {
      toast.error("Failed to create journal");
    },
  });

  const onSubmit = (data: JournalFormData) => {
    createMutation.mutate({
      ...data,
      slug: generateSlug(data.title), // ← ADD THIS
      content,
      cover_image: coverImage,
      gallery_images: galleryImages,
      published: true,
    });
  };

const saveDraft = (data: JournalFormData) => {
  createMutation.mutate({
    ...data,
    slug: generateSlug(data.title), // ← ADD THIS
    content,
    cover_image: coverImage,
    gallery_images: galleryImages,
    published: false,
  });
};

  return (
    <>
      <SEO
        title="Write Travel Journal"
        description="Share your travel story with the community"
      />

      <div className="container py-8 max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <BookOpen className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Write Travel Journal</h1>
            <p className="text-muted-foreground">
              Share your adventure with the community
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Journal Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  {...register("title", { required: "Title is required" })}
                  placeholder="My Amazing Trip to..."
                />
                {errors.title && (
                  <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="excerpt">Excerpt</Label>
                <Input
                  id="excerpt"
                  {...register("excerpt")}
                  placeholder="A short description of your journey"
                />
              </div>

              <div>
                <Label>Cover Image</Label>
                <ImageUpload
                  value={coverImage}
                  onChange={setCoverImage}
                  bucket="blog-images"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="trip_start_date">Trip Start Date</Label>
                  <Input
                    id="trip_start_date"
                    type="date"
                    {...register("trip_start_date")}
                  />
                </div>
                <div>
                  <Label htmlFor="trip_end_date">Trip End Date</Label>
                  <Input
                    id="trip_end_date"
                    type="date"
                    {...register("trip_end_date")}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
            </CardHeader>
            <CardContent>
              <RichTextEditor
                content={content}
                onChange={setContent}
              />
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleSubmit(saveDraft)}
              disabled={createMutation.isPending}
            >
              <Save className="mr-2 h-4 w-4" />
              Save Draft
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              <Eye className="mr-2 h-4 w-4" />
              Publish
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
