import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { SEO } from "@/components/seo/SEO";

export default function BlogPage() {
  return (
    <>
      <SEO
        title="Blog"
        description="Ghiduri de călătorie, sfaturi pentru turiști și povești inspiraționale din întreaga lume. Citește articolele noastre despre destinații de vis."
        canonical="/blog"
      />
      <Section>
        <Container>
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-display font-bold tracking-tight">
              Blog
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Coming soon - Articole și ghiduri de călătorie
            </p>
          </div>
        </Container>
      </Section>
    </>
  );
}
