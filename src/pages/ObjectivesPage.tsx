import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { SEO } from "@/components/seo/SEO";
import { Breadcrumbs, type BreadcrumbItem } from "@/components/features/objectives/Breadcrumbs";
import { ObjectiveFilters, FilterValues } from "@/components/features/objectives/ObjectiveFilters";
import { ObjectivesGrid } from "@/components/features/objectives/ObjectivesGrid";
import { getObjectives } from "@/lib/supabase/queries/objectives";
import { getContinents, getCountries } from "@/lib/supabase/queries/taxonomies";
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
  const [continentName, setContinentName] = useState<string>("");
  const [countryName, setCountryName] = useState<string>("");

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

  // Fetch taxonomy names for breadcrumbs
  useEffect(() => {
    const fetchNames = async () => {
      if (filters.continent) {
        try {
          const continents = await getContinents();
          const continent = continents.find(c => c.slug === filters.continent);
          setContinentName(continent?.name || filters.continent);
        } catch (error) {
          console.error("Error fetching continent:", error);
        }
      } else {
        setContinentName("");
      }

      if (filters.country) {
        try {
          // Get all continents first to find the right one
          const continents = await getContinents();
          for (const continent of continents) {
            const countries = await getCountries(continent.id);
            const country = countries.find(c => c.slug === filters.country);
            if (country) {
              setCountryName(country.name);
              break;
            }
          }
        } catch (error) {
          console.error("Error fetching country:", error);
        }
      } else {
        setCountryName("");
      }
    };

    fetchNames();
  }, [filters.continent, filters.country]);

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

    if (countryName) {
      parts.push(`în ${countryName}`);
    } else if (continentName) {
      parts.push(`în ${continentName}`);
    }

    if (filters.unesco) {
      parts.push("UNESCO");
    }

    return parts.join(" ");
  };

  const getPageDescription = () => {
    if (totalCount > 0) {
      return `Descoperă ${totalCount} obiective turistice${countryName ? ` în ${countryName}` : continentName ? ` în ${continentName}` : ""
        }. Informații detaliate, fotografii și sfaturi practice pentru fiecare destinație.`;
    }
    return "Descoperă obiective turistice din întreaga lume. Informații detaliate despre monumente, muzee, parcuri naturale și destinații de vis.";
  };

  // Generate structured data for ItemList
  const getStructuredData = () => {
    if (objectives.length === 0) return undefined;

    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": getPageTitle(),
      "numberOfItems": totalCount,
      "itemListElement": objectives.map((objective, index) => ({
        "@type": "ListItem",
        "position": (currentPage - 1) * PAGE_SIZE + index + 1,
        "item": {
          "@type": "TouristAttraction",
          "name": objective.title,
          "description": objective.excerpt || undefined,
          "url": `${window.location.origin}/obiective/${objective.slug}`,
          "image": objective.featured_image || undefined,
        },
      })),
    };
  };

  // Generate breadcrumbs
  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const items: BreadcrumbItem[] = [{ label: "Obiective Turistice", href: "/obiective" }];

    if (continentName) {
      items.push({
        label: continentName,
        href: `/obiective?continent=${filters.continent}`,
      });
    }

    if (countryName) {
      items.push({
        label: countryName,
      });
    }

    return items;
  };


  return (
    <>
      <SEO
        title={getPageTitle()}
        description={getPageDescription()}
        canonical="/obiective"
        structuredData={getStructuredData()}
      />

      {/* Hero Section */}
      <div className="bg-[#0F172A] text-white border-b border-white/10">
        <Container className="py-12 md:py-16">
          {/* Breadcrumbs - Am adăugat !text-white/80 pentru a forța culoarea peste stilurile automate */}
          <div className="mb-6">
            <Breadcrumbs
              items={getBreadcrumbs()}
              className="!text-white/80 [&_*]:!text-white/80 hover:[&_*]:!text-white transition-colors"
            />
          </div>

          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-[2.75rem] font-bold tracking-tight mb-2 leading-tight">
              {countryName ? (
                <>Obiective Turistice în <span className="text-primary">{countryName}</span></>
              ) : continentName ? (
                <>Obiective Turistice în <span className="text-primary">{continentName}</span></>
              ) : (
                <>Obiective <span className="text-primary">Turistice</span></>
              )}
            </h1>
            <p className="text-lg text-white/60 leading-relaxed max-w-2xl">
              {totalCount > 0
                ? `${totalCount} obiective turistice fascinante`
                : "Descoperă obiective turistice din întreaga lume"}
            </p>
          </div>
        </Container>
      </div>

      <Section className="py-12 bg-slate-50/50 dark:bg-background">
        <Container>
          <div className="grid lg:grid-cols-[300px_1fr] gap-8">
            {!isMobile && (
              <aside>
                <div className="sticky top-24">
                  <ObjectiveFilters
                    filters={filters}
                    onFiltersChange={handleFiltersChange}
                    activeFilterCount={activeFilterCount}
                  />
                </div>
              </aside>
            )}

            <main>
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
            </main>
          </div>

          {isMobile && (
            <ObjectiveFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onApply={() => {
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
