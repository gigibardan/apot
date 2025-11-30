import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { SEO } from "@/components/seo/SEO";
import { ArticleCard } from "@/components/features/blog/ArticleCard";
import { BlogListingSidebar } from "@/components/features/blog/BlogListingSidebar";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchBar } from "@/components/shared/SearchBar";
import { BlogAdvancedFilters, BlogFiltersState } from "@/components/features/blog/BlogAdvancedFilters";
import { Badge } from "@/components/ui/badge";
import { searchBlogArticles } from "@/lib/supabase/queries/search";
import { getAllTags } from "@/lib/supabase/queries/blog";
import { useDebounce } from "@/hooks/useDebounce";
import type { BlogCategory } from "@/types/database.types";
import { cn } from "@/lib/utils";

const CATEGORIES: { value: BlogCategory; label: string }[] = [
  { value: "călătorii", label: "Călătorii" },
  { value: "cultură", label: "Cultură" },
  { value: "istorie", label: "Istorie" },
  { value: "natură", label: "Natură" },
  { value: "gastronomie", label: "Gastronomie" },
  { value: "aventură", label: "Aventură" },
];

export default function BlogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [filters, setFilters] = useState<BlogFiltersState>({
    category: searchParams.get("category") as BlogCategory | undefined,
    sortBy: (searchParams.get("sort") as any) || "newest",
    featured: searchParams.get("featured") === "true",
  });
  const [page, setPage] = useState(parseInt(searchParams.get("page") || "1"));

  const debouncedSearch = useDebounce(searchQuery, 500);
  const articlesPerPage = 12;

  // Fetch articles with search and filters
  const { data: articlesData, isLoading } = useQuery({
    queryKey: ["blog-search", debouncedSearch, filters, page],
    queryFn: () => searchBlogArticles(debouncedSearch, filters, page, articlesPerPage),
  });

  // Fetch tags for sidebar
  const { data: allTags } = useQuery({
    queryKey: ["blog-tags"],
    queryFn: getAllTags,
  });

  // Reset page when search or filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filters]);

  // Update URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.category) params.set("category", filters.category);
    if (searchQuery) params.set("search", searchQuery);
    if (filters.sortBy && filters.sortBy !== "newest") params.set("sort", filters.sortBy);
    if (filters.featured) params.set("featured", "true");
    if (page > 1) params.set("page", page.toString());
    setSearchParams(params, { replace: true });
  }, [filters, searchQuery, page, setSearchParams]);

  const totalPages = articlesData ? articlesData.pages : 1;

  const getSEOTitle = () => {
    if (filters.category) {
      const cat = CATEGORIES.find((c) => c.value === filters.category);
      return `Articole despre ${cat?.label} | Blog APOT`;
    }
    return "Blog APOT - Ghiduri de Călătorie și Povești";
  };

  const getSEODescription = () => {
    if (filters.category) {
      const cat = CATEGORIES.find((c) => c.value === filters.category);
      return `Descoperă articole despre ${cat?.label?.toLowerCase()} - ghiduri, sfaturi și povești de călătorie.`;
    }
    return "Descoperă articole despre destinații turistice, sfaturi de călătorie și povești inspiraționale din întreaga lume.";
  };

  // Process tags for sidebar
  const tagCounts = allTags
    ? allTags
        .reduce((acc, tag) => {
          const existing = acc.find(t => t.tag === tag);
          if (existing) {
            existing.count++;
          } else {
            acc.push({ tag, count: 1 });
          }
          return acc;
        }, [] as { tag: string; count: number }[])
        .sort((a, b) => b.count - a.count)
        .slice(0, 15)
    : [];

  // Category counts (simplified - in production you'd fetch this from backend)
  const categoryCounts = CATEGORIES.map(cat => ({
    category: cat.value,
    count: 0, // Would be calculated from backend
  }));

  return (
    <>
      <SEO title={getSEOTitle()} description={getSEODescription()} canonical="/blog" />

      {/* Hero Banner */}
      <Section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 py-16">
        <Container>
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold tracking-tight">
              Blog APOT
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Descoperă ghiduri de călătorie, povești de aventură și sfaturi utile pentru călătorii
            </p>
          </div>
        </Container>
      </Section>

      {/* Search and Filters */}
      <Section className="py-8 border-b">
        <Container>
          <div className="space-y-6">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Caută articole după titlu, conținut sau tags..."
              className="w-full"
            />

            <BlogAdvancedFilters
              filters={filters}
              onChange={setFilters}
            />
          </div>
        </Container>
      </Section>

      {/* Articles Grid with Sidebar */}
      <Section className="py-12">
        <Container>
          <div className="grid lg:grid-cols-[1fr_300px] gap-8">
            {/* Main Content */}
            <div>
              {/* Results Summary */}
              {!isLoading && articlesData && (
                <div className="mb-6 text-sm text-muted-foreground">
                  Găsite {articlesData.total} articole
                  {articlesData.total > articlesPerPage && ` (pagina ${page} din ${totalPages})`}
                </div>
              )}

              {isLoading ? (
                <div className="grid md:grid-cols-2 gap-8">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-[400px]" />
                  ))}
                </div>
              ) : !articlesData || articlesData.articles.length === 0 ? (
                <EmptyState
                  icon="📝"
                  title="Niciun articol găsit"
                  description={
                    searchQuery
                      ? "Nu am găsit articole care să corespundă căutării tale"
                      : "Primul articol va fi publicat în curând"
                  }
                  action={
                    searchQuery
                      ? {
                          label: "Șterge căutarea",
                          onClick: () => setSearchQuery(""),
                        }
                      : {
                          label: "Explorează Obiective",
                          href: "/obiective",
                        }
                  }
                />
              ) : (
                <>
                  <div className="grid md:grid-cols-2 gap-8 mb-12">
                    {articlesData.articles.map((article) => (
                      <ArticleCard key={article.id} article={article} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors"
                      >
                        Anterior
                      </button>
                      <div className="flex gap-1">
                        {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                          const pageNum = page > 3 ? page - 2 + i : i + 1;
                          if (pageNum > totalPages) return null;
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setPage(pageNum)}
                              className={cn(
                                "px-3 py-1 border rounded-md transition-colors",
                                page === pageNum
                                  ? "bg-primary text-primary-foreground"
                                  : "hover:bg-muted"
                              )}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>
                      <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors"
                      >
                        Următorul
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Sidebar */}
            <aside className="hidden lg:block">
              <div className="sticky top-20">
                <BlogListingSidebar
                  categories={categoryCounts}
                  tags={tagCounts}
                  selectedCategory={(filters.category || "all") as "all" | BlogCategory}
                  onCategoryClick={(category) => {
                    setFilters({ ...filters, category: category === "all" ? undefined : category as BlogCategory });
                    setPage(1);
                  }}
                  onTagClick={(tag) => {
                    setSearchQuery(tag);
                    setPage(1);
                  }}
                />
              </div>
            </aside>
          </div>
        </Container>
      </Section>
    </>
  );
}
