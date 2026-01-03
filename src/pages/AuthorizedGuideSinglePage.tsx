/**
 * Authorized Guide Single Page
 * Profil individual ghid autorizat cu SEO optimization
 */

import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { getAuthorizedGuideBySlug } from "@/lib/supabase/queries/guides";
import { formatDate } from "@/lib/utils";
import { 
  Shield, 
  Award, 
  Calendar, 
  CheckCircle,
  ExternalLink,
  ArrowLeft,
  AlertCircle,
  FileText,
  Building
} from "lucide-react";
import { SEO } from "@/components/seo/SEO";
import { useEffect } from "react";

export default function AuthorizedGuideSinglePage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: guide, isLoading, error } = useQuery({
    queryKey: ["authorized-guide", slug],
    queryFn: () => getAuthorizedGuideBySlug(slug!),
    enabled: !!slug,
  });

  // Schema.org structured data pentru SEO
  useEffect(() => {
    if (!guide) return;

    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Person",
      "name": guide.full_name,
      "jobTitle": "Ghid de Turism Autorizat",
      "description": `Ghid de turism autorizat ${guide.attestation_type || "National"} - Licență ${guide.license_number}`,
      "hasCredential": {
        "@type": "EducationalOccupationalCredential",
        "credentialCategory": "Atestat Ghid Turism",
        "recognizedBy": {
          "@type": "GovernmentOrganization",
          "name": "Direcția Generală Turism - România",
          "alternateName": "SITUR"
        },
        "validFrom": guide.issue_date,
        "credentialId": guide.license_number
      }
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(structuredData);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [guide]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !guide) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Ghid Nedetectat
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Nu am găsit ghidul autorizat căutat. Vă rugăm verificați link-ul sau 
              căutați în lista completă.
            </p>
            <Button asChild className="w-full">
              <Link to="/ghizi-autorizati">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Înapoi la Listă
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title={`${guide.full_name} - Ghid Autorizat ${guide.attestation_type || "National"}`}
        description={`Verifică licența ghidului de turism ${guide.full_name} - Atestat ${guide.license_number} eliberat de Direcția Generală Turism. ${guide.attestation_type || "Ghid National"} autorizat oficial.`}
        ogType="website"
      />

      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        {/* Breadcrumbs */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-foreground">Acasă</Link>
              <span>/</span>
              <Link to="/ghizi-autorizati" className="hover:text-foreground">Ghizi Autorizați</Link>
              <span>/</span>
              <span className="text-foreground font-medium">{guide.full_name}</span>
            </nav>
          </div>
        </div>

        {/* Header Section */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-8 md:py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Link 
                to="/ghizi-autorizati"
                className="inline-flex items-center gap-2 text-blue-100 hover:text-white mb-6 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Înapoi la Listă
              </Link>

              <div className="flex flex-col md:flex-row items-start gap-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-full p-6">
                  <Shield className="h-16 w-16 md:h-20 md:w-20" />
                </div>
                
                <div className="flex-1">
                  <h1 className="text-3xl md:text-4xl font-bold mb-3">
                    {guide.full_name}
                  </h1>
                  
                  <div className="flex flex-wrap gap-3 mb-4">
                    {guide.attestation_type && (
                      <Badge className="bg-white/20 hover:bg-white/30 text-white border-white/40 text-base px-3 py-1">
                        <Shield className="h-4 w-4 mr-2" />
                        {guide.attestation_type}
                      </Badge>
                    )}
                    
                    {guide.data_source?.startsWith("situr") && (
                      <Badge className="bg-green-500/90 hover:bg-green-600 text-white border-0 text-base px-3 py-1">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Verificat SITUR
                      </Badge>
                    )}
                  </div>

                  {guide.specialization && (
                    <p className="text-lg text-blue-100">
                      {guide.specialization}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="container mx-auto px-4 py-8 md:py-12">
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* Official License Info */}
            <Card className="border-2 border-blue-200 shadow-lg">
              <CardHeader className="bg-blue-50">
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-6 w-6 text-blue-600" />
                  Informații Licență Oficială
                </CardTitle>
                <CardDescription>
                  Date verificate din registrul Direcției Generale Turism
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* License Number */}
                  <div>
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                      <FileText className="h-4 w-4" />
                      Număr Atestat
                    </div>
                    <div className="text-2xl font-bold font-mono text-blue-600">
                      {guide.license_number || "N/A"}
                    </div>
                  </div>

                  {/* Issue Date */}
                  {guide.issue_date && (
                    <div>
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                        <Calendar className="h-4 w-4" />
                        Data Eliberare
                      </div>
                      <div className="text-2xl font-bold">
                        {formatDate(guide.issue_date)}
                      </div>
                    </div>
                  )}

                  {/* Attestation Type */}
                  {guide.attestation_type && (
                    <div className="md:col-span-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                        <Shield className="h-4 w-4" />
                        Tip Atestat
                      </div>
                      <Badge variant="outline" className="text-base px-4 py-2">
                        {guide.attestation_type}
                      </Badge>
                    </div>
                  )}

                  {/* Status */}
                  <div>
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                      <CheckCircle className="h-4 w-4" />
                      Status Licență
                    </div>
                    <Badge 
                      variant={guide.license_active ? "default" : "secondary"}
                      className="text-base px-4 py-2"
                    >
                      {guide.license_active ? "✅ Activ" : "⏸️ Inactiv"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Info */}
            {(guide.region || guide.phone || guide.email) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Informații Suplimentare
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {guide.region && (
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Regiune: </span>
                      <span className="font-medium">{guide.region}</span>
                    </div>
                  )}
                  
                  {guide.languages && guide.languages.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Limbi: </span>
                      <span className="font-medium">{guide.languages.join(", ")}</span>
                    </div>
                  )}

                  {guide.phone && (
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Telefon: </span>
                      <a href={`tel:${guide.phone}`} className="font-medium hover:text-blue-600">
                        {guide.phone}
                      </a>
                    </div>
                  )}

                  {guide.email && (
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Email: </span>
                      <a href={`mailto:${guide.email}`} className="font-medium hover:text-blue-600">
                        {guide.email}
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Verification Notice */}
            <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg">
                      Licență Verificată Oficial
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Acest ghid este autorizat de <strong>Direcția Generală Turism</strong> conform 
                      legislației în vigoare. Informațiile afișate sunt extrase din registrul oficial SITUR.
                    </p>
                    <Button variant="outline" asChild className="gap-2">
                      <a 
                        href="https://se.situr.gov.ro/OpenData/OpenDataList?type=listaGhizi"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Verifică pe SITUR
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CTA Section */}
            <Card className="bg-gradient-to-r from-blue-600 to-blue-800 text-white border-0">
              <CardContent className="pt-6 text-center space-y-4">
                <h3 className="text-xl font-bold">
                  Caută alți ghizi autorizați
                </h3>
                <p className="text-blue-100">
                  Explorează lista completă cu peste {guide.data_source?.startsWith("situr") ? "2,500" : "mai mulți"} ghizi 
                  autorizați din întreaga țară
                </p>
                <Button variant="secondary" asChild className="gap-2">
                  <Link to="/ghizi-autorizati">
                    <Shield className="h-4 w-4" />
                    Vezi Toți Ghizii Autorizați
                  </Link>
                </Button>
              </CardContent>
            </Card>

          </div>
        </section>
      </div>
    </>
  );
}