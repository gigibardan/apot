import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import ImageUpload from "@/components/admin/ImageUpload";
import RichTextEditor from "@/components/admin/RichTextEditor";
import { SEOHelper } from "@/components/admin/SEOHelper";
import CharacterCounter from "@/components/admin/CharacterCounter";
import { ADMIN_ROUTES } from "@/lib/constants/routes";
import { getGuideById } from "@/lib/supabase/queries/guides";
import { getObjectives } from "@/lib/supabase/queries/objectives";
import { createGuide, updateGuide, updateGuideObjectives } from "@/lib/supabase/mutations/guides";
import { GuideInput, AuthorizedGuideInput } from "@/types/guides";
import { slugify } from "@/lib/utils";
import { toast } from "sonner";
import { Save, Eye, ArrowLeft } from "lucide-react";
import Breadcrumbs from "@/components/admin/Breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield, CheckCircle, AlertCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const guideSchema = z.object({
  full_name: z.string().min(3, "Numele trebuie să aibă minim 3 caractere"),
  slug: z.string().min(3, "Slug-ul trebuie să aibă minim 3 caractere"),
  short_description: z.string().max(200, "Maxim 200 caractere").optional(),
  bio: z.string().optional(),
  profile_image: z.string().optional(),
  years_experience: z.number().min(0).optional(),
  languages: z.array(z.string()).default([]),
  specializations: z.array(z.string()).default([]),
  geographical_areas: z.array(z.string()).default([]),
  email: z.string().email("Email invalid").optional().or(z.literal("")),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  website_url: z.string().url("URL invalid").optional().or(z.literal("")),
  price_per_day: z.number().min(0).optional(),
  price_per_group: z.number().min(0).optional(),
  verified: z.boolean().default(false),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
  verification_notes: z.string().optional(),
  meta_title: z.string().max(60).optional(),
  meta_description: z.string().max(160).optional(),
  availability_calendar_url: z.string().url("URL invalid").optional().or(z.literal("")),
  license_number: z.string().optional().nullable(),
  attestation_type: z.string().optional().nullable(),
  official_guide: z.boolean().optional(),
});

type GuideFormValues = z.infer<typeof guideSchema>;

// Specializări predefinite
const SPECIALIZATIONS = [
  "Munte & Trekking",
  "Cultură & Istorie",
  "Natură & Wildlife",
  "Urban & City Tours",
  "Aventură & Sport",
  "Spiritualitate & Yoga",
  "Gastronomie & Vinuri",
  "Fotografie",
  "Familie & Copii",
  "Luxury Tours",
];

