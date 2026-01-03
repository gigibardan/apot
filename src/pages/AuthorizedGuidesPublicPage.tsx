/**
 * Public Authorized Guides Listing Page
 * Lista oficială cu ghizi autorizați din SITUR
 * SEO-optimized, mobile-friendly
 */

import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { getAuthorizedGuides, getImportStatistics } from "@/lib/supabase/queries/guides";
import { formatDate } from "@/lib/utils";
import { 
  Shield, 
  Search, 
  ExternalLink, 
  CheckCircle, 
  Calendar,
  Award,
  FileText,
  ChevronRight
} from "lucide-react";
import { SEO } from "@/components/seo/SEO";

export default function AuthorizedGuidesPublicPage() {
  const [search, setSearch] = useState("");
  const [attestationTypeFilter, setAttestationTypeFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const pageSize = 24;
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["public-authorized-guides", search, attestationTypeFilter, page],
    queryFn: () => getAuthorizedGuides({ 
      search: search || undefined,
      attestationType: attestationTypeFilter !== "all" ? attestationTypeFilter : undefined,
      limit: pageSize,
      offset: (page - 1) * pageSize
    }),
  });

  const { data: stats } = useQuery({
    queryKey: ["authorized-guides-stats"],
    queryFn: getImportStatistics,
  });

  const guides = data?.guides || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / pageSize);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <SEO 
        title="Ghizi Autorizați Oficial | Lista Completă SITUR"
        description={`Lista oficială cu ${total} ghizi de turism autorizați de Direcția Generală Turism (SITUR). Verifică licențele și atestările ghizilor din România.`}
        ogType="website"
      />

      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12 md:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex items-center justify-center gap-3 mb-6">
                <Shield className="h-12 w-12 md:h-16 md:w-16" />
                <h1 className="text-3xl md:text-5xl font-bold">
                  Ghizi Autorizați Oficial
                </h1>
              </div>
              
              <p className="text-lg md:text-xl text-blue-100 mb-6">
                Lista completă din Direcția Generală Turism (SITUR)
              </p>

              {stats && (
                <div className="flex flex-wrap justify-center gap-4 md:gap-8">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3">
                    <div className="text-3xl md:text-4xl font-bold">{stats.total}</div>
                    <div className="text-sm text-blue-200">Ghizi Autorizați</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3">
                    <div className="text-3xl md:text-4xl font-bold">{stats.imported_official}</div>
                    <div className="text-sm text-blue-200">Licențe Verificate</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Search & Filters Section */}
        <section className="container mx-auto px-4 -mt-8 mb-8">
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Caută Ghid Autorizat
              </CardTitle>
              <CardDescription>
                Verifică autorizația ghidului dumneavoastră de turism
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col md:flex-row gap-3">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    ref={searchInputRef}
                    placeholder="Caută după nume sau număr atestat..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    className="pl-10"
                  />
                </div>

                {/* Attestation Type Filter */}
                <Select 
                  value={attestationTypeFilter} 
                  onValueChange={(value) => {
                    setAttestationTypeFilter(value);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="Tip atestat" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toate tipurile</SelectItem>
                    <SelectItem value="National">National</SelectItem>
                    <SelectItem value="Local">Local</SelectItem>
                    <SelectItem value="Specializat">Specializat</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Results Counter */}
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <p>
                  Afișare <span className="font-semibold text-foreground">{guides.length}</span> din{" "}
                  <span className="font-semibold text-foreground">{total}</span> rezultate
                </p>
                <p className="hidden md:block">
                  Pagina {page} din {totalPages}
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Info Banner */}
        <section className="container mx-auto px-4 mb-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 md:p-6">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
              <div className="space-y-2">
                <h3 className="font-semibold text-blue-900">
                  Sursă Oficială Guvernamentală
                </h3>
                <p className="text-sm text-blue-800">
                  Această listă este actualizată periodic din baza de date oficială a 
                  Direcției Generale Turism (SITUR). Toate licențele afișate sunt verificate 
                  și valide conform legislației în vigoare.
                </p>
                <a 
                  href="https://se.situr.gov.ro/OpenData/OpenDataList?type=listaGhizi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Vezi sursa oficială SITUR
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Guides Grid */}
        <section className="container mx-auto px-4 pb-12">
          {guides.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <FileText className="h-16 w-16 mx-auto text-muted-foreground opacity-20 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nu au fost găsiți ghizi</h3>
                <p className="text-muted-foreground mb-4">
                  Încercați să modificați criteriile de căutare
                </p>
                {(search || attestationTypeFilter !== "all") && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearch("");
                      setAttestationTypeFilter("all");
                      setPage(1);
                    }}
                  >
                    Resetează filtrele
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {guides.map((guide: any) => (
                  <Link 
                    key={guide.id} 
                    to={`/ghid-autorizat/${guide.slug}`}
                    className="block group"
                  >
                    <Card className="h-full hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-2 hover:border-blue-300">
                      <CardHeader className="pb-3">
                        <div className="flex items-start gap-4">
                          {/* Avatar */}
                          <div className="relative flex-shrink-0">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-xl shadow-md">
                              {guide.full_name.charAt(0)}
                            </div>
                            {guide.data_source?.startsWith("situr") && (
                              <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 shadow-md">
                                <CheckCircle className="h-4 w-4 text-white" />
                              </div>
                            )}
                          </div>
                          
                          {/* Name & Description */}
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg group-hover:text-blue-600 transition-colors line-clamp-2">
                              {guide.full_name}
                            </CardTitle>
                            {guide.specialization && (
                              <CardDescription className="mt-1 line-clamp-1">
                                {guide.specialization}
                              </CardDescription>
                            )}
                          </div>
                          
                          {/* Arrow Icon */}
                          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-blue-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-3 pt-0">
                        {/* License Number */}
                        <div className="flex items-center gap-2 text-sm bg-blue-50 rounded-lg px-3 py-2">
                          <Award className="h-4 w-4 text-blue-600 flex-shrink-0" />
                          <span className="font-mono font-semibold text-blue-900">
                            {guide.license_number || "N/A"}
                          </span>
                        </div>

                        {/* Attestation Type & Issue Date */}
                        <div className="space-y-2">
                          {guide.attestation_type && (
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="gap-1 text-xs">
                                <Shield className="h-3 w-3" />
                                {guide.attestation_type}
                              </Badge>
                            </div>
                          )}

                          {guide.issue_date && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              Eliberat: {formatDate(guide.issue_date)}
                            </div>
                          )}
                        </div>

                        {/* Status Badge */}
                        <div className="pt-2 border-t flex items-center justify-between">
                          {guide.data_source?.startsWith("situr") ? (
                            <Badge variant="default" className="gap-1 text-xs">
                              <CheckCircle className="h-3 w-3" />
                              Verificat SITUR
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              Manual
                            </Badge>
                          )}
                          
                          <span className="text-xs text-blue-600 font-medium group-hover:underline">
                            Vezi detalii →
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-sm text-muted-foreground">
                    Pagina {page} din {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      Următorul
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </section>

        {/* Trust Signals Section */}
        <section className="bg-gray-50 border-t py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-center mb-8">
                De ce să verifici licența ghidului?
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <Shield className="h-8 w-8 text-blue-600 mb-2" />
                    <CardTitle className="text-lg">Siguranță</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Ghizii autorizați sunt profesioniști verificați de autorități
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CheckCircle className="h-8 w-8 text-green-600 mb-2" />
                    <CardTitle className="text-lg">Calitate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Formarea profesională garantează servicii de calitate
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <Award className="h-8 w-8 text-amber-600 mb-2" />
                    <CardTitle className="text-lg">Experiență</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Atestarea oficială confirmă competențele ghidului
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}