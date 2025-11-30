import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { SEO } from "@/components/seo/SEO";

export default function ObjectivesPage() {
  return (
    <>
      <SEO
        title="Obiective Turistice"
        description="Explorează mii de obiective turistice din întreaga lume - monumente, muzee, parcuri naturale, situri UNESCO și multe altele."
        canonical="/obiective"
      />
      <Section>
        <Container>
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-display font-bold tracking-tight">
              Obiective Turistice
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Coming soon - Lista completă cu obiective turistice va fi disponibilă în curând
            </p>
          </div>
        </Container>
      </Section>
    </>
  );
}
