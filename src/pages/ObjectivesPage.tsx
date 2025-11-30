import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { SEO } from "@/components/seo/SEO";
import { ObjectiveFilters, FilterValues } from "@/components/features/objectives/ObjectiveFilters";
import { ObjectivesGrid } from "@/components/features/objectives/ObjectivesGrid";
import { getObjectives } from "@/lib/supabase/queries/objectives";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import type { ObjectiveWithRelations } from "@/types/database.types";

const PAGE_SIZE = 12;

export default function ObjectivesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // State
  const [objectives, setObjectives] = useState<ObjectiveWithRelations[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Parse URL params into filter state
  const initialFilters: FilterValues = {
    search: searchParams.get("search") || "",
    continent: searchParams.get("continent") || "",
    country: searchParams.get("country") || "",
    types: searchParams.get("type")?.split(",").filter(Boolean) || [],
    unesco: searchParams.get("unesco") === "true",
    featured: searchParams.get("featured") === "true",
  };

  const [filters, setFilters] = useState<FilterValues>(initialFilters);
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page") || "1")
  );
  const [sortBy, setSortBy] = useState<
    "views_count" | "created_at" | "published_at" | "title"
  >((searchParams.get("sort") as any) || "views_count");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(
    (searchParams.get("order") as "asc" | "desc") || "desc"
  );

  // Sync filters to URL
  useEffect(() => {
    const params: Record<string, string> = {};

    if (filters.search) params.search = filters.search;
    if (filters.continent) params.continent = filters.continent;
    if (filters.country) params.country = filters.country;
    if (filters.types.length > 0) params.type = filters.types.join(",");
    if (filters.unesco) params.unesco = "true";
    if (filters.featured) params.featured = "true";
    if (currentPage > 1) params.page = currentPage.toString();
    if (sortBy !== "views_count") params.sort = sortBy;
    if (sortOrder !== "desc") params.order = sortOrder;

    setSearchParams(params, { replace: true });
  }, [filters, currentPage, sortBy, sortOrder, setSearchParams]);

  // Fetch objectives
  const fetchObjectives = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getObjectives({
        continent: filters.continent || undefined,
        country: filters.country || undefined,
        types: filters.types.length > 0 ? filters.types : undefined,
        unesco: filters.unesco || undefined,
        featured: filters.featured || undefined,
        search: filters.search || undefined,
        published: true,
        limit: PAGE_SIZE,
        offset: (currentPage - 1) * PAGE_SIZE,
        sortBy,
        sortOrder,
      });

      setObjectives(result.data);
      setTotalCount(result.count);
    } catch (err) {
      console.error("Error fetching objectives:", err);
      setError(err as Error);
      toast({
        variant: "destructive",
        title: "Eroare",
        description: "Nu am putut încărca obiectivele. Te rugăm să încerci din nou.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount and when dependencies change
  useEffect(() => {
    fetchObjectives();
    // Scroll to top on page/filter change
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [filters, currentPage, sortBy, sortOrder]);

  // Handlers
  const handleFiltersChange = (newFilters: FilterValues) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to page 1 on filter change
  };

  const handleSortChange = (newSortBy: string, newSortOrder: "asc" | "desc") => {
    setSortBy(newSortBy as "views_count" | "created_at" | "published_at" | "title");
    setSortOrder(newSortOrder);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleClearFilters = () => {
    setFilters({
      search: "",
      continent: "",
      country: "",
      types: [],
      unesco: false,
      featured: false,
    });
    setCurrentPage(1);
  };

  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.continent) count++;
    if (filters.country) count++;
    if (filters.types.length > 0) count++;
    if (filters.unesco) count++;
    if (filters.featured) count++;
    return count;
  }, [filters]);

  const hasActiveFilters = activeFilterCount > 0;

  // Dynamic SEO
  const getPageTitle = () => {
    const parts: string[] = ["Obiective Turistice"];
    
    if (filters.country) {
      // Will need to fetch country name, for now use slug
      parts.push(`în ${filters.country}`);
    } else if (filters.continent) {
      parts.push(`în ${filters.continent}`);
    }
    
    if (filters.unesco) {
      parts.push("UNESCO");
    }
    
    parts.push("| APOT");
    return parts.join(" ");
  };

  const getPageDescription = () => {
    if (totalCount > 0) {
      return `Descoperă ${totalCount} obiective turistice${
        filters.continent ? ` în ${filters.continent}` : ""
      }. Informații detaliate, fotografii și sfaturi practice pentru fiecare destinație.`;
    }
    return "Descoperă obiective turistice din întreaga lume. Informații detaliate despre monumente, muzee, parcuri naturale și destinații de vis.";
  };

  return (
    <>
      <SEO
        title={getPageTitle()}
        description={getPageDescription()}
        canonical="/obiective"
      />

      <Section className="py-8">
        <Container>
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-display font-bold tracking-tight mb-2">
              Obiective Turistice
            </h1>
            <p className="text-lg text-muted-foreground">
              Descoperă obiective turistice fascinante din întreaga lume
            </p>
          </div>

          {/* Main Layout */}
          <div className="grid lg:grid-cols-[300px_1fr] gap-8">
            {/* Filters - Desktop Sidebar */}
            {!isMobile && (
              <div>
                <ObjectiveFilters
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                  activeFilterCount={activeFilterCount}
                />
              </div>
            )}

            {/* Results Grid */}
            <div>
              <ObjectivesGrid
                objectives={objectives}
                loading={loading}
                error={error}
                totalCount={totalCount}
                currentPage={currentPage}
                pageSize={PAGE_SIZE}
                sortBy={sortBy}
                sortOrder={sortOrder}
                hasActiveFilters={hasActiveFilters}
                onSortChange={handleSortChange}
                onPageChange={handlePageChange}
                onClearFilters={handleClearFilters}
                onRetry={fetchObjectives}
              />
            </div>
          </div>

          {/* Filters - Mobile Drawer */}
          {isMobile && (
            <ObjectiveFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onApply={() => {
                // Drawer will close automatically
                toast({
                  title: "Filtre aplicate",
                  description: `${totalCount} obiective găsite`,
                });
              }}
              isMobile
              activeFilterCount={activeFilterCount}
            />
          )}
        </Container>
      </Section>
    </>
  );
}
