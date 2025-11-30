import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { SEO } from "@/components/seo/SEO";
import { siteConfig } from "@/lib/config/site.config";

export default function AboutPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.fullName,
    alternateName: siteConfig.name,
    url: siteConfig.url,
    description: "Asociație dedicată protejării și promovării obiectivelor turistice din întreaga lume",
    sameAs: [
      siteConfig.links.facebook,
      siteConfig.links.instagram,
      siteConfig.links.youtube,
    ],
  };

  return (
    <>
      <SEO
        title="Despre APOT"
        description="Asociația pentru Protejarea Obiectivelor Turistice (APOT) - Misiunea noastră de a proteja și promova patrimoniul turistic mondial."
        canonical="/despre"
        structuredData={structuredData}
      />
      <Section>
        <Container>
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-display font-bold tracking-tight">
                Despre APOT
              </h1>
              <p className="text-lg text-muted-foreground">
                Asociația pentru Protejarea Obiectivelor Turistice
              </p>
            </div>

            <div className="prose prose-lg dark:prose-invert mx-auto">
              <p>
                Coming soon - Conținutul complet despre misiunea și valorile APOT
                va fi adăugat în curând.
              </p>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
