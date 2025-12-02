import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import Breadcrumbs from "@/components/admin/Breadcrumbs";
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
import { AIContentHelper } from "@/components/features/ai/AIContentHelper";
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
  featured: z.boolean().optional(),
  meta_title: z.string().max(60).optional(),
  meta_description: z.string().max(160).optional(),
});

type ArticleFormData = z.infer<typeof articleSchema>;

export default function BlogArticleForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(!!id);
  const [tagInput, setTagInput] = useState("");

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
        // Only set fields that exist in the form schema
        setValue("title", data.title);
        setValue("slug", data.slug);
        setValue("excerpt", data.excerpt || "");
        setValue("category", data.category || "");
        setValue("tags", data.tags || []);
        setValue("content", data.content || "");
        setValue("featured_image", data.featured_image || "");
        setValue("featured", data.featured || false);
        setValue("meta_title", data.meta_title || "");
        setValue("meta_description", data.meta_description || "");
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
      // Clean data - only include fields that exist in database
      const articleData = {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt || null,
        category: data.category || null,
        tags: data.tags || [],
        content: data.content || null,
        featured_image: data.featured_image,
        featured: data.featured || false,
        meta_title: data.meta_title || null,
        meta_description: data.meta_description || null,
        published,
        published_at: published ? new Date().toISOString() : null,
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


  if (loadingData) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex gap-6 max-w-7xl">
      {/* Main Content */}
      <div className="flex-1">
        <Breadcrumbs
          items={[
            { label: "Blog", href: ADMIN_ROUTES.blog },
            { label: id ? "Editează" : "Articol Nou" },
          ]}
        />
      
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
            </Card>
          </TabsContent>

          {/* TAB 4: SEO */}
          <TabsContent value="seo">
            <Card className="p-6 space-y-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="featured"
                  checked={featured}
                  onCheckedChange={(checked) => setValue("featured", checked)}
                />
                <Label htmlFor="featured">Featured (Afișează pe homepage)</Label>
              </div>

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

      {/* AI Sidebar */}
      <div className="w-80 flex-shrink-0">
        <div className="sticky top-6">
          <AIContentHelper
            title={title || ""}
            description={excerpt || ""}
            content={content || ""}
            onApplyTags={(suggestedTags) => {
              setValue("tags", [...new Set([...tags, ...suggestedTags])]);
              toast.success("Tag-uri aplicate!");
            }}
            onApplyKeywords={(keywords) => {
              toast.info("Keywords: " + keywords.join(", "));
            }}
            onApplyMetaDescription={(desc) => {
              setValue("meta_description", desc);
              toast.success("Meta description aplicată!");
            }}
          />
        </div>
      </div>
    </div>
  );
}
