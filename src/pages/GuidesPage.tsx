import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { SEO } from "@/components/seo/SEO";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { SearchBar } from "@/components/shared/SearchBar";
import { GuideAdvancedFilters, GuideFiltersState } from "@/components/features/guides/GuideAdvancedFilters";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { searchGuides, getFilterOptions } from "@/lib/supabase/queries/search";
import { useDebounce } from "@/hooks/useDebounce";
import { Star, Shield, MapPin, Languages } from "lucide-react";
import { AuthorizedGuidesCTA } from "@/components/features/guides/AuthorizedGuidesCTA";


export default function GuidesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<GuideFiltersState>({});
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(searchQuery, 500);

  // Fetch guides with search and filters
  const { data: guidesData, isLoading } = useQuery({
    queryKey: ["guides-search", debouncedSearch, filters, page],
    queryFn: () => searchGuides(debouncedSearch, filters, page, 12),
  });

  // Reset page when search or filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filters]);

  return (
    <>
      <SEO
        title="Ghizi Profesioniști Verificați | APOT"
        description="Descoperă ghizii noștri profesioniști verificați pentru experiențe de călătorie autentice în întreaga lume."
      />

      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            <Shield className="h-3 w-3 mr-1" />
            Ghizi Verificați
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Ghizii Noștri Profesioniști
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Experți locali verificați care transformă călătoriile în experiențe memorabile
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-card border rounded-lg p-6 mb-8 space-y-6">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Caută ghizi după nume, specializare sau regiune..."
            className="w-full"
          />

          <GuideAdvancedFilters
            filters={filters}
            onChange={setFilters}
          />
        </div>

        {/* Results Summary */}
        {!isLoading && guidesData && (
          <div className="mb-6 text-sm text-muted-foreground">
            Găsite {guidesData.total} ghizi
            {guidesData.total > 12 && ` (pagina ${page} din ${guidesData.pages})`}
          </div>
        )}

        {/* Guides Grid */}
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {guidesData?.guides.map((guide) => (
                <Link key={guide.id} to={`/ghid/${guide.slug}`}>
                  <Card className="p-6 hover:shadow-lg transition-shadow h-full">
                    <div className="flex items-start gap-4 mb-4">
                      {guide.profile_image ? (
                        <img
                          src={guide.profile_image}
                          alt={guide.full_name}
                          className="w-20 h-20 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-2xl font-bold text-primary">
                            {guide.full_name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-1">{guide.full_name}</h3>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{guide.rating_average.toFixed(1)}</span>
                          <span>({guide.reviews_count})</span>
                        </div>
                      </div>
                      {guide.verified && (
                        <Badge variant="default">
                          <Shield className="h-3 w-3 mr-1" />
                          Verificat
                        </Badge>
                      )}
                    </div>

                    {guide.short_description && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {guide.short_description}
                      </p>
                    )}

                    <div className="space-y-2">
                      {guide.specializations && guide.specializations.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {guide.specializations.slice(0, 3).map((spec) => (
                            <Badge key={spec} variant="secondary" className="text-xs">
                              {spec}
                            </Badge>
                          ))}
                          {guide.specializations.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{guide.specializations.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>
                          {guide.geographical_areas?.slice(0, 2).join(", ")}
                          {guide.geographical_areas && guide.geographical_areas.length > 2 &&
                            ` +${guide.geographical_areas.length - 2}`}
                        </span>
                      </div>

                      {guide.languages && guide.languages.length > 0 && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Languages className="h-4 w-4" />
                          <span>{guide.languages.join(", ")}</span>
                        </div>
                      )}

                      {guide.years_experience && (
                        <div className="text-sm font-medium text-primary">
                          {guide.years_experience} ani experiență
                        </div>
                      )}
                    </div>
                  </Card>
                </Link>
              ))}
            </div>


            {/* CTA Ghizi Autorizați - NOU! */}
            <div className="my-12">
              <AuthorizedGuidesCTA />
            </div>

            {/* Pagination */}
            {guidesData && guidesData.pages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors"
                >
                  Anterior
                </button>
                <div className="flex gap-1">
                  {[...Array(Math.min(guidesData.pages, 5))].map((_, i) => {
                    const pageNum = page > 3 ? page - 2 + i : i + 1;
                    if (pageNum > guidesData.pages) return null;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`px-3 py-1 border rounded-md transition-colors ${page === pageNum
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                          }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setPage(p => Math.min(guidesData.pages, p + 1))}
                  disabled={page === guidesData.pages}
                  className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors"
                >
                  Următorul
                </button>
              </div>
            )}
          </>
        )}

        {!isLoading && guidesData?.guides.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">
              Nu am găsit ghizi care să corespundă criteriilor tale.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
