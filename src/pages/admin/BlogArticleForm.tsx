import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ImageUpload from "@/components/admin/ImageUpload";
import RichTextEditor from "@/components/admin/RichTextEditor";
import CharacterCounter from "@/components/admin/CharacterCounter";
import { toast } from "sonner";
import { ADMIN_ROUTES } from "@/lib/constants/routes";
import { createBlogArticle, updateBlogArticle } from "@/lib/supabase/mutations/blog";
import { getBlogArticleById } from "@/lib/supabase/queries/blog";
import { slugify } from "@/lib/utils";
import { Constants } from "@/integrations/supabase/types";

const blogCategories = Constants.public.Enums.blog_category;

const articleSchema = z.object({
  title: z.string().min(1, "Titlul este obligatoriu").max(200),
  slug: z.string().min(1, "Slug-ul este obligatoriu"),
  excerpt: z.string().max(300).optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  content: z.string().optional(),
  featured_image: z.string().min(1, "Imaginea principală este obligatorie"),
  gallery_images: z.array(z.object({ url: z.string(), alt: z.string().optional() })).optional(),
  author_name: z.string().optional(),
  author_avatar: z.string().optional(),
  featured: z.boolean().optional(),
  featured_until: z.string().optional().nullable(),
  meta_title: z.string().max(60).optional(),
  meta_description: z.string().max(160).optional(),
  canonical_url: z.string().url().optional().or(z.literal("")),
});

type ArticleFormData = z.infer<typeof articleSchema>;

