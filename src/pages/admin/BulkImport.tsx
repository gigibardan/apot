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
      headers = [
        "title", "slug", "continent_slug", "country_name", "city", "excerpt", "description",
        "location_text", "latitude", "longitude", "visit_duration", "best_season",
        "difficulty_level", "entrance_fee", "opening_hours", "website_url",
        "unesco_site", "featured", "types_slugs", "featured_image_url"
      ];
      sampleData = [
        [
          "Castelul Bran", "castelul-bran", "europa", "România", "Brașov",
          "Castelul legendar al lui Dracula", "Descriere completă...",
          "Brașov, România", "45.5152", "25.3674", "2-3 ore", "Mai-Octombrie",
          "easy", "50 RON", "09:00-18:00", "https://bran-castle.com",
          "false", "true", "cultura,istoric", ""
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
    // Resolve continent ID
    const { data: continent } = await supabase
      .from("continents")
      .select("id")
      .eq("slug", data.continent_slug)
      .single();

    if (!continent) {
      throw new Error("Continent invalid");
    }

    // Country is now optional - try to find by name if provided
    let countryId = null;
    const countryName = data.country_name ? formatName(data.country_name) : null;
    
    if (countryName) {
      // Try to find existing country in DB
      const { data: country } = await supabase
        .from("countries")
        .select("id")
        .ilike("name", countryName)
        .maybeSingle();
      
      if (country) {
        countryId = country.id;
      }
    }

    // Format city name
    const cityName = data.city ? formatName(data.city) : null;

    // Insert objective
    const { data: objective, error } = await supabase
      .from("objectives")
      .insert({
        title: data.title,
        slug: data.slug,
        continent_id: continent.id,
        country_id: countryId,
        country_name: countryName,
        city: cityName,
        excerpt: data.excerpt,
        description: data.description,
        location_text: data.location_text,
        latitude: data.latitude ? parseFloat(data.latitude) : null,
        longitude: data.longitude ? parseFloat(data.longitude) : null,
        visit_duration: data.visit_duration,
        best_season: data.best_season,
        difficulty_level: data.difficulty_level || null,
        entrance_fee: data.entrance_fee,
        opening_hours: data.opening_hours,
        website_url: data.website_url,
        unesco_site: data.unesco_site === "true",
        featured: data.featured === "true",
        featured_image: data.featured_image_url,
        published: false
      })
      .select()
      .single();

    if (error) throw error;

    // Handle types
    if (data.types_slugs && objective) {
      const typeSlugs = data.types_slugs.split(",").map((s: string) => s.trim());
      
      for (const slug of typeSlugs) {
        const { data: type } = await supabase
          .from("objective_types")
          .select("id")
          .eq("slug", slug)
          .single();

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
