import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { SEO } from "@/components/seo/SEO";
import { Container } from "@/components/layout/Container";
import { SearchBar } from "@/components/shared/SearchBar";
import { GuideAdvancedFilters, GuideFiltersState } from "@/components/features/guides/GuideAdvancedFilters";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { searchGuides } from "@/lib/supabase/queries/search";
import { useDebounce } from "@/hooks/useDebounce";
import { Star, Shield, MapPin, Languages, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { AuthorizedGuidesCTA } from "@/components/features/guides/AuthorizedGuidesCTA";
import { cn } from "@/lib/utils";

export default function GuidesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<GuideFiltersState>({});
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(searchQuery, 500);

  const { data: guidesData, isLoading } = useQuery({
    queryKey: ["guides-search", debouncedSearch, filters, page],
    queryFn: () => searchGuides(debouncedSearch, filters, page, 12),
  });

  useEffect(() => { setPage(1); }, [debouncedSearch, filters]);

  return (
    <div className="min-h-screen bg-slate-50/50">
      <SEO title="Ghizi Profesioniști Verificați | APOT" description="Descoperă experți locali." />

      {/* Hero Section */}
      <div className="bg-[#0F172A] text-white border-b border-white/10">
        <Container className="py-12 md:py-16">
          <div className="flex flex-col lg:flex-row gap-10 items-center justify-between">
            <div className="text-center lg:text-left space-y-4 max-w-xl">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 px-3 py-1">
                <Shield className="h-3.5 w-3.5 mr-2" />
                Ghizi Verificați
              </Badge>
              {/* Titlu ușor mărit conform cerinței */}
              <h1 className="text-3xl md:text-[2.75rem] font-bold tracking-tight leading-tight">
                Ghizii Noștri <span className="text-primary">Profesioniști</span>
              </h1>
              <p className="text-lg text-slate-400 leading-relaxed">
                Experți locali verificați care transformă călătoriile în experiențe memorabile.
              </p>
            </div>

            <div className="w-full max-w-md">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-2xl shadow-2xl">
                <SearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Caută după nume, oraș sau specializare..."
                  className="w-full bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                />
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* Filtre Floating */}
      <div className="relative z-20">
        <Container className="-mt-8">
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-1.5">
            <div className="flex flex-col md:flex-row md:items-center gap-2">
              <div className="px-5 py-3 md:border-r border-slate-100 flex items-center gap-3 shrink-0">
                <Filter className="h-4 w-4 text-primary" />
                <span className="font-bold text-sm text-slate-800">Filtrează</span>
              </div>
              <div className="flex-1 px-2 py-1">
                <GuideAdvancedFilters filters={filters} onChange={setFilters} />
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* Grid Ghizi */}
      <Container className="py-12">
        <div className="mb-8 flex items-baseline justify-between border-b border-slate-200 pb-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500">
            {guidesData?.total || 0} Experți locali
          </h2>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => <Card key={i} className="h-64 animate-pulse rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {guidesData?.guides.map((guide) => (
              <Link key={guide.id} to={`/ghid/${guide.slug}`}>
                <Card className="p-6 hover:shadow-xl transition-all duration-300 h-full border-slate-200 rounded-2xl flex flex-col group bg-white">
                  {/* Header Card Wide - Layout Optimizat pentru nume lungi */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="shrink-0">
                      {guide.profile_image ? (
                        <img
                          src={guide.profile_image}
                          alt={guide.full_name}
                          className="w-20 h-20 rounded-xl object-cover shadow-sm ring-2 ring-slate-50"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/5">
                          <span className="text-2xl font-bold text-primary">{guide.full_name.charAt(0)}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Numele ocupă acum tot rândul de sus */}
                      <h3 className="font-bold text-lg mb-2 text-slate-900 group-hover:text-primary transition-colors leading-tight">
                        {guide.full_name}
                      </h3>

                      {/* Badge-ul este mutat aici, lângă rating */}
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-1.5 text-sm">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-bold text-slate-700">{guide.rating_average.toFixed(1)}</span>
                          <span className="text-slate-400">({guide.reviews_count})</span>
                        </div>

                        {guide.verified && (
                          <Badge className="bg-orange-500 hover:bg-orange-600 text-white border-none text-[10px] px-2 py-0.5 rounded-lg flex items-center gap-1 ml-auto sm:ml-0">
                            <Shield className="h-3 w-3" />
                            Verificat
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {guide.short_description && (
                    <p className="text-sm text-slate-600 mb-6 line-clamp-3 leading-relaxed">
                      {guide.short_description}
                    </p>
                  )}

                  <div className="mt-auto space-y-3 pt-4 border-t border-slate-100">
                    <div className="flex flex-wrap gap-1">
                      {guide.specializations?.slice(0, 2).map((spec) => (
                        <Badge key={spec} variant="secondary" className="text-[10px] bg-slate-100 text-slate-600 border-none font-medium">
                          {spec}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        <span className="truncate max-w-[150px]">
                          {guide.geographical_areas?.slice(0, 2).join(", ")}
                          {guide.geographical_areas && guide.geographical_areas.length > 2 && ` +${guide.geographical_areas.length - 2}`}
                        </span>
                      </div>
                    </div>

                    {guide.years_experience && (
                      <div className="text-[12px] font-bold text-orange-600">
                        {guide.years_experience} ani experiență
                      </div>
                    )}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Separator subtil între grilă și CTA */}
        <div className="w-full h-px bg-slate-200 mb-16" />

        {/* Zona de Verificare Licență */}
        <div className="mb-12">
          <AuthorizedGuidesCTA />
        </div>

        {/* Paginație */}
        {guidesData && guidesData.pages > 1 && (
          <div className="flex justify-center items-center gap-3">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)} className="rounded-lg h-9 w-9 p-0">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium px-4 text-slate-600">Pagina {page} / {guidesData.pages}</span>
            <Button variant="outline" size="sm" disabled={page === guidesData.pages} onClick={() => setPage(p => p + 1)} className="rounded-lg h-9 w-9 p-0">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </Container>
    </div>
  );
}