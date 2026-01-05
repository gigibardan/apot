import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, MapPin, Heart, Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { SEO } from "@/components/seo/SEO";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { ContinentCard } from "@/components/features/continents/ContinentCard";
import { ObjectiveCard } from "@/components/features/objectives/ObjectiveCard";
import { CircuitCard } from "@/components/features/circuits/CircuitCard";
import { ArticleCard } from "@/components/features/blog/ArticleCard";
import { NewsletterSignup } from "@/components/features/newsletter/NewsletterSignup";
import { FeaturedGuides } from "@/components/features/guides/FeaturedGuides";
import { PUBLIC_ROUTES } from "@/lib/constants/routes";
import { seoDefaults } from "@/lib/constants/seo-defaults";
import { getContinentsWithTranslations } from "@/lib/supabase/queries/continents";
import { getFeaturedObjectives } from "@/lib/supabase/queries/objectives";
import { getCircuits } from "@/lib/supabase/queries/jinfotours";
import { getFeaturedArticles } from "@/lib/supabase/queries/blog";
import { trackContinentClick, trackCircuitClick } from "@/lib/analytics/events";
import { generateWebsiteSchema, generateOrganizationSchema } from "@/lib/utils/structured-data";
import type { Continent, ObjectiveWithRelations, JinfoursCircuit, BlogArticle } from "@/types/database.types";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslatedObjectives } from "@/hooks/useTranslatedContent";

/**
 * Homepage
 * Main landing page with hero, features preview, and CTAs
 */
