import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { SEO } from "@/components/seo/SEO";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, MapPin, MessageSquare, Shield } from "lucide-react";
import { siteConfig } from "@/lib/config/site.config";
import { ContactForm } from "@/components/features/contact/ContactForm";

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
    <div className="min-h-screen bg-slate-50/50">
      <SEO
        title="Contact"
        description="Contactează echipa APOT pentru întrebări, sugestii sau parteneriate. Suntem aici să te ajutăm cu informații despre obiective turistice."
        canonical="/contact"
        structuredData={structuredData}
      />

      {/* =============================================
        1. HERO SECTION (Dark Style)
        ============================================= */}
      <div className="bg-[#0F172A] text-white border-b border-white/10">
        <Container className="py-16 md:py-24">
          <div className="max-w-3xl space-y-6">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 px-3 py-1">
              <MessageSquare className="h-3.5 w-3.5 mr-2" />
              Suport și Parteneriate
            </Badge>
            <h1 className="text-4xl md:text-[2.75rem] font-bold tracking-tight leading-tight">
              Suntem aici să <span className="text-primary">te ajutăm</span>
            </h1>
            <p className="text-lg text-slate-400 leading-relaxed max-w-2xl">
              Ai o întrebare despre platformă sau vrei să devii partenerul nostru? Trimite-ne un mesaj și echipa APOT îți va răspunde în cel mai scurt timp.
            </p>
          </div>
        </Container>
      </div>

      {/* =============================================
        2. CONTACT INFO CARDS
        ============================================= */}
      <Container className="-mt-12 relative z-10 mb-16">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { 
              icon: Mail, 
              title: "Email", 
              value: siteConfig.contact.email, 
              desc: "Răspundem în max. 24h" 
            },
            { 
              icon: Phone, 
              title: "Telefon", 
              value: siteConfig.contact.phone, 
              desc: "Luni - Vineri, 09:00 - 18:00" 
            },
            { 
              icon: MapPin, 
              title: "Locație", 
              value: "România", 
              desc: "Prezență națională" 
            },
          ].map((item, idx) => (
            <Card key={idx} className="p-8 border-slate-200 shadow-lg rounded-2xl bg-white flex flex-col items-center text-center group hover:border-primary/30 transition-all duration-300">
              <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                <item.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-1">{item.title}</h3>
              <p className="font-medium text-primary mb-2">{item.value}</p>
              <p className="text-sm text-slate-400">{item.desc}</p>
            </Card>
          ))}
        </div>
      </Container>

      {/* =============================================
        3. FORM SECTION
        ============================================= */}
      <Container className="pb-24">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Info Side */}
          <div className="space-y-8 py-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Trimite-ne un mesaj</h2>
              <p className="text-slate-500 leading-relaxed">
                Completează formularul alăturat, iar un consultant APOT va prelua solicitarea ta. 
                Fie că ești călător în căutare de informații sau ghid care dorește să se înscrie, 
                suntem gata să colaborăm.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex gap-4 p-4 rounded-xl bg-white border border-slate-100">
                <div className="shrink-0 w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                  <Shield className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Date securizate</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Informațiile tale sunt protejate conform GDPR.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Side */}
          <Card className="p-8 md:p-10 shadow-xl border-slate-200 rounded-[2rem] bg-white">
            <ContactForm />
          </Card>
        </div>
      </Container>
    </div>
  );
}