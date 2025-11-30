import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";

export default function AboutPage() {
  return (
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
  );
}
