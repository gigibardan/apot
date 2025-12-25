import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Loader2, Save, X, Plus, Upload } from "lucide-react";
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { slugify, cn } from "@/lib/utils";
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
import { Check, ChevronsUpDown } from "lucide-react";

// Common country list with flags for autocomplete
const COMMON_COUNTRIES = [
  { name: "România", flag: "🇷🇴" },
  { name: "Italia", flag: "🇮🇹" },
  { name: "Franța", flag: "🇫🇷" },
  { name: "Spania", flag: "🇪🇸" },
  { name: "Germania", flag: "🇩🇪" },
  { name: "Grecia", flag: "🇬🇷" },
  { name: "Portugalia", flag: "🇵🇹" },
  { name: "Austria", flag: "🇦🇹" },
  { name: "Elveția", flag: "🇨🇭" },
  { name: "Olanda", flag: "🇳🇱" },
  { name: "Belgia", flag: "🇧🇪" },
  { name: "Marea Britanie", flag: "🇬🇧" },
  { name: "Irlanda", flag: "🇮🇪" },
  { name: "Polonia", flag: "🇵🇱" },
  { name: "Cehia", flag: "🇨🇿" },
  { name: "Ungaria", flag: "🇭🇺" },
  { name: "Bulgaria", flag: "🇧🇬" },
  { name: "Serbia", flag: "🇷🇸" },
  { name: "Croația", flag: "🇭🇷" },
  { name: "Slovenia", flag: "🇸🇮" },
  { name: "Muntenegru", flag: "🇲🇪" },
  { name: "Albania", flag: "🇦🇱" },
  { name: "Macedonia de Nord", flag: "🇲🇰" },
  { name: "Bosnia și Herțegovina", flag: "🇧🇦" },
  { name: "Turcia", flag: "🇹🇷" },
  { name: "Egipt", flag: "🇪🇬" },
  { name: "Maroc", flag: "🇲🇦" },
  { name: "Tunisia", flag: "🇹🇳" },
  { name: "Africa de Sud", flag: "🇿🇦" },
  { name: "Kenya", flag: "🇰🇪" },
  { name: "Tanzania", flag: "🇹🇿" },
  { name: "Etiopia", flag: "🇪🇹" },
  { name: "Statele Unite", flag: "🇺🇸" },
  { name: "Canada", flag: "🇨🇦" },
  { name: "Mexic", flag: "🇲🇽" },
  { name: "Brazilia", flag: "🇧🇷" },
  { name: "Argentina", flag: "🇦🇷" },
  { name: "Chile", flag: "🇨🇱" },
  { name: "Peru", flag: "🇵🇪" },
  { name: "Columbia", flag: "🇨🇴" },
  { name: "Ecuador", flag: "🇪🇨" },
  { name: "Costa Rica", flag: "🇨🇷" },
  { name: "Cuba", flag: "🇨🇺" },
  { name: "Republica Dominicană", flag: "🇩🇴" },
  { name: "Jamaica", flag: "🇯🇲" },
  { name: "China", flag: "🇨🇳" },
  { name: "Japonia", flag: "🇯🇵" },
  { name: "Coreea de Sud", flag: "🇰🇷" },
  { name: "India", flag: "🇮🇳" },
  { name: "Thailanda", flag: "🇹🇭" },
  { name: "Vietnam", flag: "🇻🇳" },
  { name: "Indonezia", flag: "🇮🇩" },
  { name: "Malaezia", flag: "🇲🇾" },
  { name: "Singapore", flag: "🇸🇬" },
  { name: "Filipine", flag: "🇵🇭" },
  { name: "Cambodia", flag: "🇰🇭" },
  { name: "Nepal", flag: "🇳🇵" },
  { name: "Sri Lanka", flag: "🇱🇰" },
  { name: "Emiratele Arabe Unite", flag: "🇦🇪" },
  { name: "Israel", flag: "🇮🇱" },
  { name: "Iordania", flag: "🇯🇴" },
  { name: "Arabia Saudită", flag: "🇸🇦" },
  { name: "Iran", flag: "🇮🇷" },
  { name: "Australia", flag: "🇦🇺" },
  { name: "Noua Zeelandă", flag: "🇳🇿" },
  { name: "Fiji", flag: "🇫🇯" },
  { name: "Islanda", flag: "🇮🇸" },
  { name: "Norvegia", flag: "🇳🇴" },
  { name: "Suedia", flag: "🇸🇪" },
  { name: "Danemarca", flag: "🇩🇰" },
  { name: "Finlanda", flag: "🇫🇮" },
  { name: "Estonia", flag: "🇪🇪" },
  { name: "Letonia", flag: "🇱🇻" },
  { name: "Lituania", flag: "🇱🇹" },
  { name: "Ucraina", flag: "🇺🇦" },
  { name: "Moldova", flag: "🇲🇩" },
  { name: "Rusia", flag: "🇷🇺" },
  { name: "Georgia", flag: "🇬🇪" },
  { name: "Armenia", flag: "🇦🇲" },
  { name: "Azerbaijan", flag: "🇦🇿" },
];

