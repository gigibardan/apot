/**
 * SEO default values
 * Used across the application for meta tags and Open Graph
 */

import { siteConfig } from "@/lib/config/site.config";

export const seoDefaults = {
  defaultTitle: "APOT - Asociația pentru Protejarea Obiectivelor Turistice",
  titleTemplate: "%s | APOT - Descoperă Obiective Turistice",
  defaultDescription:
    "Platformă mondială cu informații detaliate despre obiective turistice din întreaga lume. Descoperă monumente, muzee, parcuri naturale, situri UNESCO și multe altele.",
  defaultOgImage: "/images/og-default.jpg",
  defaultOgType: "website",
  twitterCard: "summary_large_image",
  twitterSite: "@APOT",
  keywords: [
    "obiective turistice",
    "turism mondial",
    "monumente",
    "muzee",
    "parcuri naturale",
    "situri UNESCO",
    "călătorii",
    "travel",
    "România",
  ],
  structuredData: {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.fullName,
    url: siteConfig.url,
    logo: `${siteConfig.url}/images/logo.png`,
    sameAs: [
      siteConfig.links.facebook,
      siteConfig.links.instagram,
      siteConfig.links.youtube,
    ],
  },
} as const;

export type SeoDefaults = typeof seoDefaults;
