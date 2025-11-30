import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { SEO } from "@/components/seo/SEO";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { CircuitCard } from "@/components/features/circuits/CircuitCard";
import { getCircuits } from "@/lib/supabase/queries/jinfotours";
import { trackCircuitClick } from "@/lib/analytics/events";
import type { JinfoursCircuit } from "@/types/database.types";

/**
 * Circuits Page
 * Dedicated page for Jinfotours partner circuits
 */
export default function CircuitsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [circuits, setCircuits] = useState<JinfoursCircuit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCircuits();
  }, []);

  const fetchCircuits = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCircuits();
      setCircuits(data);
    } catch (error) {
      console.error("Error fetching circuits:", error);
      setError("Nu am putut încărca circuitele");
    } finally {
      setLoading(false);
    }
  };

  const handleCircuitClick = (circuitId: string, circuit: JinfoursCircuit) => {
    trackCircuitClick(
      circuitId,
      circuit.title,
      circuit.countries?.[0] || "Unknown",
      "circuits-page"
    );
  };

  // Filter circuits based on search
  const filteredCircuits = circuits.filter((circuit) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      circuit.title.toLowerCase().includes(query) ||
      circuit.description?.toLowerCase().includes(query) ||
      circuit.countries?.some((c) => c.toLowerCase().includes(query))
    );
  });

  return (
    <>
      <SEO
        title="Circuite Complete în Toată Lumea"
        description="Explorează circuite turistice organizate în colaborare cu Jinfotours. Destinații exotice, oferte speciale și reduceri exclusive."
        canonical="/circuite"
      />

      {/* Hero Section */}
      <Section className="hero-gradient">
        <Container className="text-center">
          <div className="mx-auto max-w-3xl space-y-6 animate-fade-in">
            <h1 className="text-4xl font-display font-bold tracking-tight sm:text-5xl text-white">
              Circuite Complete în Toată Lumea
            </h1>
            <p className="text-lg sm:text-xl text-white/90">
              Explorează destinații extraordinare cu circuite organizate de partenerul nostru Jinfotours
            </p>
            <p className="text-sm text-white/80">
              În parteneriat cu{" "}
              <a
                href="https://jinfotours.ro"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-white"
              >
                Jinfotours.ro
              </a>
            </p>

            {/* Search */}
            <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto pt-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Caută circuite după destinație..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/90 border-0"
                />
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Circuits Grid */}
      <Section variant="default">
        <Container>
          {/* Loading State */}
          {loading && (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-[500px] rounded-lg" />
              ))}
            </div>
          )}

          {/* Error State */}
          {error && (
            <EmptyState
              icon="⚠️"
              title="Eroare la încărcare"
              description={error}
              action={{
                label: "Încearcă din nou",
                onClick: fetchCircuits,
              }}
            />
          )}

          {/* Empty State */}
          {!loading && !error && filteredCircuits.length === 0 && (
            <EmptyState
              icon="✈️"
              title={searchQuery ? "Niciun circuit găsit" : "Circuitele vor fi adăugate în curând"}
              description={
                searchQuery
                  ? "Încearcă să cauți alte destinații"
                  : "Pregătim cele mai interesante circuite turistice în colaborare cu Jinfotours"
              }
              action={{
                label: "Vizitează Jinfotours.ro",
                href: "https://jinfotours.ro",
              }}
            />
          )}

          {/* Success State */}
          {!loading && !error && filteredCircuits.length > 0 && (
            <>
              <div className="mb-6 text-center">
                <p className="text-muted-foreground">
                  {filteredCircuits.length} {filteredCircuits.length === 1 ? "circuit" : "circuite"} disponibil
                  {filteredCircuits.length !== 1 ? "e" : ""}
                  {searchQuery && ` pentru "${searchQuery}"`}
                </p>
              </div>

              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {filteredCircuits.map((circuit, index) => (
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
            </>
          )}

          {/* CTA */}
          {!loading && !error && filteredCircuits.length > 0 && (
            <div className="text-center mt-12">
              <Button
                size="lg"
                asChild
                variant="default"
              >
                <a
                  href="https://jinfotours.ro"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Vezi toate circuitele pe Jinfotours.ro
                </a>
              </Button>
            </div>
          )}
        </Container>
      </Section>
    </>
  );
}