export default function GuideForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [languageInput, setLanguageInput] = useState("");
  const [areaInput, setAreaInput] = useState("");
  const [selectedObjectives, setSelectedObjectives] = useState<string[]>([]);

  // Load guide data for edit
  const { data: guide, isLoading } = useQuery({
    queryKey: ["guide", id],
    queryFn: () => getGuideById(id!),
    enabled: isEdit,
  });

  // Load objectives for selection
  const { data: objectivesData } = useQuery({
    queryKey: ["objectives-all"],
    queryFn: () => getObjectives({ limit: 1000 }),
  });

  const form = useForm<GuideFormValues>({
    resolver: zodResolver(guideSchema),
    defaultValues: {
      full_name: "",
      slug: "",
      short_description: "",
      bio: "",
      profile_image: "",
      years_experience: 0,
      languages: [],
      specializations: [],
      geographical_areas: [],
      email: "",
      phone: "",
      whatsapp: "",
      website_url: "",
      price_per_day: 0,
      price_per_group: 0,
      verified: false,
      featured: false,
      active: true,
      verification_notes: "",
      meta_title: "",
      meta_description: "",
      availability_calendar_url: "",
      license_number: null,
      attestation_type: null,
      official_guide: false,
    },
  });

  // Load guide data into form
  // Load guide data into form
  useEffect(() => {
    if (guide) {
      form.reset({
        full_name: guide.full_name,
        slug: guide.slug,
        short_description: guide.short_description || "",
        bio: guide.bio || "",
        profile_image: guide.profile_image || "",
        years_experience: guide.years_experience || 0,
        languages: guide.languages || [],
        specializations: guide.specializations || [],
        geographical_areas: guide.geographical_areas || [],
        email: guide.email || "",
        phone: guide.phone || "",
        whatsapp: guide.whatsapp || "",
        website_url: guide.website_url || "",
        price_per_day: guide.price_per_day || 0,
        price_per_group: guide.price_per_group || 0,
        verified: guide.verified,
        featured: guide.featured,
        active: guide.active,
        verification_notes: guide.verification_notes || "",
        meta_title: guide.meta_title || "",
        meta_description: guide.meta_description || "",
        availability_calendar_url: guide.availability_calendar_url || "",
        // ADAUGĂ ACESTEA - LIPSEAU!
        license_number: guide.license_number || null,
        attestation_type: guide.attestation_type || null,
        official_guide: guide.official_guide || false,
      });
    }
  }, [guide, form]);

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (data: GuideFormValues) => {
      const guideData: Partial<GuideInput> = {
        ...data,
        verification_date: data.verified ? new Date().toISOString() : null,
      };

      if (isEdit && id) {
        await updateGuide(id, guideData);
        await updateGuideObjectives(id, selectedObjectives);
        return id;
      } else {
        const newGuide = await createGuide(guideData as any);
        if (selectedObjectives.length > 0) {
          await updateGuideObjectives(newGuide.id, selectedObjectives);
        }
        return newGuide.id;
      }
    },
    onSuccess: (guideId) => {
      toast.success(isEdit ? "Ghid actualizat cu succes" : "Ghid creat cu succes");
      navigate(ADMIN_ROUTES.guides);
    },
    onError: (error: any) => {
      toast.error(error.message || "Eroare la salvarea ghidului");
    },
  });

  const onSubmit = (data: GuideFormValues) => {
    saveMutation.mutate(data);
  };

  // Auto-generate slug from name
  const handleNameChange = (name: string) => {
    form.setValue("full_name", name);
    if (!isEdit) {
      form.setValue("slug", slugify(name));
    }
  };

  // Add language
  const addLanguage = () => {
    if (languageInput.trim()) {
      const current = form.getValues("languages");
      if (!current.includes(languageInput.trim())) {
        form.setValue("languages", [...current, languageInput.trim()]);
        setLanguageInput("");
      }
    }
  };

  // Remove language
  const removeLanguage = (lang: string) => {
    const current = form.getValues("languages");
    form.setValue(
      "languages",
      current.filter((l) => l !== lang)
    );
  };

  // Add geographical area
  const addArea = () => {
    if (areaInput.trim()) {
      const current = form.getValues("geographical_areas");
      if (!current.includes(areaInput.trim())) {
        form.setValue("geographical_areas", [...current, areaInput.trim()]);
        setAreaInput("");
      }
    }
  };

  // Remove geographical area
  const removeArea = (area: string) => {
    const current = form.getValues("geographical_areas");
    form.setValue(
      "geographical_areas",
      current.filter((a) => a !== area)
    );
  };

  // Toggle specialization
  const toggleSpecialization = (spec: string) => {
    const current = form.getValues("specializations");
    if (current.includes(spec)) {
      form.setValue(
        "specializations",
        current.filter((s) => s !== spec)
      );
    } else {
      form.setValue("specializations", [...current, spec]);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Admin", href: ADMIN_ROUTES.dashboard },
          { label: "Ghizi", href: ADMIN_ROUTES.guides },
          { label: isEdit ? "Editează Ghid" : "Ghid Nou" },
        ]}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {isEdit ? "Editează Ghid" : "Adaugă Ghid Nou"}
          </h1>
          <p className="text-muted-foreground">
            Completează informațiile despre ghidul profesionist
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(ADMIN_ROUTES.guides)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Înapoi
          </Button>
          {isEdit && (
            <Button
              variant="outline"
              onClick={() => window.open(`/ghid/${guide?.slug}`, "_blank")}
            >
              <Eye className="h-4 w-4 mr-2" />
              Previzualizare
            </Button>
          )}
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Tabs defaultValue="basic" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="basic">Informații de Bază</TabsTrigger>
              <TabsTrigger value="professional">Profesional</TabsTrigger>
              <TabsTrigger value="contact">Contact & Prețuri</TabsTrigger>
              <TabsTrigger value="objectives">Obiective</TabsTrigger>
              <TabsTrigger value="seo">SEO & Status</TabsTrigger>
            </TabsList>

            {/* Tab 1: Basic Info */}
            <TabsContent value="basic" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informații de Bază</CardTitle>
                  <CardDescription>
                    Informații principale despre ghid
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nume Complet *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            onChange={(e) => handleNameChange(e.target.value)}
                            placeholder="ex: Ion Popescu"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slug URL *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="ex: ion-popescu" />
                        </FormControl>
                        <FormDescription>
                          URL-ul ghidului: /ghid/{field.value || "slug"}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="profile_image"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Imagine Profil</FormLabel>
                        <FormControl>
                          <ImageUpload
                            value={field.value || ""}
                            onChange={field.onChange}
                            bucket="objectives-images"
                            folder="guides"
                          />
                        </FormControl>
                        <FormDescription>
                          Imagine profesională a ghidului (recomandat 800x800px)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="short_description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descriere Scurtă</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="O scurtă prezentare a ghidului..."
                            rows={3}
                          />
                        </FormControl>
                        <CharacterCounter
                          current={field.value?.length || 0}
                          max={200}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Biografie Completă</FormLabel>
                        <FormControl>
                          <RichTextEditor
                            content={field.value || ""}
                            onChange={field.onChange}
                            placeholder="Scrie biografia detaliată a ghidului..."
                          />
                        </FormControl>
                        <FormDescription>
                          Experiență, background, pasiuni, realizări
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>



            {/* Tab 2: Professional Info */}
            <TabsContent value="professional" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informații Profesionale</CardTitle>
                  <CardDescription>
                    Specializări, limbi, zone geografice
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="years_experience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ani Experiență</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="specializations"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Specializări</FormLabel>
                        <div className="grid grid-cols-2 gap-3">
                          {SPECIALIZATIONS.map((spec) => (
                            <div key={spec} className="flex items-center space-x-2">
                              <Checkbox
                                checked={field.value.includes(spec)}
                                onCheckedChange={() => toggleSpecialization(spec)}
                              />
                              <label className="text-sm">{spec}</label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="languages"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Limbi Vorbite</FormLabel>
                        <div className="flex gap-2">
                          <Input
                            value={languageInput}
                            onChange={(e) => setLanguageInput(e.target.value)}
                            placeholder="ex: Engleză"
                            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addLanguage())}
                          />
                          <Button type="button" onClick={addLanguage}>
                            Adaugă
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {field.value.map((lang) => (
                            <Badge
                              key={lang}
                              variant="secondary"
                              className="cursor-pointer"
                              onClick={() => removeLanguage(lang)}
                            >
                              {lang} ×
                            </Badge>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="geographical_areas"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Zone Geografice</FormLabel>
                        <FormDescription>
                          Regiuni, țări sau zone unde ghidul activează
                        </FormDescription>
                        <div className="flex gap-2">
                          <Input
                            value={areaInput}
                            onChange={(e) => setAreaInput(e.target.value)}
                            placeholder="ex: Transilvania"
                            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addArea())}
                          />
                          <Button type="button" onClick={addArea}>
                            Adaugă
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {field.value.map((area) => (
                            <Badge
                              key={area}
                              variant="secondary"
                              className="cursor-pointer"
                              onClick={() => removeArea(area)}
                            >
                              {area} ×
                            </Badge>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* SECȚIUNE NOUĂ: Licență Oficială SITUR */}
              <Card>
                <CardHeader className="bg-blue-50">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <CardTitle>Licență Oficială SITUR</CardTitle>
                  </div>
                  <CardDescription>
                    Opțional - completează dacă ghidul are licență oficială
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="license_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Număr Atestat/Licență</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ex: GHT-2018-12345"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormDescription>
                            Se verifică automat în baza SITUR la salvare
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="attestation_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tip Atestat</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || undefined}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selectează tipul..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="National">National</SelectItem>
                              <SelectItem value="Local">Local</SelectItem>
                              <SelectItem value="Specializat">Specializat</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {form.watch("official_guide") && (
                    <div className="flex items-center gap-2 text-green-700 bg-green-50 p-4 rounded-lg border-2 border-green-200">
                      <CheckCircle className="h-5 w-5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold">Licență Verificată în SITUR!</p>
                        <p className="text-sm text-green-600">
                          Acest ghid are licență oficială confirmată
                        </p>
                      </div>
                    </div>
                  )}

                  {form.watch("license_number") && !form.watch("official_guide") && (
                    <div className="flex items-center gap-2 text-amber-700 bg-amber-50 p-4 rounded-lg border-2 border-amber-200">
                      <AlertCircle className="h-5 w-5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold">Licență nevalidată</p>
                        <p className="text-sm text-amber-600">
                          Numărul introdus nu a fost găsit în SITUR sau va fi verificat la salvare
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>



            {/* Tab 3: Contact & Pricing */}
            <TabsContent value="contact" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contact & Prețuri</CardTitle>
                  <CardDescription>
                    Informații de contact și tarife
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" placeholder="ghid@example.com" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefon</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="+40 721 234 567" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="whatsapp"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>WhatsApp</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="+40 721 234 567" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="website_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="https://..." />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="price_per_day"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preț pe Zi (EUR)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="price_per_group"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preț pe Grup (EUR)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="availability_calendar_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL Calendar Disponibilitate</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="https://calendly.com/..." />
                        </FormControl>
                        <FormDescription>
                          Link către calendar extern (Calendly, Google Calendar, etc.)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 4: Objectives */}
            <TabsContent value="objectives" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Obiective Expert</CardTitle>
                  <CardDescription>
                    Selectează obiectivele pentru care ghidul este expert
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                    {objectivesData?.data?.map((objective) => (
                      <div key={objective.id} className="flex items-center space-x-2">
                        <Checkbox
                          checked={selectedObjectives.includes(objective.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedObjectives([...selectedObjectives, objective.id]);
                            } else {
                              setSelectedObjectives(
                                selectedObjectives.filter((id) => id !== objective.id)
                              );
                            }
                          }}
                        />
                        <label className="text-sm">{objective.title}</label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 5: SEO & Status */}
            <TabsContent value="seo" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Status & Verificare</CardTitle>
                  <CardDescription>
                    Setări de vizibilitate și verificare
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="verified"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Ghid Verificat</FormLabel>
                          <FormDescription>
                            Badge-ul "Verificat" va apărea pe profil
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="featured"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Featured</FormLabel>
                          <FormDescription>
                            Ghidul va apărea în homepage și în top rezultate
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="active"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Activ</FormLabel>
                          <FormDescription>
                            Ghidul este vizibil pe site
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="verification_notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Note Verificare</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={3} placeholder="Note interne despre verificare..." />
                        </FormControl>
                        <FormDescription>
                          Vizibile doar în admin
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>SEO</CardTitle>
                  <CardDescription>
                    Optimizare pentru motoarele de căutare
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="meta_title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meta Title</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Auto-generat dacă e gol" />
                        </FormControl>
                        <CharacterCounter current={field.value?.length || 0} max={60} />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="meta_description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meta Description</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={3} placeholder="Auto-generată dacă e goală" />
                        </FormControl>
                        <CharacterCounter current={field.value?.length || 0} max={160} />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <SEOHelper
                    title={form.watch("full_name")}
                    metaTitle={form.watch("meta_title") || ""}
                    metaDescription={form.watch("meta_description") || ""}
                    content={form.watch("bio") || ""}
                    slug={form.watch("slug")}
                    featuredImage={form.watch("profile_image")}
                    typesCount={form.watch("specializations")?.length || 0}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-4 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(ADMIN_ROUTES.guides)}
            >
              Anulează
            </Button>
            <Button type="submit" disabled={saveMutation.isPending}>
              <Save className="h-4 w-4 mr-2" />
              {saveMutation.isPending ? "Se salvează..." : "Salvează Ghid"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