export default function BlogArticleForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(!!id);
  const [tagInput, setTagInput] = useState("");
  const [galleryImages, setGalleryImages] = useState<Array<{ url: string; alt: string }>>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ArticleFormData>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      featured: false,
      tags: [],
      gallery_images: [],
    },
  });

  const title = watch("title");
  const slug = watch("slug");
  const excerpt = watch("excerpt");
  const content = watch("content");
  const featured = watch("featured");
  const tags = watch("tags") || [];
  const metaTitle = watch("meta_title");
  const metaDescription = watch("meta_description");

  // Auto-generate slug from title
  useEffect(() => {
    if (title && (!id || !slug)) {
      setValue("slug", slugify(title));
    }
  }, [title, id, slug, setValue]);

  // Load article data if editing
  useEffect(() => {
    if (id) {
      loadArticle();
    }
  }, [id]);

  async function loadArticle() {
    try {
      const data = await getBlogArticleById(id!);
      if (data) {
        Object.keys(data).forEach((key) => {
          setValue(key as any, (data as any)[key]);
        });
        if ((data as any).gallery_images) {
          setGalleryImages((data as any).gallery_images);
        }
      }
    } catch (error) {
      console.error("Error loading article:", error);
      toast.error("Eroare la încărcarea articolului");
    } finally {
      setLoadingData(false);
    }
  }

  async function onSubmit(data: ArticleFormData, published: boolean) {
    setLoading(true);
    try {
      const articleData = {
        ...data,
        published,
        published_at: published ? new Date().toISOString() : null,
        gallery_images: galleryImages.length > 0 ? galleryImages : null,
      };

      if (id) {
        await updateBlogArticle(id, articleData as any);
        toast.success("Articol salvat cu succes!");
      } else {
        const newArticle = await createBlogArticle(articleData as any);
        toast.success("Articol creat cu succes!");
        navigate(`${ADMIN_ROUTES.blog}/${newArticle.id}`);
      }
    } catch (error) {
      console.error("Error saving article:", error);
      toast.error("Eroare la salvarea articolului");
    } finally {
      setLoading(false);
    }
  }

  function addTag() {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setValue("tags", [...tags, tagInput.trim()]);
      setTagInput("");
    }
  }

  function removeTag(tag: string) {
    setValue(
      "tags",
      tags.filter((t) => t !== tag)
    );
  }

  function addGalleryImage(url: string) {
    setGalleryImages([...galleryImages, { url, alt: "" }]);
  }

  function removeGalleryImage(index: number) {
    setGalleryImages(galleryImages.filter((_, i) => i !== index));
  }

  if (loadingData) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl">
      <div className="mb-6">
        <h2 className="text-3xl font-display font-bold">
          {id ? "Editează Articol" : "Articol Nou"}
        </h2>
        <p className="text-muted-foreground mt-2">
          {id ? `Modifică articolul "${title}"` : "Scrie un articol nou pentru blog"}
        </p>
      </div>

      <form onSubmit={handleSubmit((data) => onSubmit(data, false))}>
        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Info de Bază</TabsTrigger>
            <TabsTrigger value="content">Conținut</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
          </TabsList>

          {/* TAB 1: INFO DE BAZĂ */}
          <TabsContent value="basic">
            <Card className="p-6 space-y-6">
              <div>
                <Label htmlFor="title">Titlu Articol *</Label>
                <Input
                  id="title"
                  {...register("title")}
                  placeholder="ex: Cele mai frumoase obiective din Transilvania"
                  className="mt-2"
                />
                <CharacterCounter current={title?.length || 0} max={200} />
                {errors.title && (
                  <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="slug">Slug (URL) *</Label>
                <Input
                  id="slug"
                  {...register("slug")}
                  placeholder="cele-mai-frumoase-obiective-transilvania"
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  apot.ro/blog/{slug || "slug-articol"}
                </p>
                {errors.slug && (
                  <p className="text-sm text-destructive mt-1">{errors.slug.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="excerpt">Descriere Scurtă</Label>
                <Textarea
                  id="excerpt"
                  {...register("excerpt")}
                  placeholder="Descriere scurtă pentru preview și SEO"
                  rows={3}
                  className="mt-2"
                />
                <CharacterCounter current={excerpt?.length || 0} max={300} />
              </div>

              <div>
                <Label htmlFor="category">Categorie</Label>
                <select
                  id="category"
                  {...register("category")}
                  className="mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Selectează categorie</option>
                  {blogCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="tags">Tag-uri</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="tags"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                    placeholder="Adaugă tag și apasă Enter"
                  />
                  <Button type="button" onClick={addTag} variant="secondary">
                    Adaugă
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* TAB 2: CONȚINUT */}
          <TabsContent value="content">
            <Card className="p-6">
              <Label>Conținut Articol</Label>
              <div className="mt-4">
                <RichTextEditor
                  content={content || ""}
                  onChange={(html) => setValue("content", html)}
                  placeholder="Scrie conținutul articolului aici..."
                />
              </div>
            </Card>
          </TabsContent>

          {/* TAB 3: MEDIA */}
          <TabsContent value="media">
            <Card className="p-6 space-y-6">
              <div>
                <Label>Imagine Principală *</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Va apărea pe carduri și în articol (16:9 recomandat)
                </p>
                <ImageUpload
                  bucket="blog-images"
                  value={watch("featured_image")}
                  onChange={(url) => setValue("featured_image", url)}
                />
                {errors.featured_image && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.featured_image.message}
                  </p>
                )}
              </div>

              <div>
                <Label>Galerie Imagini (Opțional)</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Pentru articole cu galerie foto
                </p>
                <ImageUpload
                  bucket="blog-images"
                  value=""
                  onChange={addGalleryImage}
                />
                <div className="grid grid-cols-4 gap-4 mt-4">
                  {galleryImages.map((img, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={img.url}
                        alt={img.alt || "Gallery"}
                        className="w-full h-32 object-cover rounded"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeGalleryImage(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* TAB 4: SEO & CLASIFICARE */}
          <TabsContent value="seo">
            <Card className="p-6 space-y-6">
              <div>
                <Label htmlFor="author_name">Nume Autor</Label>
                <Input
                  id="author_name"
                  {...register("author_name")}
                  placeholder="Echipa APOT"
                  className="mt-2"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="featured"
                  checked={featured}
                  onCheckedChange={(checked) => setValue("featured", checked)}
                />
                <Label htmlFor="featured">Featured (Afișează pe homepage)</Label>
              </div>

              {featured && (
                <div>
                  <Label htmlFor="featured_until">Featured Până La</Label>
                  <Input
                    id="featured_until"
                    type="date"
                    {...register("featured_until")}
                    className="mt-2"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="meta_title">Meta Title (Override)</Label>
                <Input
                  id="meta_title"
                  {...register("meta_title")}
                  placeholder="Lasă gol pentru generare automată"
                  className="mt-2"
                />
                <CharacterCounter current={metaTitle?.length || 0} max={60} />
              </div>

              <div>
                <Label htmlFor="meta_description">Meta Description (Override)</Label>
                <Textarea
                  id="meta_description"
                  {...register("meta_description")}
                  placeholder="Lasă gol pentru generare automată"
                  rows={3}
                  className="mt-2"
                />
                <CharacterCounter current={metaDescription?.length || 0} max={160} />
              </div>

              <div>
                <Label htmlFor="canonical_url">URL Canonical (Avansat)</Label>
                <Input
                  id="canonical_url"
                  {...register("canonical_url")}
                  placeholder="Pentru conținut republicat"
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Lasă gol pentru articole originale
                </p>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Sticky Action Buttons */}
        <div className="sticky bottom-0 bg-background border-t mt-6 py-4 flex items-center justify-between gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(ADMIN_ROUTES.blog)}
          >
            Anulează
          </Button>
          <div className="flex gap-3">
            <Button
              type="submit"
              variant="secondary"
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvează Draft
            </Button>
            <Button
              type="button"
              onClick={handleSubmit((data) => onSubmit(data, true))}
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Publică
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
