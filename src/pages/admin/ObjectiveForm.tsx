import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Loader2, Save, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { slugify } from "@/lib/utils";
import { getObjectiveById } from "@/lib/supabase/queries/objectives";
import {
  createObjective,
  updateObjective,
  updateObjectiveTypes,
} from "@/lib/supabase/mutations/objectives";
import {
  getContinents,
  getCountries,
  getObjectiveTypes,
} from "@/lib/supabase/queries/taxonomies";
import ImageUpload from "@/components/admin/ImageUpload";
import RichTextEditor from "@/components/admin/RichTextEditor";
import CharacterCounter from "@/components/admin/CharacterCounter";
import { AIContentHelper } from "@/components/features/ai/AIContentHelper";
import { ADMIN_ROUTES } from "@/lib/constants/routes";

export default function ObjectiveForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id && id !== "nou";

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [continents, setContinents] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [objectiveTypes, setObjectiveTypes] = useState<any[]>([]);

  const [formData, setFormData] = useState<any>({
    title: "",
    slug: "",
    continent_id: "",
    country_id: "",
    excerpt: "",
    description: "",
    featured_image: "",
    gallery_images: [],
    video_urls: [],
    location_text: "",
    latitude: null,
    longitude: null,
    google_place_id: "",
    visit_duration: "",
    best_season: "",
    difficulty_level: "",
    entrance_fee: "",
    opening_hours: "",
    accessibility_info: "",
    website_url: "",
    contact_email: "",
    contact_phone: "",
    booking_url: "",
    unesco_site: false,
    unesco_year: null,
    featured: false,
    featured_until: null,
    meta_title: "",
    meta_description: "",
    selected_types: [] as string[],
  });

  useEffect(() => {
    loadTaxonomies();
    if (isEdit) loadObjective();
  }, [isEdit, id]);

  useEffect(() => {
    if (formData.continent_id) {
      loadCountries(formData.continent_id);
    }
  }, [formData.continent_id]);

  async function loadTaxonomies() {
    try {
      const [continentsData, typesData] = await Promise.all([
        getContinents(),
        getObjectiveTypes(),
      ]);
      setContinents(continentsData);
      setObjectiveTypes(typesData);
    } catch (error) {
      console.error("Error loading taxonomies:", error);
    }
  }

  async function loadCountries(continentId: string) {
    try {
      const data = await getCountries(continentId);
      setCountries(data);
    } catch (error) {
      console.error("Error loading countries:", error);
    }
  }

  async function loadObjective() {
    try {
      const data = await getObjectiveById(id!);
      setFormData({
        ...data,
        selected_types: data.types?.map((t: any) => t.id) || [],
      });
    } catch (error) {
      console.error("Error loading objective:", error);
      toast.error("Eroare la încărcarea obiectivului");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(field: string, value: any) {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value,
    }));

    if (field === "title" && !isEdit) {
      setFormData((prev: any) => ({
        ...prev,
        slug: slugify(value),
      }));
    }

    if (field === "continent_id") {
      setFormData((prev: any) => ({
        ...prev,
        country_id: "",
      }));
    }
  }

  async function handleSubmit(publish: boolean = false) {
    // Validation
    if (!formData.title || !formData.slug || !formData.continent_id || !formData.country_id) {
      toast.error("Completează câmpurile obligatorii: titlu, continent, țară");
      return;
    }

    if (formData.selected_types.length === 0) {
      toast.error("Selectează cel puțin un tip de obiectiv");
      return;
    }

    setSaving(true);

    try {
      const objectiveData = {
        ...formData,
        published: publish,
        published_at: publish ? new Date().toISOString() : null,
      };

      let objectiveId: string;

      if (isEdit) {
        await updateObjective(id!, objectiveData);
        objectiveId = id!;
        toast.success("Obiectiv actualizat cu succes!");
      } else {
        const newObjective = await createObjective(objectiveData);
        objectiveId = newObjective.id;
        toast.success("Obiectiv creat cu succes!");
      }

      // Update type relations
      await updateObjectiveTypes(objectiveId, formData.selected_types);

      if (!isEdit) {
        navigate(`${ADMIN_ROUTES.objectives}/${objectiveId}`);
      }
    } catch (error: any) {
      console.error("Error saving objective:", error);
      toast.error(error.message || "Eroare la salvarea obiectivului");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex gap-6 max-w-7xl mx-auto">
      {/* Main Content */}
      <div className="flex-1 space-y-6">
        {/* Header */}
        <div>
          <Button variant="ghost" asChild className="mb-4">
            <Link to={ADMIN_ROUTES.objectives}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Înapoi la obiective
            </Link>
          </Button>
          <h2 className="text-3xl font-display font-bold tracking-tight">
            {isEdit ? `Editează: ${formData.title}` : "Adaugă Obiectiv Nou"}
          </h2>
        </div>

      {/* Form Tabs */}
      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="basic">Info de Bază</TabsTrigger>
          <TabsTrigger value="content">Conținut</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="location">Locație</TabsTrigger>
          <TabsTrigger value="details">Detalii</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        {/* Tab 1: Basic Info */}
        <TabsContent value="basic" className="space-y-4">
          <div>
            <Label htmlFor="title">
              Titlu Obiectiv <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="ex: Castelul Bran"
              maxLength={200}
            />
            <CharacterCounter current={formData.title.length} max={200} className="mt-1" />
          </div>

          <div>
            <Label htmlFor="slug">Slug (URL)</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => handleChange("slug", e.target.value)}
              placeholder="castelul-bran"
            />
            <p className="text-xs text-muted-foreground mt-1">
              apot.ro/obiective/{formData.slug || "..."}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="continent">
                Continent <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.continent_id}
                onValueChange={(value) => handleChange("continent_id", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selectează continent" />
                </SelectTrigger>
                <SelectContent>
                  {continents.map((continent) => (
                    <SelectItem key={continent.id} value={continent.id}>
                      {continent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="country">
                Țară <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.country_id}
                onValueChange={(value) => handleChange("country_id", value)}
                disabled={!formData.continent_id}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selectează țară" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.id} value={country.id}>
                      {country.flag_emoji} {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="excerpt">Descriere Scurtă</Label>
            <Textarea
              id="excerpt"
              value={formData.excerpt}
              onChange={(e) => handleChange("excerpt", e.target.value)}
              placeholder="Descriere scurtă pentru carduri și preview..."
              maxLength={300}
              rows={3}
            />
            <CharacterCounter current={formData.excerpt?.length || 0} max={300} className="mt-1" />
          </div>
        </TabsContent>

        {/* Tab 2: Content */}
        <TabsContent value="content">
          <div>
            <Label>Descriere Completă</Label>
            <RichTextEditor
              content={formData.description || ""}
              onChange={(value) => handleChange("description", value)}
              placeholder="Scrie descrierea completă a obiectivului..."
            />
          </div>
        </TabsContent>

        {/* Tab 3: Media */}
        <TabsContent value="media" className="space-y-6">
          <div>
            <Label>
              Imagine Principală <span className="text-destructive">*</span>
            </Label>
            <ImageUpload
              value={formData.featured_image}
              onChange={(url) => handleChange("featured_image", url)}
              onRemove={() => handleChange("featured_image", "")}
            />
          </div>

          <div>
            <Label>Galerie Imagini (opțional)</Label>
            <p className="text-sm text-muted-foreground mb-2">
              Adaugă imagini suplimentare pentru galeria foto
            </p>
            <div className="space-y-3">
              {(formData.gallery_images || []).map((img: any, index: number) => (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                  {img.url && (
                    <img src={img.url} alt="" className="w-20 h-20 object-cover rounded" />
                  )}
                  <div className="flex-1 space-y-2">
                    <Input
                      placeholder="URL imagine"
                      value={img.url || ""}
                      onChange={(e) => {
                        const newGallery = [...(formData.gallery_images || [])];
                        newGallery[index] = { ...newGallery[index], url: e.target.value };
                        handleChange("gallery_images", newGallery);
                      }}
                    />
                    <Input
                      placeholder="Text alternativ (optional)"
                      value={img.alt || ""}
                      onChange={(e) => {
                        const newGallery = [...(formData.gallery_images || [])];
                        newGallery[index] = { ...newGallery[index], alt: e.target.value };
                        handleChange("gallery_images", newGallery);
                      }}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const newGallery = (formData.gallery_images || []).filter(
                        (_: any, i: number) => i !== index
                      );
                      handleChange("gallery_images", newGallery);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={() => {
                  handleChange("gallery_images", [
                    ...(formData.gallery_images || []),
                    { url: "", alt: "" },
                  ]);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Adaugă Imagine în Galerie
              </Button>
            </div>
          </div>

          <div>
            <Label>Video URLs (YouTube/Vimeo)</Label>
            <p className="text-sm text-muted-foreground mb-2">
              Adaugă link-uri către videoclipuri YouTube sau Vimeo
            </p>
            <div className="space-y-3">
              {(formData.video_urls || []).map((video: any, index: number) => (
                <div key={index} className="flex items-center gap-3">
                  <Input
                    placeholder="https://youtube.com/watch?v=..."
                    value={video.url || ""}
                    onChange={(e) => {
                      const newVideos = [...(formData.video_urls || [])];
                      newVideos[index] = { ...newVideos[index], url: e.target.value };
                      handleChange("video_urls", newVideos);
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const newVideos = (formData.video_urls || []).filter(
                        (_: any, i: number) => i !== index
                      );
                      handleChange("video_urls", newVideos);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={() => {
                  handleChange("video_urls", [
                    ...(formData.video_urls || []),
                    { url: "", platform: "youtube" },
                  ]);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Adaugă Video
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Tab 4: Location */}
        <TabsContent value="location" className="space-y-4">
          <div>
            <Label htmlFor="location_text">Locație</Label>
            <Input
              id="location_text"
              value={formData.location_text}
              onChange={(e) => handleChange("location_text", e.target.value)}
              placeholder="ex: Brașov, Transilvania, România"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="latitude">Latitudine</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                value={formData.latitude || ""}
                onChange={(e) =>
                  handleChange("latitude", e.target.value ? parseFloat(e.target.value) : null)
                }
                placeholder="45.5152"
              />
            </div>
            <div>
              <Label htmlFor="longitude">Longitudine</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                value={formData.longitude || ""}
                onChange={(e) =>
                  handleChange("longitude", e.target.value ? parseFloat(e.target.value) : null)
                }
                placeholder="25.3678"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="google_place_id">Google Place ID (opțional)</Label>
            <Input
              id="google_place_id"
              value={formData.google_place_id}
              onChange={(e) => handleChange("google_place_id", e.target.value)}
            />
          </div>
        </TabsContent>

        {/* Tab 5: Details */}
        <TabsContent value="details" className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="visit_duration">Durata Vizitei</Label>
              <Input
                id="visit_duration"
                value={formData.visit_duration}
                onChange={(e) => handleChange("visit_duration", e.target.value)}
                placeholder="ex: 2-3 ore"
              />
            </div>
            <div>
              <Label htmlFor="best_season">Sezon Recomandat</Label>
              <Input
                id="best_season"
                value={formData.best_season}
                onChange={(e) => handleChange("best_season", e.target.value)}
                placeholder="ex: Mai-Septembrie"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="entrance_fee">Preț Bilet</Label>
              <Input
                id="entrance_fee"
                value={formData.entrance_fee}
                onChange={(e) => handleChange("entrance_fee", e.target.value)}
                placeholder="ex: 50 RON sau Gratuit"
              />
            </div>
            <div>
              <Label htmlFor="difficulty_level">Dificultate</Label>
              <Select
                value={formData.difficulty_level}
                onValueChange={(value) => handleChange("difficulty_level", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selectează" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Ușor</SelectItem>
                  <SelectItem value="moderate">Mediu</SelectItem>
                  <SelectItem value="difficult">Dificil</SelectItem>
                  <SelectItem value="extreme">Extrem</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="opening_hours">Program</Label>
            <Textarea
              id="opening_hours"
              value={formData.opening_hours}
              onChange={(e) => handleChange("opening_hours", e.target.value)}
              placeholder="Luni-Vineri: 09:00-18:00"
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="accessibility_info">Informații Accesibilitate</Label>
            <Textarea
              id="accessibility_info"
              value={formData.accessibility_info}
              onChange={(e) => handleChange("accessibility_info", e.target.value)}
              rows={2}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="website_url">Website</Label>
              <Input
                id="website_url"
                type="url"
                value={formData.website_url}
                onChange={(e) => handleChange("website_url", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="booking_url">Link Rezervări</Label>
              <Input
                id="booking_url"
                type="url"
                value={formData.booking_url}
                onChange={(e) => handleChange("booking_url", e.target.value)}
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contact_email">Email Contact</Label>
              <Input
                id="contact_email"
                type="email"
                value={formData.contact_email}
                onChange={(e) => handleChange("contact_email", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="contact_phone">Telefon Contact</Label>
              <Input
                id="contact_phone"
                type="tel"
                value={formData.contact_phone}
                onChange={(e) => handleChange("contact_phone", e.target.value)}
              />
            </div>
          </div>
        </TabsContent>

        {/* Tab 6: SEO */}
        <TabsContent value="seo" className="space-y-6">
          <div>
            <Label>
              Tipuri Obiectiv <span className="text-destructive">*</span>
            </Label>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 mt-2">
              {objectiveTypes.map((type) => (
                <div key={type.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={type.id}
                    checked={formData.selected_types.includes(type.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        handleChange("selected_types", [
                          ...formData.selected_types,
                          type.id,
                        ]);
                      } else {
                        handleChange(
                          "selected_types",
                          formData.selected_types.filter((id: string) => id !== type.id)
                        );
                      }
                    }}
                  />
                  <label
                    htmlFor={type.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {type.name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="unesco_site"
              checked={formData.unesco_site}
              onCheckedChange={(checked) => handleChange("unesco_site", checked)}
            />
            <Label htmlFor="unesco_site">Sit UNESCO</Label>
          </div>

          {formData.unesco_site && (
            <div>
              <Label htmlFor="unesco_year">An Înregistrare UNESCO</Label>
              <Input
                id="unesco_year"
                type="number"
                value={formData.unesco_year || ""}
                onChange={(e) =>
                  handleChange("unesco_year", e.target.value ? parseInt(e.target.value) : null)
                }
                placeholder="2000"
              />
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Switch
              id="featured"
              checked={formData.featured}
              onCheckedChange={(checked) => handleChange("featured", checked)}
            />
            <Label htmlFor="featured">Featured (afișează pe homepage)</Label>
          </div>

          <div>
            <Label htmlFor="meta_title">Meta Title (SEO)</Label>
            <Input
              id="meta_title"
              value={formData.meta_title}
              onChange={(e) => handleChange("meta_title", e.target.value)}
              placeholder="Lasă gol pentru generare automată"
              maxLength={60}
            />
            <CharacterCounter current={formData.meta_title?.length || 0} max={60} className="mt-1" />
          </div>

          <div>
            <Label htmlFor="meta_description">Meta Description (SEO)</Label>
            <Textarea
              id="meta_description"
              value={formData.meta_description}
              onChange={(e) => handleChange("meta_description", e.target.value)}
              placeholder="Lasă gol pentru generare automată"
              maxLength={160}
              rows={3}
            />
            <CharacterCounter current={formData.meta_description?.length || 0} max={160} className="mt-1" />
          </div>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="sticky bottom-0 bg-background border-t p-4 flex justify-between items-center gap-4">
        <Button variant="outline" asChild>
          <Link to={ADMIN_ROUTES.objectives}>Anulează</Link>
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleSubmit(false)}
            disabled={saving}
          >
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Salvează Draft
          </Button>
          <Button onClick={() => handleSubmit(true)} disabled={saving}>
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Publică
          </Button>
        </div>
      </div>
      </div>

      {/* AI Sidebar */}
      <div className="w-80 flex-shrink-0">
        <div className="sticky top-6">
          <AIContentHelper
            title={formData.title}
            description={formData.excerpt || formData.description}
            content={formData.description}
            onApplyTags={(tags) => {
              toast.info("Sugestie: " + tags.join(", "));
            }}
            onApplyKeywords={(keywords) => {
              toast.info("Keywords: " + keywords.join(", "));
            }}
            onApplyMetaDescription={(desc) => {
              handleChange("meta_description", desc);
              toast.success("Meta description aplicată!");
            }}
          />
        </div>
      </div>
    </div>
  );
}
