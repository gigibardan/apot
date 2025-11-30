import { Link } from "react-router-dom";
import { Search, MapPin, Heart, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { SEO } from "@/components/seo/SEO";
import { PUBLIC_ROUTES } from "@/lib/constants/routes";
import { seoDefaults } from "@/lib/constants/seo-defaults";

/**
 * Homepage
 * Main landing page with hero, features preview, and CTAs
 */
export default function HomePage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "APOT",
    url: "https://apot.ro",
    description: seoDefaults.defaultDescription,
    potentialAction: {
      "@type": "SearchAction",
      target: "https://apot.ro/obiective?search={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <SEO
        title="Acasă"
        description={seoDefaults.defaultDescription}
        canonical="/"
        structuredData={structuredData}
      />
      {/* Hero Section */}
      <Section className="hero-gradient">
        <Container className="text-center">
          <div className="mx-auto max-w-3xl space-y-8 animate-fade-in">
            <h1 className="text-4xl font-display font-bold tracking-tight sm:text-5xl lg:text-6xl text-white">
              Descoperă Obiective Turistice din Toată Lumea
            </h1>
            <p className="text-lg sm:text-xl text-white/90">
              Asociația pentru Protejarea Obiectivelor Turistice
            </p>
            <p className="text-base sm:text-lg text-white/80 max-w-2xl mx-auto">
              Explorează mii de monumente, muzee, parcuri naturale și situri
              UNESCO. Informații detaliate pentru fiecare destinație.
            </p>

            {/* Search Bar (disabled for now) */}
            <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Caută obiective turistice..."
                  disabled
                  className="pl-10 bg-white/90 border-0"
                  aria-label="Caută obiective turistice"
                />
              </div>
              <Button size="lg" disabled className="bg-accent hover:bg-accent/90">
                Caută
              </Button>
            </div>
            <p className="text-sm text-white/70">
              Coming soon - În dezvoltare
            </p>

            {/* CTA Button */}
            <div className="pt-4">
              <Button
                size="lg"
                asChild
                variant="secondary"
                className="text-lg px-8 py-6"
              >
                <Link to={PUBLIC_ROUTES.objectives}>
                  Explorează Obiective
                </Link>
              </Button>
            </div>
          </div>
        </Container>
      </Section>

      {/* Features Preview */}
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

      {/* Coming Soon Sections */}
      <Section variant="muted">
        <Container>
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="space-y-4">
              <h2 className="text-2xl font-display font-bold tracking-tight">
                Obiective Turistice Populare
              </h2>
              <p className="text-muted-foreground">
                Coming soon - Lista cu cele mai populare obiective turistice va
                fi disponibilă în curând.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-display font-bold tracking-tight">
                Articole Blog Recente
              </h2>
              <p className="text-muted-foreground">
                Coming soon - Ghiduri de călătorie, sfaturi și povești din
                jurul lumii.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      {/* CTA Section */}
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