// Helper to normalize text (remove diacritics)
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[ăâ]/g, "a")
    .replace(/[îâ]/g, "i")
    .replace(/[șş]/g, "s")
    .replace(/[țţ]/g, "t");
}

// Format country name (First letter uppercase, rest lowercase)
function formatCountryName(name: string): string {
  if (!name) return "";
  return name
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

// Format city name (First letter uppercase, rest lowercase)
function formatCityName(name: string): string {
  if (!name) return "";
  return name
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

// Find flag for country
function findCountryFlag(countryName: string): string {
  const normalized = normalizeText(countryName);
  const found = COMMON_COUNTRIES.find(c => normalizeText(c.name) === normalized);
  return found?.flag || "🌍";
}

export default function ObjectiveForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id && id !== "nou";

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [continents, setContinents] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [objectiveTypes, setObjectiveTypes] = useState<any[]>([]);
  const [countryOpen, setCountryOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");

  const [formData, setFormData] = useState<any>({
    title: "",
    slug: "",
    continent_id: "",
    country_id: "",
    country_name: "", // For free-text country
    city: "",
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

  // Filtered countries for autocomplete
  const filteredCountries = useMemo(() => {
    if (!countrySearch) return COMMON_COUNTRIES;
    const normalizedSearch = normalizeText(countrySearch);
    return COMMON_COUNTRIES.filter(c =>
      normalizeText(c.name).includes(normalizedSearch)
    );
  }, [countrySearch]);

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

      // Extract only database fields, remove nested objects
      const { continent, country, types, ...cleanData } = data;

      setFormData({
        ...cleanData,
        country_name: country?.name || (cleanData as any).country_name || "",
        selected_types: types?.map((t: any) => t.type.id) || [],
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
        country_name: "",
      }));
    }
  }

  function handleCountrySelect(countryName: string) {
    const formatted = formatCountryName(countryName);
    // Check if this country exists in db countries
    const dbCountry = countries.find(c =>
      normalizeText(c.name) === normalizeText(countryName)
    );

    setFormData((prev: any) => ({
      ...prev,
      country_name: formatted,
      country_id: dbCountry?.id || "",
    }));
    setCountryOpen(false);
    setCountrySearch("");
  }

  function handleCityChange(value: string) {
    handleChange("city", formatCityName(value));
  }

  async function handleSubmit(publish: boolean = false) {
    // Validation - only title and continent required now
    if (!formData.title || !formData.slug || !formData.continent_id) {
      toast.error("Completează câmpurile obligatorii: titlu, continent");
      return;
    }

    if (formData.selected_types.length === 0) {
      toast.error("Selectează cel puțin un tip de obiectiv");
      return;
    }

    setSaving(true);

    try {
      // Extract selected_types and any nested objects before sending to database
      const { selected_types, continent, country, types, country_name, ...objectiveData } = formData;

      const dataToSave = {
        ...objectiveData,
        // Store country_name in location_text if no country_id, or keep both
        country_name: country_name || null,
        published: publish,
        published_at: publish ? new Date().toISOString() : null,
      };

      let objectiveId: string;

      if (isEdit) {
        await updateObjective(id!, dataToSave);
        objectiveId = id!;
        toast.success("Obiectiv actualizat cu succes!");
      } else {
        const newObjective = await createObjective(dataToSave);
        objectiveId = newObjective.id;
        toast.success("Obiectiv creat cu succes!");
      }

      // Update type relations
      await updateObjectiveTypes(objectiveId, selected_types);

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

  // Gallery image upload handler
  function handleGalleryImageUpload(url: string, index: number) {
    const newGallery = [...(formData.gallery_images || [])];
    newGallery[index] = { ...newGallery[index], url };
    handleChange("gallery_images", newGallery);
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
                <Label htmlFor="country">Țară</Label>
                <Popover open={countryOpen} onOpenChange={setCountryOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={countryOpen}
                      className="w-full justify-between font-normal"
                      disabled={!formData.continent_id}
                    >
                      {formData.country_name ? (
                        <span className="flex items-center gap-2">
                          <span>{findCountryFlag(formData.country_name)}</span>
                          <span>{formData.country_name}</span>
                        </span>
                      ) : (
                        <span className="text-muted-foreground">
                          {formData.continent_id ? "Selectează sau scrie țara" : "Selectează mai întâi continentul"}
                        </span>
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0" align="start">
                    <Command>
                      <CommandInput
                        placeholder="Caută sau scrie țara..."
                        value={countrySearch}
                        onValueChange={setCountrySearch}
                      />
                      <CommandList>
                        <CommandEmpty>
                          {countrySearch && (
                            <button
                              className="w-full p-2 text-left hover:bg-accent cursor-pointer"
                              onClick={() => handleCountrySelect(countrySearch)}
                            >
                              Folosește "{formatCountryName(countrySearch)}"
                            </button>
                          )}
                        </CommandEmpty>
                        <CommandGroup>
                          {/* Show DB countries first if they exist */}
                          {countries.length > 0 && (
                            <>
                              {countries.map((country) => (
                                <CommandItem
                                  key={country.id}
                                  value={country.name}
                                  onSelect={() => {
                                    setFormData((prev: any) => ({
                                      ...prev,
                                      country_id: country.id,
                                      country_name: country.name,
                                    }));
                                    setCountryOpen(false);
                                    setCountrySearch("");
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      formData.country_id === country.id ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  <span className="mr-2">{country.flag_emoji || "🌍"}</span>
                                  {country.name}
                                </CommandItem>
                              ))}
                            </>
                          )}
                          {/* Show common countries suggestions */}
                          {filteredCountries.slice(0, 10).map((country) => (
                            <CommandItem
                              key={country.name}
                              value={country.name}
                              onSelect={() => handleCountrySelect(country.name)}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  normalizeText(formData.country_name) === normalizeText(country.name)
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              <span className="mr-2">{country.flag}</span>
                              {country.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <p className="text-xs text-muted-foreground mt-1">
                  Poți selecta din listă sau scrie manual numele țării
                </p>
              </div>
            </div>

            <div>
              <Label htmlFor="city">Oraș</Label>
              <Input
                id="city"
                value={formData.city || ""}
                onChange={(e) => handleCityChange(e.target.value)}
                placeholder="ex: București, Cairo, Paris"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Numele orașului va fi formatat automat (prima literă mare)
              </p>
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
                Adaugă imagini suplimentare pentru galeria foto - poți încărca fișiere sau adăuga URL-uri
              </p>
              <div className="space-y-4">
                {(formData.gallery_images || []).map((img: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start gap-4">
                      {img.url && (
                        <img src={img.url} alt={img.alt || ""} className="w-24 h-24 object-cover rounded" />
                      )}
                      <div className="flex-1 space-y-3">
                        {/* Upload or URL */}
                        <div>
                          <Label className="text-xs">Încarcă imagine sau adaugă URL</Label>
                          <ImageUpload
                            value={img.url || ""}
                            onChange={(url) => handleGalleryImageUpload(url, index)}
                            onRemove={() => {
                              const newGallery = [...(formData.gallery_images || [])];
                              newGallery[index] = { ...newGallery[index], url: "" };
                              handleChange("gallery_images", newGallery);
                            }}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Sau URL direct</Label>
                          <Input
                            placeholder="https://..."
                            value={img.url || ""}
                            onChange={(e) => {
                              const newGallery = [...(formData.gallery_images || [])];
                              newGallery[index] = { ...newGallery[index], url: e.target.value };
                              handleChange("gallery_images", newGallery);
                            }}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Text alternativ (pentru SEO)</Label>
                          <Input
                            placeholder="Descriere scurtă a imaginii"
                            value={img.alt || ""}
                            onChange={(e) => {
                              const newGallery = [...(formData.gallery_images || [])];
                              newGallery[index] = { ...newGallery[index], alt: e.target.value };
                              handleChange("gallery_images", newGallery);
                            }}
                          />
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
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
              <Label htmlFor="location_text">Locație (text liber)</Label>
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
                  placeholder="25.3674"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="google_place_id">Google Place ID</Label>
              <Input
                id="google_place_id"
                value={formData.google_place_id}
                onChange={(e) => handleChange("google_place_id", e.target.value)}
                placeholder="ChIJ..."
              />
            </div>
          </TabsContent>

          {/* Tab 5: Details */}
          <TabsContent value="details" className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="visit_duration">Durată Vizită</Label>
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
                  placeholder="ex: Mai - Octombrie"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="difficulty_level">Dificultate</Label>
                <Select
                  value={formData.difficulty_level || ""}
                  onValueChange={(value) => handleChange("difficulty_level", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selectează dificultatea" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Ușor</SelectItem>
                    <SelectItem value="moderate">Mediu</SelectItem>
                    <SelectItem value="difficult">Dificil</SelectItem>
                    <SelectItem value="extreme">Extrem</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="entrance_fee">Tarif Intrare</Label>
                <Input
                  id="entrance_fee"
                  value={formData.entrance_fee}
                  onChange={(e) => handleChange("entrance_fee", e.target.value)}
                  placeholder="ex: 50 RON / Gratuit"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="opening_hours">Program</Label>
              <Input
                id="opening_hours"
                value={formData.opening_hours}
                onChange={(e) => handleChange("opening_hours", e.target.value)}
                placeholder="ex: Luni-Vineri 09:00-17:00"
              />
            </div>

            <div>
              <Label htmlFor="accessibility_info">Accesibilitate</Label>
              <Textarea
                id="accessibility_info"
                value={formData.accessibility_info}
                onChange={(e) => handleChange("accessibility_info", e.target.value)}
                placeholder="Informații despre accesibilitate..."
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
                  placeholder="https://..."
                />
              </div>
              <div>
                <Label htmlFor="booking_url">URL Rezervări</Label>
                <Input
                  id="booking_url"
                  type="url"
                  value={formData.booking_url}
                  onChange={(e) => handleChange("booking_url", e.target.value)}
                  placeholder="https://..."
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
                  placeholder="contact@..."
                />
              </div>
              <div>
                <Label htmlFor="contact_phone">Telefon</Label>
                <Input
                  id="contact_phone"
                  value={formData.contact_phone}
                  onChange={(e) => handleChange("contact_phone", e.target.value)}
                  placeholder="+40..."
                />
              </div>
            </div>
          </TabsContent>

          {/* Tab 6: SEO */}
          <TabsContent value="seo" className="space-y-6">
            {/* Types */}
            <div>
              <Label>
                Tipuri Obiectiv <span className="text-destructive">*</span>
              </Label>
              <p className="text-sm text-muted-foreground mb-3">
                Selectează categoriile care descriu cel mai bine acest obiectiv
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {objectiveTypes.map((type) => (
                  <label
                    key={type.id}
                    className={cn(
                      "flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors",
                      formData.selected_types.includes(type.id)
                        ? "border-primary bg-primary/5"
                        : "hover:border-muted-foreground/50"
                    )}
                  >
                    <Checkbox
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
                    <span className="text-lg">{type.icon}</span>
                    <span className="font-medium">{type.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* UNESCO */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <Label className="text-base">Sit UNESCO</Label>
                <p className="text-sm text-muted-foreground">
                  Marchează dacă este sit UNESCO World Heritage
                </p>
              </div>
              <Switch
                checked={formData.unesco_site}
                onCheckedChange={(checked) => handleChange("unesco_site", checked)}
              />
            </div>

            {formData.unesco_site && (
              <div>
                <Label htmlFor="unesco_year">An UNESCO</Label>
                <Input
                  id="unesco_year"
                  type="number"
                  value={formData.unesco_year || ""}
                  onChange={(e) =>
                    handleChange("unesco_year", e.target.value ? parseInt(e.target.value) : null)
                  }
                  placeholder="ex: 1999"
                  min={1972}
                  max={new Date().getFullYear()}
                />
              </div>
            )}

            {/* Featured */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <Label className="text-base">Obiectiv Recomandat</Label>
                <p className="text-sm text-muted-foreground">
                  Afișează pe prima pagină în secțiunea Featured
                </p>
              </div>
              <Switch
                checked={formData.featured}
                onCheckedChange={(checked) => handleChange("featured", checked)}
              />
            </div>

            {/* Meta Tags */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="meta_title">Meta Title</Label>
                <Input
                  id="meta_title"
                  value={formData.meta_title}
                  onChange={(e) => handleChange("meta_title", e.target.value)}
                  placeholder="Titlu pentru SEO (max 60 caractere)"
                  maxLength={70}
                />
                <CharacterCounter current={formData.meta_title?.length || 0} max={60} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="meta_description">Meta Description</Label>
                <Textarea
                  id="meta_description"
                  value={formData.meta_description}
                  onChange={(e) => handleChange("meta_description", e.target.value)}
                  placeholder="Descriere pentru SEO (max 160 caractere)"
                  maxLength={170}
                  rows={3}
                />
                <CharacterCounter current={formData.meta_description?.length || 0} max={160} className="mt-1" />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* AI Helper */}
        <AIContentHelper
          title={formData.title || ""}
          description={formData.excerpt || ""}
          content={formData.description || ""}
        />
      </div>

      {/* Sidebar */}
      <div className="w-80 space-y-6 hidden xl:block">
        <div className="sticky top-24 space-y-6">
          {/* Status Card */}
          <div className="border rounded-lg p-4 space-y-4">
            <h3 className="font-semibold">Status</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Stare:</span>
                <span className={formData.published ? "text-green-600" : "text-yellow-600"}>
                  {formData.published ? "Publicat" : "Draft"}
                </span>
              </div>
              {formData.published_at && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Publicat la:</span>
                  <span>{new Date(formData.published_at).toLocaleDateString("ro-RO")}</span>
                </div>
              )}
            </div>
          </div>

          {/* Preview */}
          {formData.featured_image && (
            <div className="border rounded-lg overflow-hidden">
              <img
                src={formData.featured_image}
                alt="Preview"
                className="w-full aspect-video object-cover"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <Button onClick={() => handleSubmit(false)} disabled={saving} variant="outline">
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Se salvează..." : "Salvează Draft"}
            </Button>
            <Button onClick={() => handleSubmit(true)} disabled={saving}>
              {saving ? "Se publică..." : formData.published ? "Actualizează" : "Publică"}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Actions */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t xl:hidden">
        <div className="flex gap-2 max-w-lg mx-auto">
          <Button onClick={() => handleSubmit(false)} disabled={saving} variant="outline" className="flex-1">
            <Save className="mr-2 h-4 w-4" />
            Draft
          </Button>
          <Button onClick={() => handleSubmit(true)} disabled={saving} className="flex-1">
            {formData.published ? "Actualizează" : "Publică"}
          </Button>
        </div>
      </div>
    </div>
  );
}
