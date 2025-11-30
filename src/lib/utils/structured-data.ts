/**
 * Structured Data (JSON-LD) generators for SEO
 * Creates schema.org markup for better search engine understanding
 */

import { siteConfig } from "@/lib/config/site.config";
import type { ObjectiveWithRelations, BlogArticle } from "@/types/database.types";

/**
 * Generate Organization structured data
 */
export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.fullName,
    alternateName: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/images/logo.png`,
    description: "Platformă mondială cu informații detaliate despre obiective turistice din întreaga lume",
    sameAs: [
      siteConfig.links.facebook,
      siteConfig.links.instagram,
      siteConfig.links.youtube,
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Service",
      availableLanguage: ["Romanian", "English"],
    },
  };
}

/**
 * Generate WebSite structured data with search action
 */
export function generateWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.fullName,
    url: siteConfig.url,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteConfig.url}/obiective?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * Generate TouristAttraction structured data for objectives
 */
export function generateObjectiveSchema(objective: ObjectiveWithRelations) {
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    name: objective.title,
    description: objective.excerpt || objective.description,
    url: `${siteConfig.url}/obiective/${objective.slug}`,
  };

  // Featured image
  if (objective.featured_image) {
    schema.image = objective.featured_image;
  }

  // Location
  if (objective.country) {
    schema.address = {
      "@type": "PostalAddress",
      addressCountry: objective.country.name,
      addressLocality: objective.location_text,
    };
  }

  // Geo coordinates
  if (objective.latitude && objective.longitude) {
    schema.geo = {
      "@type": "GeoCoordinates",
      latitude: objective.latitude,
      longitude: objective.longitude,
    };
  }

  // Opening hours
  if (objective.opening_hours) {
    schema.openingHours = objective.opening_hours;
  }

  // Additional properties
  if (objective.website_url) {
    schema.sameAs = objective.website_url;
  }

  // UNESCO heritage
  if (objective.unesco_site) {
    schema.additionalProperty = {
      "@type": "PropertyValue",
      name: "UNESCO World Heritage Site",
      value: objective.unesco_year ? `Inscribed ${objective.unesco_year}` : "Yes",
    };
  }

  return schema;
}

/**
 * Generate Article structured data for blog posts
 */
export function generateArticleSchema(article: BlogArticle) {
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.excerpt || article.meta_description,
    url: `${siteConfig.url}/blog/${article.slug}`,
    datePublished: article.published_at || article.created_at,
    dateModified: article.updated_at,
    author: {
      "@type": "Organization",
      name: siteConfig.fullName,
      url: siteConfig.url,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.fullName,
      url: siteConfig.url,
      logo: {
        "@type": "ImageObject",
        url: `${siteConfig.url}/images/logo.png`,
      },
    },
  };

  // Featured image
  if (article.featured_image) {
    schema.image = {
      "@type": "ImageObject",
      url: article.featured_image,
    };
  }

  // Reading time
  if (article.reading_time) {
    schema.timeRequired = `PT${article.reading_time}M`;
  }

  // Category
  if (article.category) {
    schema.articleSection = article.category;
  }

  // Tags as keywords
  if (article.tags && article.tags.length > 0) {
    schema.keywords = article.tags.join(", ");
  }

  return schema;
}

/**
 * Generate Guide/Person structured data
 */
export function generateGuideSchema(guide: any) {
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: guide.full_name,
    description: guide.short_description || guide.bio,
    url: `${siteConfig.url}/ghizi/${guide.slug}`,
    jobTitle: "Tour Guide",
  };

  // Profile image
  if (guide.profile_image) {
    schema.image = guide.profile_image;
  }

  // Contact info
  if (guide.email) {
    schema.email = guide.email;
  }

  if (guide.phone) {
    schema.telephone = guide.phone;
  }

  if (guide.website_url) {
    schema.sameAs = guide.website_url;
  }

  // Languages
  if (guide.languages && guide.languages.length > 0) {
    schema.knowsLanguage = guide.languages;
  }

  // Rating
  if (guide.rating_average && guide.reviews_count > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: guide.rating_average,
      reviewCount: guide.reviews_count,
      bestRating: 5,
      worstRating: 1,
    };
  }

  return schema;
}

/**
 * Generate BreadcrumbList structured data
 */
export function generateBreadcrumbSchema(items: Array<{ name: string; url?: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      ...(item.url ? { item: `${siteConfig.url}${item.url}` } : {}),
    })),
  };
}

/**
 * Generate FAQ structured data
 */
export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}
