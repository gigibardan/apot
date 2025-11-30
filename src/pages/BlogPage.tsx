import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";

export default function BlogPage() {
  return (
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
  );
}
