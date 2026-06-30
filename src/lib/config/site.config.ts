/**
 * Site-wide configuration
 * Central place for all site metadata and links
 */

export const siteConfig = {
  name: "APOT",
  fullName: "Asociația pentru Protejarea Obiectivelor Turistice",
  description: "Platformă mondială cu informații detaliate despre obiective turistice din întreaga lume. Descoperă monumente, muzee, parcuri naturale și situri UNESCO.",
  // IMPORTANT: nu mai folosim window.location.origin aici.
  // În timpul prerender-ului local (Playwright -> vite preview pe localhost),
  // window.location.origin ar fi "http://localhost:4173", ceea ce ar strica
  // toate URL-urile canonice/og/hreflang din HTML-ul generat static.
  // Domeniul de producție e fix, deci îl punem direct.
  url: "https://apot.club",
  ogImage: "/images/og-image.jpg",
  locale: "ro-RO",
  links: {
    facebook: "https://facebook.com/apot",
    instagram: "https://instagram.com/apot",
    youtube: "https://youtube.com/@apot",
    jinfotours: "https://jinfotours.ro",
  },
  contact: {
    email: "contact@apot.club",
    phone: "+40 XXX XXX XXX",
  },
} as const;

export type SiteConfig = typeof siteConfig;