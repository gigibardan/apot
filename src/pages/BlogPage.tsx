import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { SEO } from "@/components/seo/SEO";
import { ArticleCard } from "@/components/features/blog/ArticleCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { getBlogArticles, getAllTags } from "@/lib/supabase/queries/blog";
import type { BlogArticle, BlogCategory } from "@/types/database.types";
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
  const [articles, setArticles] = useState<BlogArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState<BlogCategory | "all">(
    (searchParams.get("category") as BlogCategory) || "all"
  );
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "recent");
  const [page, setPage] = useState(parseInt(searchParams.get("page") || "1"));

  const articlesPerPage = 6;

  // Fetch articles
  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      try {
        const result = await getBlogArticles({
          category: selectedCategory === "all" ? undefined : selectedCategory,
          search: searchQuery || undefined,
          limit: articlesPerPage,
          offset: (page - 1) * articlesPerPage,
        });

        setArticles(result.data);
        setTotalCount(result.count);
      } catch (error) {
        console.error("Error fetching articles:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [selectedCategory, searchQuery, sortBy, page]);

  // Update URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategory !== "all") params.set("category", selectedCategory);
    if (searchQuery) params.set("search", searchQuery);
    if (sortBy !== "recent") params.set("sort", sortBy);
    if (page > 1) params.set("page", page.toString());
    setSearchParams(params, { replace: true });
  }, [selectedCategory, searchQuery, sortBy, page, setSearchParams]);

  const totalPages = Math.ceil(totalCount / articlesPerPage);

  const getSEOTitle = () => {
    if (selectedCategory !== "all") {
      const cat = CATEGORIES.find((c) => c.value === selectedCategory);
      return `Articole despre ${cat?.label} | Blog APOT`;
    }
    return "Blog APOT - Ghiduri de Călătorie și Povești";
  };

  const getSEODescription = () => {
    if (selectedCategory !== "all") {
      const cat = CATEGORIES.find((c) => c.value === selectedCategory);
      return `Descoperă articole despre ${cat?.label?.toLowerCase()} - ghiduri, sfaturi și povești de călătorie.`;
    }
    return "Descoperă articole despre destinații turistice, sfaturi de călătorie și povești inspiraționale din întreaga lume.";
  };

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

      {/* Filters */}
      <Section className="py-8 border-b">
        <Container>
          {/* Category Pills */}
          <div className="mb-6">
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
              <Badge
                variant={selectedCategory === "all" ? "default" : "outline"}
                className={cn(
                  "cursor-pointer whitespace-nowrap",
                  selectedCategory === "all" && "bg-primary text-primary-foreground"
                )}
                onClick={() => {
                  setSelectedCategory("all");
                  setPage(1);
                }}
              >
                Toate Articolele
              </Badge>
              {CATEGORIES.map((cat) => (
                <Badge
                  key={cat.value}
                  variant={selectedCategory === cat.value ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer whitespace-nowrap",
                    selectedCategory === cat.value && "bg-primary text-primary-foreground"
                  )}
                  onClick={() => {
                    setSelectedCategory(cat.value);
                    setPage(1);
                  }}
                >
                  {cat.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Search & Sort */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Caută articole..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="pl-10"
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Cele mai recente</SelectItem>
                <SelectItem value="popular">Populare</SelectItem>
                <SelectItem value="az">Alfabetic (A-Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Container>
      </Section>

      {/* Articles Grid */}
      <Section className="py-12">
        <Container>
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-[400px]" />
              ))}
            </div>
          ) : articles.length === 0 ? (
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
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {articles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 border rounded-md disabled:opacity-50 hover:bg-muted transition-colors"
                  >
                    Anterior
                  </button>
                  <div className="flex gap-1">
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setPage(i + 1)}
                        className={cn(
                          "px-3 py-1 border rounded-md transition-colors",
                          page === i + 1
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                        )}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 border rounded-md disabled:opacity-50 hover:bg-muted transition-colors"
                  >
                    Următorul
                  </button>
                </div>
              )}
            </>
          )}
        </Container>
      </Section>
    </>
  );
}
