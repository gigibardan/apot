import { useState } from "react";
import { Upload, Download, CheckCircle, XCircle } from "lucide-react";
import Papa from "papaparse";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import Breadcrumbs from "@/components/admin/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ImportRow {
  data: any;
  errors: string[];
  status: "pending" | "success" | "error";
}

export default function BulkImport() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("obiective");
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const downloadTemplate = (type: string) => {
    let headers: string[];
    let sampleData: string[][];

    if (type === "obiective") {
      // 32 câmpuri complete
      headers = [
        "title", "slug", "continent_slug", "country_name", "city",
        "excerpt", "description", "location_text", "latitude", "longitude",
        "visit_duration", "best_season", "difficulty_level", "entrance_fee", "opening_hours",
        "website_url", "booking_url", "contact_email", "contact_phone", "accessibility_info",
        "google_place_id", "unesco_site", "featured", "types_slugs",
        "featured_image_url", "gallery_image_1", "gallery_image_2", "gallery_image_3", "gallery_image_4",
        "video_url", "meta_title", "meta_description"
      ];

      sampleData = [
        [
          // Basic Info (5)
          "Turn Eiffel",
          "turn-eiffel-paris",
          "europa",
          "Franța",
          "Paris",

          // Content (2)
          "Simbolul Parisului și cel mai vizitat monument cu plată din lume",
          "<h2>Istoria Turnului Eiffel</h2><p>Construit în 1889 pentru Expoziția Universală, Turnul Eiffel a devenit simbolul Parisului. Cu o înălțime de 330 metri, oferă vederi spectaculoase asupra orașului.</p>",

          // Location (3)
          "Champ de Mars, 5 Avenue Anatole France, 75007 Paris",
          "48.8584",
          "2.2945",

          // Visit Info (5)
          "2-3 ore",
          "Aprilie-Octombrie",
          "easy",
          "€26.10 (vârf) / €16.60 (etaj 2)",
          "09:30-23:45 (vara) / 09:30-18:30 (iarna)",

          // Contact & Booking (5)
          "https://www.toureiffel.paris",
          "https://www.toureiffel.paris/en/rates-opening-times",
          "info@toureiffel.paris",
          "+33 892 70 12 39",
          "Lift disponibil pentru persoane cu mobilitate redusă. Acces gratuit pentru persoana cu dizabilități + însoțitor",

          // Google (1)
          "ChIJLU7jZClu5kcR4PcOOO6p3I0",

          // Flags (3)
          "true",
          "true",
          "arhitectura,cultura,iconic",

          // Media (5)
          "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f",
          "https://images.unsplash.com/photo-1549144511-f099e773c147",
          "https://images.unsplash.com/photo-1502602898657-3e91760cbb34",
          "https://images.unsplash.com/photo-1431274172761-fca41d930114",
          "https://images.unsplash.com/photo-1550340499-a6c60fc8287c",
          "https://www.youtube.com/watch?v=IRM-FSjkqr8",

          // SEO (2)
          "Turn Eiffel Paris - Ghid Complet Vizitare 2024 | Bilete & Program",
          "Descoperă Turnul Eiffel: ghid complet cu bilete, program, tarife și sfaturi pentru a evita cozile. Cel mai iconic monument din Paris te așteaptă!"
        ]
      ];
    } else if (type === "articole") {
      headers = [
        "title", "slug", "category", "excerpt", "content", "tags",
        "meta_title", "meta_description", "featured", "featured_image"
      ];
      sampleData = [
        [
          "Ghid Complet București", "ghid-bucuresti", "călătorii",
          "Descoperă cele mai frumoase locuri din București", "Conținut complet aici...",
          "bucuresti,romania,ghid", "Ghid București | APOT", "Meta description...",
          "true", ""
        ]
      ];
    } else {
      headers = [
        "title", "slug", "description", "countries", "duration_days",
        "price_from", "external_url", "featured", "thumbnail_url"
      ];
      sampleData = [
        [
          "Circuitul Transilvaniei", "circuitul-transilvaniei",
          "7 zile prin cele mai frumoase castele", "romania", "7",
          "1500", "https://jinfotours.ro/circuit", "true", ""
        ]
      ];
    }

    const csv = Papa.unparse({
      fields: headers,
      data: sampleData
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `template_${type}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Template descărcat",
      description: `Template CSV pentru ${type} a fost descărcat cu succes.`
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);

    Papa.parse(uploadedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsedRows: ImportRow[] = results.data.map((row: any) => ({
          data: row,
          errors: validateRow(row, activeTab),
          status: "pending"
        }));
        setRows(parsedRows);
        toast({
          title: "Fișier încărcat",
          description: `${parsedRows.length} rânduri detectate.`
        });
      },
      error: (error) => {
        toast({
          variant: "destructive",
          title: "Eroare",
          description: `Nu am putut citi fișierul: ${error.message}`
        });
      }
    });
  };

  const validateRow = (row: any, type: string): string[] => {
    const errors: string[] = [];

    if (!row.title?.trim()) errors.push("Titlu lipsă");
    if (!row.slug?.trim()) errors.push("Slug lipsă");

    if (type === "obiective") {
      if (!row.continent_slug?.trim()) errors.push("Continent lipsă");
      // country_name is now optional
      if (row.latitude && isNaN(parseFloat(row.latitude))) {
        errors.push("Latitudine invalidă");
      }
      if (row.longitude && isNaN(parseFloat(row.longitude))) {
        errors.push("Longitudine invalidă");
      }
    }

    return errors;
  };

  const startImport = async () => {
    if (rows.length === 0) {
      toast({
        variant: "destructive",
        title: "Eroare",
        description: "Nu există date de importat"
      });
      return;
    }

    setImporting(true);
    setProgress(0);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      if (row.errors.length > 0) {
        row.status = "error";
        errorCount++;
        setRows([...rows]);
        continue;
      }

      try {
        if (activeTab === "obiective") {
          await importObjective(row.data);
        } else if (activeTab === "articole") {
          await importArticle(row.data);
        } else {
          await importCircuit(row.data);
        }

        row.status = "success";
        successCount++;
      } catch (error: any) {
        row.status = "error";
        row.errors.push(error.message || "Eroare la import");
        errorCount++;
      }

      setRows([...rows]);
      setProgress(((i + 1) / rows.length) * 100);
    }

    setImporting(false);

    toast({
      title: "Import finalizat",
      description: `${successCount} create cu succes, ${errorCount} erori.`
    });
  };

  // Helper to format name (First letter uppercase)
  const formatName = (name: string): string => {
    if (!name) return "";
    return name
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const importObjective = async (data: any) => {
    // 1. Resolve continent ID
    const { data: continent } = await supabase
      .from("continents")
      .select("id")
      .eq("slug", data.continent_slug)
      .single();

    if (!continent) {
      throw new Error("Continent invalid");
    }

    // 2. Country is optional - try to find by name if provided
    let countryId = null;
    const countryName = data.country_name ? formatName(data.country_name) : null;

    if (countryName) {
      const { data: country } = await supabase
        .from("countries")
        .select("id")
        .ilike("name", countryName)
        .maybeSingle();

      if (country) {
        countryId = country.id;
      }
    }

    // 3. Format city name
    const cityName = data.city ? formatName(data.city) : null;

    // 4. Parse booleans correctly (CRITICAL FIX!)
    const parseBoolean = (value: any): boolean => {
      if (typeof value === 'boolean') return value;
      if (typeof value === 'string') {
        return value.toLowerCase() === 'true' || value === '1';
      }
      return false;
    };

    // 5. Process gallery images (ARRAY)
    const galleryImages = [];
    if (data.gallery_image_1?.trim()) {
      galleryImages.push({ url: data.gallery_image_1.trim(), alt: "" });
    }
    if (data.gallery_image_2?.trim()) {
      galleryImages.push({ url: data.gallery_image_2.trim(), alt: "" });
    }
    if (data.gallery_image_3?.trim()) {
      galleryImages.push({ url: data.gallery_image_3.trim(), alt: "" });
    }
    if (data.gallery_image_4?.trim()) {
      galleryImages.push({ url: data.gallery_image_4.trim(), alt: "" });
    }

    // 6. Process video URL (ARRAY)
    const videoUrls = [];
    if (data.video_url?.trim()) {
      const videoUrl = data.video_url.trim();
      const platform = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')
        ? 'youtube'
        : videoUrl.includes('vimeo.com')
          ? 'vimeo'
          : 'other';

      videoUrls.push({
        url: videoUrl,
        platform: platform
      });
    }

    // 7. Insert objective with ALL fields
    const { data: objective, error } = await supabase
      .from("objectives")
      .insert({
        // Basic info
        title: data.title,
        slug: data.slug,
        continent_id: continent.id,
        country_id: countryId,
        country_name: countryName,
        city: cityName,
        excerpt: data.excerpt || null,
        description: data.description || null,

        // Location
        location_text: data.location_text || null,
        latitude: data.latitude ? parseFloat(data.latitude) : null,
        longitude: data.longitude ? parseFloat(data.longitude) : null,
        google_place_id: data.google_place_id?.trim() || null,

        // Media (FIXED!)
        featured_image: data.featured_image_url?.trim() || null,
        gallery_images: galleryImages.length > 0 ? galleryImages : [],
        video_urls: videoUrls.length > 0 ? videoUrls : [],

        // Visit info
        visit_duration: data.visit_duration || null,
        best_season: data.best_season || null,
        difficulty_level: data.difficulty_level || null,
        entrance_fee: data.entrance_fee || null,
        opening_hours: data.opening_hours || null,

        // Contact & Booking (FIXED!)
        website_url: data.website_url?.trim() || null,
        booking_url: data.booking_url?.trim() || null,
        contact_email: data.contact_email?.trim() || null,
        contact_phone: data.contact_phone?.trim() || null,
        accessibility_info: data.accessibility_info || null,

        // SEO (FIXED!)
        meta_title: data.meta_title || null,
        meta_description: data.meta_description || null,

        // Flags (FIXED BOOLEAN PARSING!)
        unesco_site: parseBoolean(data.unesco_site),
        featured: parseBoolean(data.featured),
        published: false // Default to draft
      })
      .select()
      .single();

    if (error) throw error;
    if (!objective) throw new Error("Failed to create objective");

    // 8. Process types_slugs and create relationships (FIXED!)
    if (data.types_slugs?.trim()) {
      const typeSlugs = data.types_slugs
        .split(',')
        .map((s: string) => s.trim())
        .filter((s: string) => s.length > 0);

      if (typeSlugs.length > 0) {
        // Fetch type IDs from slugs
        const { data: types } = await supabase
          .from("objective_types")
          .select("id, slug")
          .in("slug", typeSlugs);

        if (types && types.length > 0) {
          // Create relationships
          const relations = types.map((type: any) => ({
            objective_id: objective.id,
            type_id: type.id
          }));

          const { error: relError } = await supabase
            .from("objectives_types_relations")
            .insert(relations);

          if (relError) {
            console.error("Error creating type relations:", relError);
            // Don't throw - objective was created successfully
          }
        }
      }
    }

    return objective;
  };

  const importArticle = async (data: any) => {
    // Normalize category to match enum values (remove diacritics)
    let normalizedCategory = null;
    if (data.category) {
      const categoryMap: Record<string, string> = {
        "călătorii": "calatorii",
        "călători": "calatorii",
        "calatorii": "calatorii",
        "călăuzire": "calauze",
        "călăuze": "calauze",
        "calauze": "calauze",
        "povești": "povesti",
        "povestiri": "povesti",
        "povesti": "povesti",
        "tips": "tips",
        "ghiduri": "ghiduri",
        "ghid": "ghiduri",
        "destinații": "destinatii",
        "destinatii": "destinatii",
        "inspiratie": "inspiratie",
        "inspirație": "inspiratie"
      };
      const lower = data.category.toLowerCase().trim();
      normalizedCategory = categoryMap[lower] || lower;
    }

    const { error } = await supabase
      .from("blog_articles")
      .insert({
        title: data.title,
        slug: data.slug,
        category: normalizedCategory,
        excerpt: data.excerpt,
        content: data.content,
        tags: data.tags ? data.tags.split(",").map((s: string) => s.trim()) : [],
        meta_title: data.meta_title,
        meta_description: data.meta_description,
        featured: data.featured === "true",
        featured_image: data.featured_image,
        published: false
      });

    if (error) throw error;
  };

  const importCircuit = async (data: any) => {
    const { error } = await supabase
      .from("jinfotours_circuits")
      .insert({
        title: data.title,
        slug: data.slug,
        description: data.description,
        countries: data.countries ? data.countries.split(",").map((s: string) => s.trim()) : [],
        duration_days: data.duration_days ? parseInt(data.duration_days) : null,
        price_from: data.price_from ? parseFloat(data.price_from) : null,
        external_url: data.external_url,
        featured: data.featured === "true",
        thumbnail_url: data.thumbnail_url
      });

    if (error) throw error;
  };

  return (
    <Section className="py-8">
      <Container>
        <div className="mb-6">
          <Breadcrumbs
            items={[
              { label: "Dashboard", href: "/admin" },
              { label: "Import în Masă" }
            ]}
          />
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold">Import în Masă</h1>
          <p className="text-muted-foreground mt-2">
            Importă obiective, articole sau circuite din fișiere CSV
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="obiective">Obiective</TabsTrigger>
            <TabsTrigger value="articole">Articole</TabsTrigger>
            <TabsTrigger value="circuite">Circuite</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-6">
            {/* Step 1: Download Template */}
            <Card>
              <CardHeader>
                <CardTitle>Pasul 1: Descarcă Template</CardTitle>
                <CardDescription>
                  Descarcă template-ul CSV cu exemplu de date
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => downloadTemplate(activeTab)}>
                  <Download className="w-4 h-4 mr-2" />
                  Descarcă Template CSV
                </Button>
              </CardContent>
            </Card>

            {/* Step 2: Upload CSV */}
            <Card>
              <CardHeader>
                <CardTitle>Pasul 2: Încarcă CSV</CardTitle>
                <CardDescription>
                  Selectează fișierul CSV completat cu datele tale
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="csv-upload"
                  />
                  <label htmlFor="csv-upload">
                    <Button asChild>
                      <span>
                        <Upload className="w-4 h-4 mr-2" />
                        Selectează Fișier
                      </span>
                    </Button>
                  </label>
                  {file && (
                    <span className="text-sm text-muted-foreground">
                      {file.name} - {rows.length} rânduri
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Step 3: Preview */}
            {rows.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Pasul 3: Previzualizare</CardTitle>
                  <CardDescription>
                    Verifică datele înainte de import. Erorile sunt marcate cu roșu.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg overflow-auto max-h-[400px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">#</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Titlu</TableHead>
                          <TableHead>Slug</TableHead>
                          <TableHead>Erori</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rows.slice(0, 10).map((row, index) => (
                          <TableRow key={index}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>
                              {row.status === "success" && (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              )}
                              {row.status === "error" && (
                                <XCircle className="w-4 h-4 text-destructive" />
                              )}
                              {row.status === "pending" && row.errors.length === 0 && (
                                <Badge variant="secondary">Valid</Badge>
                              )}
                              {row.status === "pending" && row.errors.length > 0 && (
                                <Badge variant="destructive">Invalid</Badge>
                              )}
                            </TableCell>
                            <TableCell className={row.errors.length > 0 ? "text-destructive" : ""}>
                              {row.data.title}
                            </TableCell>
                            <TableCell>{row.data.slug}</TableCell>
                            <TableCell className="text-sm text-destructive">
                              {row.errors.join(", ")}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {rows.length > 10 && (
                    <p className="text-sm text-muted-foreground mt-4">
                      Afișează primele 10 din {rows.length} rânduri
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Step 4: Import */}
            {rows.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Pasul 4: Importă</CardTitle>
                  <CardDescription>
                    Începe procesul de import. Durata depinde de numărul de rânduri.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {importing && (
                    <div className="space-y-2">
                      <Progress value={progress} />
                      <p className="text-sm text-muted-foreground text-center">
                        {Math.round(progress)}% complet
                      </p>
                    </div>
                  )}
                  <Button
                    onClick={startImport}
                    disabled={importing || rows.every(r => r.errors.length > 0)}
                    className="w-full"
                  >
                    {importing ? "Se importă..." : `Importă ${rows.length} ${activeTab}`}
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </Container>
    </Section>
  );
}
