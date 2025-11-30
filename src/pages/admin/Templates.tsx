import { useNavigate } from "react-router-dom";
import { FileText, Mountain, Camera, Building2, Trees, Waves } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import Breadcrumbs from "@/components/admin/Breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Template {
  id: string;
  name: string;
  description: string;
  icon: any;
  prefilledData: any;
}

export default function Templates() {
  const navigate = useNavigate();

  const objectiveTemplates: Template[] = [
    {
      id: "muzeu",
      name: "Muzeu",
      description: "Template pentru muzee și galerii de artă",
      icon: Building2,
      prefilledData: {
        types: ["muzee"],
        difficulty_level: "easy",
        visit_duration: "1-2 ore",
        opening_hours: "10:00-18:00 (Luni închis)"
      }
    },
    {
      id: "munte",
      name: "Munte",
      description: "Template pentru vârfuri și trasee montane",
      icon: Mountain,
      prefilledData: {
        types: ["munte"],
        difficulty_level: "moderate",
        visit_duration: "4-6 ore",
        best_season: "Iunie-Septembrie"
      }
    },
    {
      id: "plaja",
      name: "Plajă",
      description: "Template pentru plaje și destinații de coastă",
      icon: Waves,
      prefilledData: {
        types: ["plaja"],
        difficulty_level: "easy",
        visit_duration: "Câteva ore sau toată ziua",
        best_season: "Iunie-August"
      }
    },
    {
      id: "istoric",
      name: "Monument Istoric",
      description: "Template pentru castele și monumente istorice",
      icon: Building2,
      prefilledData: {
        types: ["istoric", "cultura"],
        difficulty_level: "easy",
        visit_duration: "2-3 ore",
        opening_hours: "09:00-17:00"
      }
    },
    {
      id: "natura",
      name: "Parc Natural",
      description: "Template pentru parcuri și rezervații naturale",
      icon: Trees,
      prefilledData: {
        types: ["natura"],
        difficulty_level: "easy",
        visit_duration: "Câteva ore",
        best_season: "Primăvara și toamna"
      }
    }
  ];

  const articleTemplates: Template[] = [
    {
      id: "ghid",
      name: "Ghid Destinație",
      description: "Ghid complet pentru o destinație turistică",
      icon: FileText,
      prefilledData: {
        category: "călătorii",
        content: `## Introducere\n\n[Scurtă introducere despre destinație]\n\n## Top Obiective Turistice\n\n### 1. [Nume Obiectiv]\n\n[Descriere]\n\n### 2. [Nume Obiectiv]\n\n[Descriere]\n\n## Sfaturi Practice\n\n- Transport\n- Cazare\n- Mâncare\n- Buget estimat\n\n## Când să Vizitezi\n\n[Informații despre cel mai bun sezon]\n\n## Concluzie\n\n[Concluzie și call to action]`
      }
    },
    {
      id: "top10",
      name: "Top 10 Listicle",
      description: "Articol în format listă numerotată",
      icon: FileText,
      prefilledData: {
        category: "călătorii",
        content: `## Introducere\n\n[De ce este important acest top]\n\n## 1. [Primul Element]\n\n[Descriere și de ce este pe primul loc]\n\n## 2. [Al Doilea Element]\n\n[Descriere]\n\n[...continuă cu restul până la 10]\n\n## 10. [Ultimul Element]\n\n[Descriere]\n\n## Concluzie\n\n[Rezumat și call to action]`
      }
    },
    {
      id: "poveste",
      name: "Poveste Călătorie",
      description: "Narațiune personală despre o călătorie",
      icon: FileText,
      prefilledData: {
        category: "călătorii",
        content: `## Cum A Început Totul\n\n[Introducere personală]\n\n## Ziua 1: [Titlu]\n\n[Povestea primei zile]\n\n## Ziua 2: [Titlu]\n\n[Continuare]\n\n## Ce Am Învățat\n\n[Lecții și reflexii]\n\n## Recomandări Pentru Tine\n\n[Sfaturi practice bazate pe experiență]`
      }
    }
  ];

  const handleSelectTemplate = (templateType: string, template: Template) => {
    // Store template data in localStorage
    localStorage.setItem(`template_${templateType}`, JSON.stringify(template.prefilledData));
    
    // Navigate to create form
    if (templateType === "obiective") {
      navigate("/admin/obiective/nou");
    } else if (templateType === "articole") {
      navigate("/admin/blog/nou");
    }
  };

  return (
    <Section className="py-8">
      <Container>
        <div className="mb-6">
          <Breadcrumbs
            items={[
              { label: "Dashboard", href: "/admin" },
              { label: "Template-uri" }
            ]}
          />
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold">Template-uri Conținut</h1>
          <p className="text-muted-foreground mt-2">
            Folosește template-uri pre-configurate pentru a crea conținut mai rapid
          </p>
        </div>

        <Tabs defaultValue="obiective">
          <TabsList>
            <TabsTrigger value="obiective">Obiective Turistice</TabsTrigger>
            <TabsTrigger value="articole">Articole Blog</TabsTrigger>
          </TabsList>

          <TabsContent value="obiective" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {objectiveTemplates.map((template) => {
                const Icon = template.icon;
                return (
                  <Card key={template.id} className="hover:border-primary transition-colors">
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <CardTitle>{template.name}</CardTitle>
                      </div>
                      <CardDescription>{template.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="text-sm text-muted-foreground">
                          <strong>Pre-completat:</strong>
                          <ul className="list-disc list-inside mt-1 space-y-1">
                            {Object.entries(template.prefilledData).map(([key, value]) => (
                              <li key={key} className="text-xs">
                                {key}: {Array.isArray(value) ? value.join(", ") : String(value)}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <Button
                          onClick={() => handleSelectTemplate("obiective", template)}
                          className="w-full"
                        >
                          Folosește Template
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="articole" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articleTemplates.map((template) => {
                const Icon = template.icon;
                return (
                  <Card key={template.id} className="hover:border-primary transition-colors">
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <CardTitle>{template.name}</CardTitle>
                      </div>
                      <CardDescription>{template.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="text-sm text-muted-foreground">
                          <strong>Include:</strong>
                          <ul className="list-disc list-inside mt-1 space-y-1 text-xs">
                            <li>Structură pre-definită</li>
                            <li>Headings optimizate SEO</li>
                            <li>Placeholder-e pentru conținut</li>
                            <li>Format Markdown</li>
                          </ul>
                        </div>
                        <Button
                          onClick={() => handleSelectTemplate("articole", template)}
                          className="w-full"
                        >
                          Folosește Template
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-8 p-6 bg-muted rounded-lg">
          <h3 className="font-semibold mb-2">Cum funcționează?</h3>
          <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
            <li>Selectează un template potrivit pentru tipul de conținut</li>
            <li>Vei fi redirecționat către formularul de creare</li>
            <li>Câmpurile vor fi pre-completate cu valorile din template</li>
            <li>Completează câmpurile rămase și salvează</li>
          </ol>
          <p className="text-sm text-muted-foreground mt-4">
            <strong>Notă:</strong> Template-urile economisesc timp oferind configurări pre-definite,
            dar poți modifica orice câmp după încărcare.
          </p>
        </div>
      </Container>
    </Section>
  );
}