export default function HomePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Data state
  const [continents, setContinents] = useState<Continent[]>([]);
  const [rawObjectives, setRawObjectives] = useState<ObjectiveWithRelations[]>([]);
  const [circuits, setCircuits] = useState<JinfoursCircuit[]>([]);
  const [articles, setArticles] = useState<BlogArticle[]>([]);
  
  // Get translated objectives using custom hook
  const { content: objectives, isLoading: objectivesTranslationLoading } = useTranslatedObjectives(rawObjectives);
  
  // Loading state
  const [continentsLoading, setContinentsLoading] = useState(true);
  const [objectivesLoading, setObjectivesLoading] = useState(true);
  const [circuitsLoading, setCircuitsLoading] = useState(true);
  const [articlesLoading, setArticlesLoading] = useState(true);
  
  // Error state
  const [continentsError, setContinentsError] = useState<string | null>(null);
  const [objectivesError, setObjectivesError] = useState<string | null>(null);
  const [circuitsError, setCircuitsError] = useState<string | null>(null);
  const [articlesError, setArticlesError] = useState<string | null>(null);

  // Fetch data on mount and when language changes
  useEffect(() => {
    fetchContinents();
    fetchObjectives();
    fetchCircuits();
    fetchArticles();
  }, [currentLanguage]);

  const fetchContinents = async () => {
    try {
      setContinentsLoading(true);
      setContinentsError(null);
      const data = await getContinentsWithTranslations(currentLanguage);
      setContinents(data);
    } catch (error) {
      console.error("Error fetching continents:", error);
      setContinentsError(t("errors.loadContinents", "Nu am putut încărca continentele"));
    } finally {
      setContinentsLoading(false);
    }
  };

  const fetchObjectives = async () => {
    try {
      setObjectivesLoading(true);
      setObjectivesError(null);
      const result = await getFeaturedObjectives(6);
      setRawObjectives(result.data);
    } catch (error) {
      console.error("Error fetching objectives:", error);
      setObjectivesError(t("errors.loadObjectives", "Nu am putut încărca obiectivele"));
    } finally {
      setObjectivesLoading(false);
    }
  };

  const fetchCircuits = async () => {
    try {
      setCircuitsLoading(true);
      setCircuitsError(null);
      const circuits = await getCircuits(true);
      setCircuits(circuits.slice(0, 3));
    } catch (error) {
      console.error("Error fetching circuits:", error);
      setCircuitsError("Nu am putut încărca circuitele");
    } finally {
      setCircuitsLoading(false);
    }
  };

  const fetchArticles = async () => {
    try {
      setArticlesLoading(true);
      setArticlesError(null);
      const result = await getFeaturedArticles(3);
      setArticles(result.data);
    } catch (error) {
      console.error("Error fetching articles:", error);
      setArticlesError("Nu am putut încărca articolele");
    } finally {
      setArticlesLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`${PUBLIC_ROUTES.objectives}?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleCircuitClick = (circuitId: string, circuit: JinfoursCircuit) => {
    trackCircuitClick(
      circuitId,
      circuit.title,
      circuit.countries?.[0] || "Unknown",
      "homepage"
    );
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      generateWebsiteSchema(),
      generateOrganizationSchema(),
    ],
  };

  return (
    <>
      <SEO
        title={t("nav.home")}
        description={seoDefaults.defaultDescription}
        canonical="/"
        structuredData={structuredData}
      />
      {/* Hero Section */}
      <Section className="hero-gradient !py-8 md:!py-12">

        <Container className="text-center">
          <div className="mx-auto max-w-3xl space-y-8 animate-fade-in">
            <h1 className="text-4xl font-display font-bold tracking-tight sm:text-5xl lg:text-6xl text-white">
              {t("hero.title")}
            </h1>
            <p className="text-lg sm:text-xl text-white/90">
              {t("hero.subtitle")}
            </p>
            <p className="text-base sm:text-lg text-white/80 max-w-2xl mx-auto">
              {t("hero.description", "Explorează mii de monumente, muzee, parcuri naturale și situri UNESCO. Informații detaliate pentru fiecare destinație.")}
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder={t("hero.searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/90 border-0"
                  aria-label={t("hero.searchPlaceholder")}
                />
              </div>
              <Button size="lg" type="submit" className="bg-accent hover:bg-accent/90">
                {t("common.search")}
              </Button>
            </form>

            {/* CTA Button */}
            <div className="pt-4">
              <Button
                size="lg"
                asChild
                variant="secondary"
                className="text-lg px-8 py-6"
              >
                <Link to={PUBLIC_ROUTES.objectives}>
                  {t("hero.exploreButton")}
                </Link>
              </Button>
            </div>
          </div>
        </Container>
      </Section>

      {/* Continents Section */}
      <Section variant="default">
        <Container>
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl font-display font-bold tracking-tight sm:text-4xl">
              Explorează pe Continente
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Descoperă obiective turistice din fiecare colț al lumii
            </p>
          </div>

          {/* Loading State */}
          {continentsLoading && (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-48 rounded-lg" />
              ))}
            </div>
          )}

          {/* Error State */}
          {continentsError && (
            <EmptyState
              icon="⚠️"
              title="Eroare la încărcare"
              description={continentsError}
              action={{
                label: "Încearcă din nou",
                onClick: fetchContinents,
              }}
            />
          )}

          {/* Success State */}
          {!continentsLoading && !continentsError && continents.length > 0 && (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {continents.map((continent, index) => (
                <div
                  key={continent.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => trackContinentClick(continent.slug, continent.name)}
                >
                  <ContinentCard continent={continent} />
                </div>
              ))}
            </div>
          )}
        </Container>
      </Section>

      {/* Featured Objectives Section */}
      <Section variant="muted">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold tracking-tight sm:text-4xl">
              Obiective Turistice Populare
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Cele mai vizitate și apreciate destinații
            </p>
          </div>

          {/* Loading State */}
          {objectivesLoading && (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-96 rounded-lg" />
              ))}
            </div>
          )}

          {/* Error State */}
          {objectivesError && (
            <EmptyState
              icon="⚠️"
              title="Eroare la încărcare"
              description={objectivesError}
              action={{
                label: "Încearcă din nou",
                onClick: fetchObjectives,
              }}
            />
          )}

          {/* Empty State */}
          {!objectivesLoading && !objectivesError && objectives.length === 0 && (
            <EmptyState
              icon="🗺️"
              title="Obiectivele turistice vor fi adăugate în curând"
              description="Echipa noastră lucrează la crearea primelor destinații fascinante. Revino în curând pentru a descoperi locuri extraordinare!"
              action={{
                label: "Explorează Continentele",
                onClick: () => {
                  document.getElementById("continents-section")?.scrollIntoView({ behavior: "smooth" });
                },
              }}
            />
          )}

          {/* Success State */}
          {!objectivesLoading && !objectivesError && objectives.length > 0 && (
            <>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {objectives.map((objective, index) => (
                  <div
                    key={objective.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <ObjectiveCard objective={objective} />
                  </div>
                ))}
              </div>

              <div className="text-center mt-12">
                <Button size="lg" asChild>
                  <Link to={PUBLIC_ROUTES.objectives}>
                    Vezi Toate Obiectivele
                  </Link>
                </Button>
              </div>
            </>
          )}
        </Container>
      </Section>

      {/* Jinfotours Circuits Section */}
      <Section className="bg-gradient-to-br from-accent/5 via-accent/10 to-accent/5">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold tracking-tight sm:text-4xl">
              Circuite Complete în Toată Lumea
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Explorează circuite organizate de partenerul nostru Jinfotours
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              În parteneriat cu{" "}
              <a
                href="https://jinfotours.ro"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-primary"
              >
                Jinfotours.ro
              </a>
            </p>
          </div>

          {/* Loading State */}
          {circuitsLoading && (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-[500px] rounded-lg" />
              ))}
            </div>
          )}

          {/* Error State */}
          {circuitsError && (
            <EmptyState
              icon="⚠️"
              title="Eroare la încărcare"
              description={circuitsError}
              action={{
                label: "Încearcă din nou",
                onClick: fetchCircuits,
              }}
            />
          )}

          {/* Empty State */}
          {!circuitsLoading && !circuitsError && circuits.length === 0 && (
            <EmptyState
              icon="✈️"
              title="Circuitele vor fi adăugate în curând"
              description="Pregătim cele mai interesante circuite turistice în colaborare cu Jinfotours"
              action={{
                label: "Vizitează Jinfotours.ro",
                href: "https://jinfotours.ro",
              }}
            />
          )}

          {/* Success State */}
          {!circuitsLoading && !circuitsError && circuits.length > 0 && (
            <>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {circuits.map((circuit, index) => (
                  <div
                    key={circuit.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <CircuitCard
                      circuit={circuit}
                      onCtaClick={(id) => handleCircuitClick(id, circuit)}
                    />
                  </div>
                ))}
              </div>

              <div className="text-center mt-12">
                <Button size="lg" asChild>
                  <Link to={PUBLIC_ROUTES.circuits}>
                    Vezi Toate Circuitele
                  </Link>
                </Button>
              </div>
            </>
          )}
        </Container>
      </Section>

      {/* Blog Preview Section */}
      <Section variant="default">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold tracking-tight sm:text-4xl">
              Ultimele Articole
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Ghiduri de călătorie, sfaturi și povești de aventură
            </p>
          </div>

          {/* Loading State */}
          {articlesLoading && (
            <div className="grid gap-8 md:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-96 rounded-lg" />
              ))}
            </div>
          )}

          {/* Error State */}
          {articlesError && (
            <EmptyState
              icon="⚠️"
              title="Eroare la încărcare"
              description={articlesError}
              action={{
                label: "Încearcă din nou",
                onClick: fetchArticles,
              }}
            />
          )}

          {/* Empty State */}
          {!articlesLoading && !articlesError && articles.length === 0 && (
            <EmptyState
              icon="📝"
              title="Primul articol va fi publicat în curând"
              description="Pregătim ghiduri complete despre cele mai fascinante destinații din întreaga lume"
            />
          )}

          {/* Success State */}
          {!articlesLoading && !articlesError && articles.length > 0 && (
            <>
              <div className="grid gap-8 md:grid-cols-3">
                {articles.map((article, index) => (
                  <div
                    key={article.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <ArticleCard article={article} />
                  </div>
                ))}
              </div>

              <div className="text-center mt-12">
                <Button size="lg" variant="outline" asChild>
                  <Link to={PUBLIC_ROUTES.blog}>Vezi Toate Articolele</Link>
                </Button>
              </div>
            </>
          )}
        </Container>
      </Section>

      {/* Newsletter Section */}
      <Section className="bg-gradient-to-br from-accent via-accent/90 to-primary">
        <Container>
          <div className="text-center space-y-6 max-w-2xl mx-auto">
            <div className="text-5xl mb-4" aria-hidden="true">
              ✉️
            </div>
            <h2 className="text-3xl font-display font-bold tracking-tight sm:text-4xl text-white">
              Primește Ghiduri de Călătorie în Email
            </h2>
            <p className="text-lg text-white/90">
              Descoperă obiective turistice fascinante, sfaturi practice și
              oferte exclusive
            </p>
            <div className="pt-4">
              <NewsletterSignup />
            </div>
          </div>
        </Container>
      </Section>

      {/* Why APOT Section */}
      <Section variant="default">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold tracking-tight sm:text-4xl">
              De Ce APOT?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Platforma ta completă pentru turism mondial
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-3 text-center p-6 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Globe className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-display font-semibold">
                Acoperire Mondială
              </h3>
              <p className="text-muted-foreground">
                Mii de obiective turistice din toată lumea
              </p>
            </div>

            <div className="space-y-3 text-center p-6 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-display font-semibold">
                Informații Detaliate
              </h3>
              <p className="text-muted-foreground">
                Istorii, poze, locații și sfaturi de vizitare
              </p>
            </div>

            <div className="space-y-3 text-center p-6 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-display font-semibold">
                Salvează Favoritele
              </h3>
              <p className="text-muted-foreground">
                Crează liste cu destinațiile tale preferate
              </p>
            </div>

            <div className="space-y-3 text-center p-6 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Search className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-display font-semibold">
                Căutare Avansată
              </h3>
              <p className="text-muted-foreground">
                Filtre după țară, categorie, rating și mai mult
              </p>
            </div>
          </div>
        </Container>
      </Section>

      {/* Featured Guides Section */}
      <FeaturedGuides limit={6} />

      {/* Final CTA Section */}
      <Section className="bg-gradient-to-br from-primary/10 via-accent/10 to-primary/10">
        <Container>
          <div className="text-center space-y-6 max-w-2xl mx-auto">
            <h2 className="text-3xl font-display font-bold tracking-tight sm:text-4xl">
              Începe Aventura Ta Astăzi
            </h2>
            <p className="text-lg text-muted-foreground">
              Explorează lumea cu APOT și descoperă destinații de neuitat
            </p>
            <Button size="lg" asChild className="text-lg px-8 py-6">
              <Link to={PUBLIC_ROUTES.objectives}>
                Vezi Toate Obiectivele
              </Link>
            </Button>
          </div>
        </Container>
      </Section>
    </>
  );
}
