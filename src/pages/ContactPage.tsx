import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { SEO } from "@/components/seo/SEO";
import { Card } from "@/components/ui/card";
import { Mail, Phone, MapPin } from "lucide-react";
import { siteConfig } from "@/lib/config/site.config";

export default function ContactPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact APOT",
    url: `${siteConfig.url}/contact`,
    contactPoint: {
      "@type": "ContactPoint",
      email: siteConfig.contact.email,
      telephone: siteConfig.contact.phone,
      contactType: "Customer Service",
      areaServed: "RO",
      availableLanguage: ["Romanian", "English"],
    },
  };

  return (
    <>
      <SEO
        title="Contact"
        description="Contactează echipa APOT pentru întrebări, sugestii sau parteneriate. Suntem aici să te ajutăm cu informații despre obiective turistice."
        canonical="/contact"
        structuredData={structuredData}
      />
      <Section>
        <Container maxWidth="lg">
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-display font-bold tracking-tight">
                Contact
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Ia legătura cu noi pentru întrebări sau sugestii
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <Card className="p-6 text-center space-y-3">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold">Email</h3>
                <p className="text-sm text-muted-foreground">
                  {siteConfig.contact.email}
                </p>
              </Card>

              <Card className="p-6 text-center space-y-3">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold">Telefon</h3>
                <p className="text-sm text-muted-foreground">
                  {siteConfig.contact.phone}
                </p>
              </Card>

              <Card className="p-6 text-center space-y-3">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold">Locație</h3>
                <p className="text-sm text-muted-foreground">România</p>
              </Card>
            </div>

            <Card className="p-8">
              <p className="text-center text-muted-foreground">
                Formular de contact funcțional va fi implementat în fazele următoare
              </p>
            </Card>
          </div>
        </Container>
      </Section>
    </>
  );
}
