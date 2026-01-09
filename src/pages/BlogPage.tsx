import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { SEO } from "@/components/seo/SEO";
import { ArticleCard } from "@/components/features/blog/ArticleCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchBar } from "@/components/shared/SearchBar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { searchBlogArticles } from "@/lib/supabase/queries/search";
import { useDebounce } from "@/hooks/useDebounce";
import type { BlogCategory } from "@/types/database.types";
import { cn } from "@/lib/utils";
import { X, SlidersHorizontal, Star, Sparkles } from "lucide-react";
import { Compass } from "lucide-react";

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
  const [category, setCategory] = useState<BlogCategory | "all">((searchParams.get("category") as BlogCategory) || "all");
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "newest");
  const [featured, setFeatured] = useState(searchParams.get("featured") === "true");
  const [page, setPage] = useState(parseInt(searchParams.get("page") || "1"));

  const debouncedSearch = useDebounce(searchQuery, 500);
  const articlesPerPage = 12;

  const { data: articlesData, isLoading } = useQuery({
    queryKey: ["blog-search", debouncedSearch, category, sortBy, featured, page],
    queryFn: () => searchBlogArticles(
        debouncedSearch, 
        { category: category === "all" ? undefined : category, sortBy: sortBy as any, featured }, 
        page, 
        articlesPerPage
    ),
  });

  useEffect(() => { setPage(1); }, [debouncedSearch, category, sortBy, featured]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (category !== "all") params.set("category", category);
    if (searchQuery) params.set("search", searchQuery);
    if (sortBy !== "newest") params.set("sort", sortBy);
    if (featured) params.set("featured", "true");
    if (page > 1) params.set("page", page.toString());
    setSearchParams(params, { replace: true });
  }, [category, searchQuery, sortBy, featured, page, setSearchParams]);

  const hasActiveFilters = searchQuery !== "" || category !== "all" || featured;

  return (
    <>
      <SEO title="Blog APOT - Povești de Călătorie" description="Descoperă ghiduri și aventuri" canonical="/blog" />

      {/* Hero Dinamic & Compact */}
      <div className="relative bg-slate-900 text-slate-50 overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 z-0 opacity-10" 
             style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent z-0 pointer-events-none" />

        <Container className="relative z-10 py-12 md:py-20">
          <div className="flex flex-col lg:flex-row gap-10 items-center justify-between">
            <div className="text-center lg:text-left space-y-4 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary-foreground text-xs font-medium border border-primary/30 mb-2">
                <Compass className="w-3.5 h-3.5 text-primary animate-spin-slow" />
                <span>Inspiră-te pentru următoarea vacanță</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-white">
                Blog <span className="text-primary">APOT</span>
              </h1>
              <p className="text-lg text-white/70 leading-relaxed">
                Descoperă ghiduri, sfaturi utile și povești inspiraționale din întreaga lume.
              </p>
            </div>

            <div className="w-full max-w-md bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-2xl shadow-2xl">
               <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Caută un subiect..."
                className="w-full bg-slate-800/50 border-slate-700 text-black placeholder:text-slate-500 focus-visible:ring-primary"
              />
              <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-white/60 uppercase tracking-wider font-semibold">
                <span>Sugestii:</span>
                <button onClick={() => setSearchQuery("munte")} className="hover:text-primary transition-colors">#munte</button>
                <button onClick={() => setSearchQuery("city break")} className="hover:text-primary transition-colors">#citybreak</button>
                <button onClick={() => setSearchQuery("gastronomie")} className="hover:text-primary transition-colors">#food</button>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* Bara de Filtre Sticky */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b shadow-sm">
        <Container className="py-3">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto no-scrollbar pb-1 md:pb-0">
              <Button 
                variant={category === "all" ? "default" : "ghost"} 
                size="sm" 
                onClick={() => setCategory("all")}
                className="rounded-full shrink-0"
              >
                Toate
              </Button>
              {CATEGORIES.map((cat) => (
                <Button
                  key={cat.value}
                  variant={category === cat.value ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setCategory(cat.value)}
                  className={cn("rounded-full shrink-0", category === cat.value ? "shadow-md" : "text-muted-foreground")}
                >
                  {cat.label}
                </Button>
              ))}
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
               <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="h-9 w-full md:w-[160px] rounded-full bg-muted/50 border-none">
                    <SlidersHorizontal className="w-3.5 h-3.5 mr-2" />
                    <SelectValue placeholder="Sortează" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Cele mai noi</SelectItem>
                    <SelectItem value="oldest">Cele mai vechi</SelectItem>
                    <SelectItem value="popular">Cele mai citite</SelectItem>
                  </SelectContent>
               </Select>
               
               <Button 
                variant={featured ? "default" : "outline"} 
                size="sm" 
                onClick={() => setFeatured(!featured)}
                className={cn("rounded-full gap-2 shrink-0 border-dashed", featured && "bg-amber-500 hover:bg-amber-600 border-none")}
               >
                 <Star className={cn("w-3.5 h-3.5", featured && "fill-current")} />
                 <span className="text-xs">Recomandate</span>
               </Button>
            </div>
          </div>
        </Container>
      </div>

      <Container className="py-10">
        {/* Filtre Active - Vizibile doar la nevoie */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between mb-8 p-4 bg-primary/5 rounded-xl border border-primary/10">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs font-bold uppercase tracking-widest text-primary/70 mr-2">Filtre:</span>
              {category !== "all" && (
                <Badge variant="secondary" className="rounded-md gap-1 bg-background border shadow-sm">
                  {category} <X className="w-3 h-3 cursor-pointer hover:text-destructive" onClick={() => setCategory("all")} />
                </Badge>
              )}
              {featured && (
                <Badge variant="secondary" className="rounded-md gap-1 bg-amber-500 text-white border-none">
                  Recomandate <X className="w-3 h-3 cursor-pointer" onClick={() => setFeatured(false)} />
                </Badge>
              )}
              {searchQuery && (
                <Badge variant="secondary" className="rounded-md gap-1 bg-background border shadow-sm">
                  "{searchQuery}" <X className="w-3 h-3 cursor-pointer hover:text-destructive" onClick={() => setSearchQuery("")} />
                </Badge>
              )}
            </div>
            <Button variant="link" size="sm" onClick={() => { setSearchQuery(""); setCategory("all"); setFeatured(false); }} className="text-xs text-muted-foreground hover:text-destructive">
              Resetează
            </Button>
          </div>
        )}

        {/* Titlu Secțiune & Counter */}
        <div className="mb-8 flex items-end justify-between border-b border-border pb-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground capitalize">
                {category === "all" ? "Explorează noutățile" : category}
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
                {articlesData?.total || 0} articole găsite pentru selecția ta
            </p>
          </div>
        </div>

        {/* Grid Articole */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-[380px] rounded-3xl" />)}
          </div>
        ) : !articlesData || articlesData.articles.length === 0 ? (
          <EmptyState title="Oops! Niciun rezultat" description="Nu am găsit nimic care să se potrivească. Încearcă să resetezi filtrele." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {articlesData.articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </Container>
    </>
  );
}