import { useState, useCallback } from "react";
import { Upload, Download, CheckCircle, XCircle, AlertCircle } from "lucide-react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ImportRow {
  index: number; // rândul real în CSV (pentru debug)
  data: any;
  errors: string[];
  status: "pending" | "success" | "error";
}

export default function BulkImport() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"obiective" | "articole" | "circuite">("obiective");
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const downloadTemplate = useCallback((type: string) => {
    let headers: string[];
    let sampleData: string[][];

    if (type === "obiective") {
      headers = [
        "title", "slug", "continent_slug", "country_name", "city", "excerpt", "description",
        "location_text", "latitude", "longitude", "visit_duration", "best_season",
        "difficulty_level", "entrance_fee", "opening_hours", "website_url",
        "unesco_site", "featured", "types_slugs",
        "featured_image_url",           // imaginea principală (hero)
        "gallery_image_1", "gallery_image_2", "gallery_image_3", "gallery_image_4",  // cele 4 extra
        "video_url"                     // YouTube sau direct video
      ];
      sampleData = [
        [
          "Taj Mahal", "taj-mahal", "asia", "India", "Agra",
          "Monumentul iubirii eternă", "Descriere lungă și frumoasă aici...",
          "Agra, India", "27.175145", "78.042142", "2-4 ore", "Octombrie-Martie",
          "easy", "1000 INR", "06:00-19:00", "https://tajmahal.gov.in",
          "true", "true", "cultura,istoric,romantic",
          "https://images.unsplash.com/...-taj-mahal.jpg",
          "https://images.unsplash.com/...-taj2.jpg",
          "https://images.unsplash.com/...-taj3.jpg",
          "https://images.unsplash.com/...-taj4.jpg",
          "https://images.unsplash.com/...-taj5.jpg",
          "https://www.youtube.com/watch?v=example"
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

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
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
  }, [toast]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setRows([]);
    setProgress(0);

    Papa.parse(uploadedFile, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      transformHeader: (h) => h.trim().toLowerCase(),
      complete: (results) => {
        if (results.errors.length > 0) {
          toast({
            variant: "destructive",
            title: "Eroare parsare CSV",
            description: "Verifică formatul fișierului (separator virgulă, encoding UTF-8)"
          });
          return;
        }

        const parsedRows: ImportRow[] = results.data.map((row: any, idx: number) => ({
          index: idx + 2,
          data: row,
          errors: validateRow(row, activeTab),
          status: "pending"
        }));

        setRows(parsedRows);

        const valid = parsedRows.filter(r => r.errors.length === 0).length;
        toast({
          title: "Fișier încărcat",
          description: `${parsedRows.length} rânduri procesate (${valid} valide)`
        });
      },
      error: (err) => {
        toast({
          variant: "destructive",
          title: "Eroare",
          description: err.message
        });
      }
    });
  }, [activeTab, toast]);

  const validateRow = (row: any, type: string): string[] => {
    const errors: string[] = [];

    if (!row.title?.trim()) errors.push("Titlu lipsă");
    if (!row.slug?.trim()) errors.push("Slug lipsă");

    if (type === "obiective") {
      if (!row.continent_slug?.trim()) errors.push("Continent lipsă");
      if (row.latitude && isNaN(parseFloat(row.latitude.trim()))) errors.push("Latitudine invalidă");
      if (row.longitude && isNaN(parseFloat(row.longitude.trim()))) errors.push("Longitudine invalidă");
      if (row.unesco_site && !["true", "false", "TRUE", "FALSE", "1", "0"].includes(row.unesco_site.trim())) {
        errors.push("unesco_site: true/false");
      }
      if (row.featured && !["true", "false", "TRUE", "FALSE", "1", "0"].includes(row.featured.trim())) {
        errors.push("featured: true/false");
      }
    }

    return errors;
  };

  const startImport = async () => {
    const validRows = rows.filter(r => r.errors.length === 0);
    if (validRows.length === 0) {
      toast({ variant: "destructive", title: "Nicio linie validă pentru import" });
      return;
    }

    setImporting(true);

    let success = 0;
    let errors = 0;

    for (let i = 0; i < validRows.length; i++) {
      const row = validRows[i];
      try {
        if (activeTab === "obiective") await importObjective(row.data);
        else if (activeTab === "articole") await importArticle(row.data);
        else await importCircuit(row.data);

        row.status = "success";
        success++;
      } catch (e: any) {
        row.status = "error";
        row.errors.push(e.message || "Eroare server");
        errors++;
      }

      setProgress(((i + 1) / validRows.length) * 100);
      setRows([...rows]);
    }

    setImporting(false);
    toast({
      title: "Import finalizat",
      description: `${success} succes, ${errors} erori`
    });
  };

  // === FUNCȚIILE TALE ORIGINALE (păstrate intacte) ===
  const formatName = (name: string): string => {
    if (!name) return "";
    return name
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

 // ============================================
// FUNCȚIE CORECTATĂ pentru BulkImport.tsx
// ============================================



const importObjective = async (data: any) => {
  // Găsim continentul
  const { data: continent } = await supabase
    .from("continents")
    .select("id")
    .eq("slug", data.continent_slug.trim())
    .single();

  if (!continent) throw new Error("Continent invalid");

  // Procesăm țara (opțional, dar cu formatare corectă)
  let countryId = null;
  const countryName = data.country_name ? formatName(data.country_name.trim()) : null;

  if (countryName) {
    const { data: country } = await supabase
      .from("countries")
      .select("id")
      .ilike("name", countryName)
      .maybeSingle();

    if (country) countryId = country.id;
  }

  // Procesăm orașul
  const cityName = data.city ? formatName(data.city.trim()) : null;

  // ✅ PROCESARE GALERIE - Preia TOATE cele 4 imagini din CSV
  const galleryImages = [
    data.gallery_image_1?.trim(),
    data.gallery_image_2?.trim(),
    data.gallery_image_3?.trim(),
    data.gallery_image_4?.trim(),
  ]
    .filter(url => url && url.length > 0) // elimină valorile goale sau null
    .map(url => ({ url: url })); // format pentru Supabase: array de obiecte {url: string}

  // ✅ INSERT în baza de date cu TOATE câmpurile
  const { data: objective, error } = await supabase
    .from("objectives")
    .insert({
      title: data.title.trim(),
      slug: data.slug.trim(),
      continent_id: continent.id,
      country_id: countryId,
      country_name: countryName,
      city: cityName,
      excerpt: data.excerpt?.trim() || null,
      description: data.description?.trim() || null,
      location_text: data.location_text?.trim() || null,
      latitude: data.latitude ? parseFloat(data.latitude.trim()) : null,
      longitude: data.longitude ? parseFloat(data.longitude.trim()) : null,
      visit_duration: data.visit_duration?.trim() || null,
      best_season: data.best_season?.trim() || null,
      difficulty_level: data.difficulty_level?.trim() || null,
      entrance_fee: data.entrance_fee?.trim() || null,
      opening_hours: data.opening_hours?.trim() || null,
      website_url: data.website_url?.trim() || null,
      booking_url: data.booking_url?.trim() || null,
      contact_email: data.contact_email?.trim() || null,
      contact_phone: data.contact_phone?.trim() || null,
      accessibility_info: data.accessibility_info?.trim() || null,
      google_place_id: data.google_place_id?.trim() || null,
      
      // ✅ VIDEO URLs - array JSON conform schema Supabase
      video_urls: data.video_url?.trim() ? [{ url: data.video_url.trim() }] : null,
      
      // ✅ Metadata SEO
      meta_title: data.meta_title?.trim() || null,
      meta_description: data.meta_description?.trim() || null,
      
      // Boolean fields
      unesco_site: data.unesco_site === "true" || data.unesco_site === "TRUE" || data.unesco_site === "1",
      featured: data.featured === "true" || data.featured === "TRUE" || data.featured === "1",
      
      // ✅ IMAGINI - imaginea principală + galeria
      featured_image: data.featured_image_url?.trim() || null,
      gallery_images: galleryImages.length > 0 ? galleryImages : null,
      
      published: false // Importurile încep ca draft
    })
    .select()
    .single();

  if (error) throw error;

  // ✅ Procesăm tipurile de obiectiv (dacă există)
  if (data.types_slugs && objective) {
    const typeSlugs = data.types_slugs
      .split(",")
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 0);

    for (const slug of typeSlugs) {
      const { data: type } = await supabase
        .from("objective_types")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();

      if (type) {
        await supabase
          .from("objectives_types_relations")
          .insert({
            objective_id: objective.id,
            type_id: type.id
          });
      }
    }
  }
};

  const importArticle = async (data: any) => {
    let normalizedCategory = null;
    if (data.category) {
      const categoryMap: Record<string, string> = {
        "călătorii": "calatorii", "călători": "calatorii", "calatorii": "calatorii",
        "călăuzire": "calauze", "călăuze": "calauze", "calauze": "calauze",
        "povești": "povesti", "povestiri": "povesti", "povesti": "povesti",
        "tips": "tips", "ghiduri": "ghiduri", "ghid": "ghiduri",
        "destinații": "destinatii", "destinatii": "destinatii",
        "inspiratie": "inspiratie", "inspirație": "inspiratie"
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
  // === SFÂRȘIT FUNCȚII ===

  return (
    <Section className="py-8">
      <Container>
        <div className="mb-6">
          <Breadcrumbs items={[{ label: "Dashboard", href: "/admin" }, { label: "Import în Masă" }]} />
        </div>

        <h1 className="text-3xl font-display font-bold mb-2">Import în Masă</h1>
        <p className="text-muted-foreground mb-8">Importă obiective, articole sau circuite din fișiere CSV</p>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="obiective">Obiective</TabsTrigger>
            <TabsTrigger value="articole">Articole</TabsTrigger>
            <TabsTrigger value="circuite">Circuite</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-6 mt-8">
            {/* Template Download */}
            <Card>
              <CardHeader>
                <CardTitle>1. Descarcă Template</CardTitle>
              </CardHeader>
              <CardContent>
                <Button onClick={() => downloadTemplate(activeTab)} variant="outline">
                  <Download className="w-4 h-4 mr-2" /> Template CSV
                </Button>
              </CardContent>
            </Card>

            {/* Upload */}
            <Card>
              <CardHeader>
                <CardTitle>2. Încarcă CSV-ul completat</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <label>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Button asChild>
                      <span><Upload className="w-4 h-4 mr-2" /> Alege fișier</span>
                    </Button>
                  </label>
                  {file && <span className="text-sm text-muted-foreground">{file.name}</span>}
                </div>
              </CardContent>
            </Card>

            {/* Preview + Errors Summary */}
            {rows.length > 0 && (
              <>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {rows.filter(r => r.errors.length === 0).length} rânduri valide din {rows.length}.
                    Doar cele valide vor fi importate.
                  </AlertDescription>
                </Alert>

                <Card>
                  <CardHeader>
                    <CardTitle>3. Previzualizare</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Rând</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Titlu</TableHead>
                            <TableHead>Slug</TableHead>
                            <TableHead>Erori</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {rows.map((row) => (
                            <TableRow key={row.index}>
                              <TableCell>{row.index}</TableCell>
                              <TableCell>
                                {row.status === "success" && <CheckCircle className="w-4 h-4 text-green-600" />}
                                {row.status === "error" && <XCircle className="w-4 h-4 text-destructive" />}
                                {row.errors.length === 0 && row.status === "pending" && <Badge variant="secondary">Valid</Badge>}
                                {row.errors.length > 0 && <Badge variant="destructive">Invalid</Badge>}
                              </TableCell>
                              <TableCell>{row.data.title || "-"}</TableCell>
                              <TableCell>{row.data.slug || "-"}</TableCell>
                              <TableCell className="max-w-xs truncate text-destructive">
                                {row.errors.join(", ")}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>

                {/* Import Button */}
                <Card>
                  <CardHeader>
                    <CardTitle>4. Pornește importul</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {importing && (
                      <div className="space-y-2">
                        <Progress value={progress} />
                        <p className="text-center text-sm text-muted-foreground">{Math.round(progress)}%</p>
                      </div>
                    )}
                    <Button
                      onClick={startImport}
                      disabled={importing || rows.filter(r => r.errors.length === 0).length === 0}
                      size="lg"
                      className="w-full"
                    >
                      {importing ? "Se importă..." : `Importă ${rows.filter(r => r.errors.length === 0).length} ${activeTab}`}
                    </Button>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      </Container>
    </Section>
  );
}