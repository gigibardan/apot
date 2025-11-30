/**
 * Site-wide configuration
 * Central place for all site metadata and links
 */

export const siteConfig = {
  name: "APOT",
  fullName: "Asociația pentru Protejarea Obiectivelor Turistice",
  description: "Platformă mondială cu informații detaliate despre obiective turistice din întreaga lume. Descoperă monumente, muzee, parcuri naturale și situri UNESCO.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ogImage: "/images/og-image.jpg",
  locale: "ro-RO",
  links: {
    facebook: "https://facebook.com/apot",
    instagram: "https://instagram.com/apot",
    youtube: "https://youtube.com/@apot",
    jinfotours: "https://jinfotours.ro",
  },
  contact: {
    email: "contact@apot.ro",
    phone: "+40 XXX XXX XXX",
  },
} as const;

export type SiteConfig = typeof siteConfig;
