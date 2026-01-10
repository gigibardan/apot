import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { SEO } from "@/components/seo/SEO";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { siteConfig } from "@/lib/config/site.config";
import { Shield, Target, Users, Globe } from "lucide-react";

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
    <div className="min-h-screen bg-white">
      <SEO
        title="Despre APOT"
        description="Asociația pentru Protejarea Obiectivelor Turistice (APOT) - Misiunea noastră de a proteja și promova patrimoniul turistic mondial."
        canonical="/despre"
        structuredData={structuredData}
      />

      {/* =============================================
        1. HERO SECTION (Unitate vizuală cu restul site-ului)
        ============================================= */}
      <div className="bg-[#0F172A] text-white border-b border-white/10">
        <Container className="py-16 md:py-24 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 px-3 py-1">
              Misiunea Noastră
            </Badge>
            <h1 className="text-4xl md:text-[2.75rem] font-bold tracking-tight leading-tight">
              Păstrăm <span className="text-primary">Patrimoniul</span> pentru Viitor
            </h1>
            <p className="text-lg text-slate-400 leading-relaxed">
              Asociația pentru Protejarea Obiectivelor Turistice (APOT) s-a născut din pasiunea pentru explorare responsabilă și dorința de a conserva bogăția culturală a lumii.
            </p>
          </div>
        </Container>
      </div>

      {/* =============================================
        2. CONTENT & MISSION
        ============================================= */}
      <Container className="py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
          <div className="space-y-6 text-slate-600 leading-relaxed text-lg">
            <h2 className="text-3xl font-bold text-slate-900">Cine suntem</h2>
            <p>
              Suntem o comunitate de profesioniști în turism, istorici și entuziaști dedicați promovării unui turism etic. Credem că fiecare obiectiv turistic, de la celebrele monumente istorice până la colțurile ascunse ale naturii, merită respectul și protecția noastră colectivă.
            </p>
            <p>
              Prin platforma noastră, conectăm călătorii cu resurse educaționale și ghizi autorizați, asigurându-ne că experiența turistică aduce plus valoare atât vizitatorului, cât și comunității locale care găzduiește aceste comori.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-6 border-slate-100 shadow-md flex flex-col items-center text-center space-y-3 rounded-2xl">
              <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
                <Shield className="h-6 w-6 text-orange-600" />
              </div>
              <span className="font-bold text-slate-900">Protecție</span>
            </Card>
            <Card className="p-6 border-slate-100 shadow-md flex flex-col items-center text-center space-y-3 rounded-2xl lg:mt-8">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <Globe className="h-6 w-6 text-blue-600" />
              </div>
              <span className="font-bold text-slate-900">Promovare</span>
            </Card>
            <Card className="p-6 border-slate-100 shadow-md flex flex-col items-center text-center space-y-3 rounded-2xl">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <span className="font-bold text-slate-900">Comunitate</span>
            </Card>
            <Card className="p-6 border-slate-100 shadow-md flex flex-col items-center text-center space-y-3 rounded-2xl lg:mt-8">
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
              <span className="font-bold text-slate-900">Educație</span>
            </Card>
          </div>
        </div>

        {/* =============================================
          3. VALUES (Sleek Horizontal Section)
          ============================================= */}
        <div className="bg-slate-50 rounded-[3rem] p-12 md:p-16 border border-slate-100">
          <div className="max-w-2xl mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Valorile APOT</h2>
            <p className="text-slate-500">Pilonii pe care ne construim întreaga activitate de promovare turistică.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            <div className="space-y-3">
              <h3 className="font-bold text-xl text-primary">Transparență</h3>
              <p className="text-slate-600">Oferim informații corecte și verificate despre destinațiile noastre, fără a ascunde provocările conservării acestora.</p>
            </div>
            <div className="space-y-3">
              <h3 className="font-bold text-xl text-primary">Integritate</h3>
              <p className="text-slate-600">Colaborăm exclusiv cu ghizi și parteneri care împărtășesc standardele noastre ridicate de etică profesională.</p>
            </div>
            <div className="space-y-3">
              <h3 className="font-bold text-xl text-primary">Sustenabilitate</h3>
              <p className="text-slate-600">Încurajăm vizitarea responsabilă care reduce impactul asupra mediului și sprijină economia locală.</p>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}